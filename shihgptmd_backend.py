import os
import datetime
import time # For sleep
import threading # For running watchdog in a separate thread
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
# GEMINI_API_KEY is now expected as an environment variable
GEMINI_MODEL = "gemini-1.5-pro-latest" # Changed to a more standard large model for testing
NOTES_DIRECTORY = r"C:\Users\phili\OneDrive\Desktop\ShihGPTMD" # This is where notes are saved AND where we watch for new inputs.
                                                            # Consider separate input/output folders later if needed.
INPUT_FILE_EXTENSION = ".txt" # Watch for .txt files for now

# Load API Key from environment variable
# Try 'GEMINI_API_KEY' first, then 'GOOGLE_API_KEY' as a fallback based on error message
API_KEY_TO_USE = os.environ.get("GEMINI_API_KEY")
if not API_KEY_TO_USE:
    print("GEMINI_API_KEY environment variable not found. Trying GOOGLE_API_KEY...")
    API_KEY_TO_USE = os.environ.get("GOOGLE_API_KEY")

if not API_KEY_TO_USE:
    print("CRITICAL ERROR: Neither GEMINI_API_KEY nor GOOGLE_API_KEY environment variable is set.")
    print("Please set one of these environment variables before running the script.")
    # For Flask, genai.configure will fail if API_KEY_TO_USE is None, leading to an error on first API call.
    # This print is for startup diagnostics.

# Configure the Gemini API client
genai.configure(api_key=API_KEY_TO_USE)

# Core ShihGPT-MD Instructions - To be prepended by the backend (CONCISE VERSION)
SHIHGPTMD_SYSTEM_INSTRUCTION = "You are ShihGPT-MD, an attending-level physician AI. Prioritize accuracy, PII removal (names, MRNs), and adherence to user-specified formatting (SHN, VSHN, templates) and content requests (pathophysiology, guidelines, etc.) from the dynamic prompt."

SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS = """
Key Tasks:
1. New Patient: Generate guideline-concordant questions, initial impression, and A&P.
2. Updates: Integrate new info into the correct note section. Identify missing data if critical.
3. Note Structure: Always include Impression, Subjective (HPI, relevant PMH/SHx/FHx/ROS), Objective (vitals, PE, labs/imaging if available), and a fully reasoned Assessment & Plan (differential, likely Dx, brief pathophys, interventions, F/U).

Refer to the 'Dynamic Request from Frontend' for specific output format, detail level, and other user preferences for THIS request.
"""

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing requests from your GitHub Pages site

# --- Helper Functions (largely same as before) ---

def get_llm_response(dynamic_prompt_from_frontend):
    """
    Combines core instructions with dynamic prompt and sends to Gemini API.
    Returns the response text and any prompt feedback.
    """
    try:
        # Combine backend instructions with the dynamic part from the frontend
        full_prompt_to_gemini = f"{SHIHGPTMD_SYSTEM_INSTRUCTION}\n\n{SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS}\n\nDynamic Request from Frontend:\n---\n{dynamic_prompt_from_frontend}\n---"
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        # print(f"DEBUG: Sending combined prompt to Gemini model {GEMINI_MODEL} (first 500 chars):\n{full_prompt_to_gemini[:500]}...")
        print(f"Sending combined prompt to Gemini model {GEMINI_MODEL}...")

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=4096 # Re-adding with a moderate value
        )
        response = model.generate_content(full_prompt_to_gemini, generation_config=generation_config)
        
        feedback_str = ""
        if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
            feedback_str = f"Prompt Feedback: {response.prompt_feedback}"
            print(feedback_str) # Log it on backend

        # Correctly check against the enum value for STOP
        if response.candidates and response.candidates[0].finish_reason == genai.types.Candidate.FinishReason.STOP:
            if response.candidates[0].content and response.candidates[0].content.parts:
                return response.candidates[0].content.parts[0].text, feedback_str
            else:
                print("Gemini API response has no content parts.")
                return "Error: No content in response from Gemini.", feedback_str
        else:
            reason = response.candidates[0].finish_reason if (response.candidates and len(response.candidates) > 0) else 'Unknown reason (no candidates)'
            error_detail = f"Gemini API call did not finish successfully. Finish reason: {reason}"
            print(error_detail)
            print("--- Full Gemini Response (or parts if very large) ---")
            try:
                # Attempt to print the response object, which might be large.
                # Be cautious with very large responses in production logs.
                print(f"Raw response object: {response}") 
                if response.candidates:
                    print(f"Candidate details: {response.candidates[0]}")
            except Exception as print_e:
                print(f"Error trying to print full response details: {print_e}")
            # No specific 'response.error' attribute, error details are usually in finish_reason or prompt_feedback for safety issues
            return f"Error: {error_detail}", feedback_str
            
    except Exception as e:
        print(f"Error calling Google Gemini API: {e}")
        return f"Error: Exception during API call - {str(e)}", "" # No feedback string on general exception

