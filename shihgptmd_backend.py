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
BASE_NOTES_PATH = r"C:\Users\phili\OneDrive\Desktop\ShihGPTMD"
INPUT_FILES_DIRECTORY = os.path.join(BASE_NOTES_PATH, "inputs")  # Watch this folder for new .txt files
OUTPUT_NOTES_DIRECTORY = os.path.join(BASE_NOTES_PATH, "outputs") # Save generated notes here

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

# Core ShihGPT-MD Instructions - To be prepended by the backend (REFINED VERSION V2)
SHIHGPTMD_SYSTEM_INSTRUCTION = "You are ShihGPT-MD, an attending physician. Generate notes in a style typical of a human attending physician: concise, clinically precise, and avoiding AI-like or overly verbose phrasing. CRITICAL: Output format MUST be pure plaintext. Absolutely NO markdown formatting (e.g., no asterisks for bolding like **word**, no hashes for headers like ## H2) is allowed, unless such formatting is explicitly part of a user-provided EPIC SmartPhrase template from the dynamic prompt. Prioritize accuracy, PII removal (names, MRNs), and adherence to user-specified formatting (SHN, VSHN, templates) and content requests (pathophysiology, guidelines, etc.) from the dynamic prompt."

SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS = """
Key Tasks:
1. New Patient: Generate guideline-concordant questions phrased as 'Plan to ask about [X] to assess [Y].' Develop an initial impression and A&P.
2. Updates: Integrate new info into the correct note section. 
3. Missing Data: If critical data is missing, state 'Indicated to obtain [test/item] due to [reason/guideline]' or 'Plan to further assess [symptom/area].' Avoid phrases like 'Not provided.'
4. Note Structure: Always include Impression, Subjective (HPI, relevant PMH/SHx/FHx/ROS), Objective (vitals, PE, labs/imaging if available), and a fully reasoned Assessment & Plan (differential, likely Dx, brief pathophys, interventions, F/U).

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
        full_prompt_to_gemini = f"{SHIHGPTMD_SYSTEM_INSTRUCTION}\n\n{SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS}\n\nDynamic Request from Frontend:\n---\n{dynamic_prompt_from_frontend}\n---"
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        print(f"Sending combined prompt to Gemini model {GEMINI_MODEL}...")

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=4096 
        )
        response = model.generate_content(full_prompt_to_gemini, generation_config=generation_config)
        
        feedback_str = ""
        if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
            feedback_str = f"Prompt Feedback: {str(response.prompt_feedback)}" # Ensure it's a string
            print(feedback_str)

        # Check if there are candidates and content
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            actual_finish_reason = candidate.finish_reason
            
            # Try to use the enum for STOP, default to integer 1 if enum path fails
            stop_reason_enum_value = 1 # Default integer for STOP
            try:
                stop_reason_enum_value = genai.types.FinishReason.STOP
            except AttributeError:
                print("Note: genai.types.FinishReason.STOP not found, relying on integer value 1 for STOP reason.")

            if candidate.content and candidate.content.parts:
                # We have content, this is the primary success path
                if actual_finish_reason != stop_reason_enum_value:
                     print(f"Warning: Response has content, but finish_reason was not '{stop_reason_enum_value}'. Actual reason: {actual_finish_reason} (type: {type(actual_finish_reason)})")
                return candidate.content.parts[0].text, feedback_str
            else:
                # No content, but we have a candidate, so the finish_reason is important
                error_detail = f"Gemini API call did not finish successfully (no content parts). Finish reason: {actual_finish_reason}"
                print(error_detail)
                print("--- Full Gemini Response (Candidate available) ---")
                try:
                    print(f"Raw response object: {response}")
                    print(f"Candidate details: {candidate}")
                except Exception as print_e:
                    print(f"Error trying to print response/candidate details: {print_e}")
                return f"Error: {error_detail}", feedback_str
        else:
            # No candidates at all, this is a more severe failure
            error_detail = "Gemini API call failed: No candidates returned."
            print(error_detail)
            print("--- Full Gemini Response (No candidates) ---")
            try:
                print(f"Raw response object: {response}")
            except Exception as print_e:
                print(f"Error trying to print raw response: {print_e}")
            return f"Error: {error_detail}", feedback_str
            
    except Exception as e:
        print(f"Error calling Google Gemini API: {e}")
        return f"Error: Exception during API call - {str(e)}", ""

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
    # Ensure output notes directory exists
    if not os.path.exists(OUTPUT_NOTES_DIRECTORY):
        try:
            os.makedirs(OUTPUT_NOTES_DIRECTORY)
            print(f"Created directory: {OUTPUT_NOTES_DIRECTORY}")
        except OSError as e: # More specific exception
            print(f"Error creating directory {OUTPUT_NOTES_DIRECTORY}: {e}")
            return False # Indicate failure
            
    filepath = os.path.join(OUTPUT_NOTES_DIRECTORY, filename)
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
                # This is a simplified prompt for auto-processed files.
                # It will be prepended with SHIHGPTMD_SYSTEM_INSTRUCTION and SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS by get_llm_response.
                # So, this 'auto_prompt' is effectively the 'dynamic_prompt_from_frontend' for file inputs.
                auto_prompt = f"""Patient Information (from automatically processed file: {os.path.basename(event.src_path)}):
