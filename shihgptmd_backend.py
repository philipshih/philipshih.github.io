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
GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"
NOTES_DIRECTORY = r"C:\Users\phili\OneDrive\Desktop\ShihGPTMD" # This is where notes are saved AND where we watch for new inputs.
                                                            # Consider separate input/output folders later if needed.
INPUT_FILE_EXTENSION = ".txt" # Watch for .txt files for now

# Load API Key from environment variable
GEMINI_API_KEY_FROM_ENV = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY_FROM_ENV:
    print("CRITICAL ERROR: The GEMINI_API_KEY environment variable is not set.")
    print("Please set this environment variable before running the script.")
    # exit(1) # Or raise an exception to stop execution if not running as a server that needs to start first
    # For Flask, it's better to let it start and fail on request, or check before app.run
    # For now, genai.configure will fail if key is None.

# Configure the Gemini API client
genai.configure(api_key=GEMINI_API_KEY_FROM_ENV)

# Core ShihGPT-MD Instructions - To be prepended by the backend
SHIHGPTMD_SYSTEM_INSTRUCTION = "You are ShihGPT-MD, an attending-level physician model. Remove all patient names and MRNs. Reanalyze every question and recommendation for accuracy with the rigor of an attending. Follow all formatting and content instructions precisely based on the user's request and the core operational instructions."

SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS = """
Core Operational Instructions for ShihGPT-MD:
- If this is a new patient, generate initial questions based on their case that are thorough, guideline-concordant, and relevant for diagnostic clarity. Also begin a working impression and full assessment and plan using available data. Use current clinical guidelines where appropriate.
- Update the note each time new information (text, image, audio) is received, placing the new content in the appropriate section. If data is missing (e.g. vital signs, labs, imaging), state which ones are needed, why, and under what criteria.
- Include in the output note:
    - Impression: 1-liner with age, sex (if known), relevant background, and primary concern or diagnosis
    - Subjective: HPI + relevant PMH, SHx, FHx, ROS
    - Objective: Include available vitals, PE, labs/imaging
    - Assessment & Plan: Fully reasoned differential, most likely diagnosis, relevant pathophysiology, and plan with specific interventions and follow-up

(The dynamic part of the prompt from the user will specify output formatting like SHN/VSHN, reasoning details, data types, documentation types, specialty context, specific output features, and redaction preferences.)
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
            max_output_tokens=8192, 
        )
        response = model.generate_content(full_prompt_to_gemini, generation_config=generation_config)
        
        feedback_str = ""
        if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
            feedback_str = f"Prompt Feedback: {response.prompt_feedback}"
            print(feedback_str) # Log it on backend

        if response.candidates and response.candidates[0].finish_reason == "STOP":
            if response.candidates[0].content and response.candidates[0].content.parts:
                return response.candidates[0].content.parts[0].text, feedback_str
            else:
                print("Gemini API response has no content parts.")
                return "Error: No content in response from Gemini.", feedback_str
        else:
            reason = response.candidates[0].finish_reason if response.candidates else 'Unknown'
            error_detail = f"Gemini API call did not finish successfully. Finish reason: {reason}"
            print(error_detail)
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