def generate_filename(service_abbreviation):
    """
    Generates a filename based on service, current time, and date.
    Format: temp_ps_notedraft_[SERVICE]_[TIME].[DATE].txt
    Time: HHMM (military)
    Date: MM.DD.YYYY
    """
    now = datetime.datetime.now()
    time_str = now.strftime("%H%M")
    date_str = now.strftime("%m.%d.%Y")
    
    # Sanitize service_abbreviation to ensure it's filesystem-friendly
    safe_service_abbr = "".join(c if c.isalnum() else "_" for c in service_abbreviation)
    if not safe_service_abbr:
        safe_service_abbr = "unknown_service"
        
    filename = f"temp_ps_notedraft_{safe_service_abbr}_{time_str}_{date_str}.txt"
    return filename

def save_note_to_file(filename, content):
    """
    Saves the content to a file in the specified notes directory.
    Creates the directory if it doesn't exist.
    """
    # Ensure notes directory exists
    if not os.path.exists(NOTES_DIRECTORY):
        try:
            os.makedirs(NOTES_DIRECTORY)
            print(f"Created directory: {NOTES_DIRECTORY}")
        except OSError as e: # More specific exception
            print(f"Error creating directory {NOTES_DIRECTORY}: {e}")
            return False # Indicate failure
            
    filepath = os.path.join(NOTES_DIRECTORY, filename)
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Note successfully saved to: {filepath}")
        return True
    except Exception as e:
        print(f"Error saving note to file {filepath}: {e}")
        return False