---
{file_content}
---
User-Selected Options for this request:
- (Using default behaviors as per core instructions for non-specified options, assume standard SOAP/H&P unless content implies otherwise)
--- END OF DYNAMIC REQUEST ---
"""
                print(f"Processing content from: {event.src_path} as dynamic prompt for file watcher.")
                llm_text_output, prompt_feedback_details = get_llm_response(auto_prompt) 

                if prompt_feedback_details:
                    print(f"File Watcher - Prompt Feedback for {event.src_path}: {prompt_feedback_details}")

                if llm_text_output and not llm_text_output.startswith("Error:"):
                    cleaned_llm_text_output = llm_text_output.replace("**", "") # Clean output
                    cleaned_llm_text_output = cleaned_llm_text_output.strip()   # Trim whitespace

                    original_filename = os.path.basename(event.src_path)
                    service_abbr_auto = "AUTO_FROM_" + os.path.splitext(original_filename)[0]
                    output_note_filename = generate_filename(service_abbr_auto)
                    save_note_to_file(output_note_filename, cleaned_llm_text_output) # Save cleaned version
                    print(f"LLM response for {original_filename} saved to {output_note_filename} (markdown removed)")
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
        # Post-process to remove double asterisks (common bold markdown)
        cleaned_llm_text_output = llm_text_output.replace("**", "")
        # Add more specific cleaning if needed, e.g., for leading/trailing spaces from removed markdown
        cleaned_llm_text_output = cleaned_llm_text_output.strip()


        note_filename = generate_filename(service_abbr)
        if save_note_to_file(note_filename, cleaned_llm_text_output): # Save cleaned version
            response_data["message"] = "Note generated and saved successfully (markdown removed)."
            response_data["filename"] = note_filename
            response_data["llm_response"] = cleaned_llm_text_output # Return cleaned version
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
    # Ensure input directory exists for watching
    if not os.path.exists(INPUT_FILES_DIRECTORY):
        try:
            os.makedirs(INPUT_FILES_DIRECTORY)
            print(f"Created input directory for watcher: {INPUT_FILES_DIRECTORY}")
        except OSError as e:
            print(f"Error creating input directory {INPUT_FILES_DIRECTORY}: {e}. File watcher not started.")
            return
    # Ensure output directory also exists or can be created by save_note_to_file
    if not os.path.exists(OUTPUT_NOTES_DIRECTORY):
        try:
            os.makedirs(OUTPUT_NOTES_DIRECTORY)
            print(f"Created output directory: {OUTPUT_NOTES_DIRECTORY}")
        except OSError as e:
            print(f"Error creating output directory {OUTPUT_NOTES_DIRECTORY}: {e}. Note saving might fail.")
            # Continue starting watcher, but saving will attempt to create it again or fail.

    event_handler = NewFileHandler()
    observer = Observer()
    observer.schedule(event_handler, INPUT_FILES_DIRECTORY, recursive=False) # Watch the INPUT_FILES_DIRECTORY
    observer.start()
    print(f"File watcher started on directory: {INPUT_FILES_DIRECTORY} (watching for new {INPUT_FILE_EXTENSION} files)")
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
    print(f"Input files will be watched in: {os.path.abspath(INPUT_FILES_DIRECTORY)}")
    print(f"Output notes will be saved in: {os.path.abspath(OUTPUT_NOTES_DIRECTORY)}")
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False) # use_reloader=False is important when running watchdog in a thread
                                                                    # to prevent it from starting twice in debug mode.
                                               # host='0.0.0.0' makes it accessible on your local network.