# --- Watchdog File Event Handler ---
class NewFileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(INPUT_FILE_EXTENSION):
            print(f"New input file detected: {event.src_path}")
            # Wait a bit for the file to be fully written, especially for larger files or network drives
            time.sleep(2) 
            
            try:
                with open(event.src_path, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                
                if not file_content.strip():
                    print(f"File {event.src_path} is empty. Skipping.")
                    return

                # Construct a default prompt for auto-processed files
                # This is a simplified prompt. You might want to make this more configurable.
                auto_prompt = f"""You are ShihGPT-MD, an attending-level physician model.
Remove all patient names and MRNs.
Reanalyze every question and recommendation for accuracy with the rigor of an attending.

The following patient information was provided from an automatically processed file:
---
{file_content}
---

Core Instructions:
- Generate a concise clinical note based on the provided information.
- If this is a new patient, generate initial questions based on their case that are thorough, guideline-concordant, and relevant for diagnostic clarity. Also begin a working impression and full assessment and plan using available data. Use current clinical guidelines where appropriate.
- Include:
    - Impression: 1-liner with age, sex (if known), relevant background, and primary concern or diagnosis
    - Subjective: HPI + relevant PMH, SHx, FHx, ROS
    - Objective: Include available vitals, PE, labs/imaging
    - Assessment & Plan: Fully reasoned differential, most likely diagnosis, relevant pathophysiology, and plan with specific interventions and follow-up
---
BEGIN MODEL RESPONSE BASED ON ABOVE INSTRUCTIONS AND PATIENT DATA:
"""
                # The 'auto_prompt' here is the dynamic part for file-based inputs.
                # The get_llm_response function will prepend the static core instructions.
                print(f"Processing content from: {event.src_path} as dynamic prompt for file watcher.")
                llm_text_output, prompt_feedback_details = get_llm_response(auto_prompt) 

                if prompt_feedback_details:
                    print(f"File Watcher - Prompt Feedback for {event.src_path}: {prompt_feedback_details}")

                if llm_text_output and not llm_text_output.startswith("Error:"):
                    original_filename = os.path.basename(event.src_path)
                    service_abbr_auto = "AUTO_FROM_" + os.path.splitext(original_filename)[0]
                    output_note_filename = generate_filename(service_abbr_auto)
                    save_note_to_file(output_note_filename, llm_text_output)
                    print(f"LLM response for {original_filename} saved to {output_note_filename}")
                else:
                    print(f"Failed to get LLM response for {event.src_path}. Details: {llm_text_output}")

            except Exception as e:
                print(f"Error processing file {event.src_path}: {e}")

# --- Flask Routes ---
@app.route('/generate_note', methods=['POST'])
def handle_generate_note():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    full_prompt = data.get('prompt')
    service_abbr = data.get('service_abbreviation', 'GENERAL').strip().upper()

    if not full_prompt:
        return jsonify({"error": "No prompt provided in request"}), 400
    if not service_abbr:
        service_abbr = "GENERAL" # Default if empty after stripping

    print(f"Received request for service: {service_abbr}")
    # 'full_prompt' from the frontend is now considered the 'dynamic_prompt_from_frontend'
    llm_text_output, prompt_feedback_details = get_llm_response(full_prompt) 

    response_data = {"prompt_feedback": prompt_feedback_details if prompt_feedback_details else "N/A"}

    if llm_text_output and not llm_text_output.startswith("Error:"):
        note_filename = generate_filename(service_abbr)
        if save_note_to_file(note_filename, llm_text_output):
            response_data["message"] = "Note generated and saved successfully."
            response_data["filename"] = note_filename
            response_data["llm_response"] = llm_text_output
            return jsonify(response_data), 200
        else:
            response_data["error"] = "Failed to save the note."
            return jsonify(response_data), 500
    else:
        response_data["error"] = "Failed to get a valid response from LLM."
        # llm_text_output already contains the error message from get_llm_response
        response_data["details"] = llm_text_output 
        return jsonify(response_data), 500

def start_file_watcher():
    # This function is now correctly defined at the top level.
    if not os.path.exists(NOTES_DIRECTORY):
        print(f"Watch directory {NOTES_DIRECTORY} does not exist. Please create it or check the path.")
        print("File watcher not started.")
        return

    event_handler = NewFileHandler()
    observer = Observer()
    observer.schedule(event_handler, NOTES_DIRECTORY, recursive=False) # Non-recursive: only watch top-level of NOTES_DIRECTORY
    observer.start()
    print(f"File watcher started on directory: {NOTES_DIRECTORY} (watching for new {INPUT_FILE_EXTENSION} files)")
    try:
        while True:
            time.sleep(5) # Keep the thread alive
    except KeyboardInterrupt: # This won't be caught here if Flask is main thread
        observer.stop()
    except Exception as e:
        print(f"File watcher error: {e}")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    # Start the file watcher in a separate thread
    watcher_thread = threading.Thread(target=start_file_watcher, daemon=True)
    watcher_thread.start()

    print(f"Starting ShihGPT-MD Flask server on http://127.0.0.1:5000")
    print(f"Notes will be saved in: {os.path.abspath(NOTES_DIRECTORY)}")
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False) # use_reloader=False is important when running watchdog in a thread
                                                                    # to prevent it from starting twice in debug mode.
                                               # host='0.0.0.0' makes it accessible on your local network.
