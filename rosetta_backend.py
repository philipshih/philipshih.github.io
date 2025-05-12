import os
import datetime
import time # For sleep
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import the make_default_options_response function
from flask import make_response

# --- Configuration ---
# GEMINI_API_KEY is now expected as an environment variable
GEMINI_MODEL = "gemini-2.5-pro-exp-03-25" # Changed to user-specified model
BASE_NOTES_PATH = r"C:\Users\phili\OneDrive\Desktop\Rosetta" # Updated path
# INPUT_FILES_DIRECTORY is no longer used for watching in cloud environment
OUTPUT_NOTES_DIRECTORY = os.path.join(BASE_NOTES_PATH, "outputs") # Save generated notes here

# INPUT_FILE_EXTENSION is no longer used for watching

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

# Core Rosetta Instructions - To be prepended by the backend
ROSETTA_SYSTEM_INSTRUCTION = """You are Rosetta, an attending physician AI assistant. Generate clinically precise, concise medical notes mimicking human attending physicians. Output plaintext only—no markdown, unless explicitly required by a user-provided template (e.g., EPIC SmartPhrases).

Key Directives:

Ensure accuracy and clinical realism. Do not fabricate or assume data. Explicitly state 'unknown' if data is missing or cannot be reasonably inferred from the provided context. If making a clinical inference, briefly state the basis for that inference.

Prioritize PII redaction (names, MRNs, dates -> relative time).

Follow user-specified formatting (SHN, VSHN, SOAP, H&P, etc.). Prioritize user-provided templates over standard formats if a template is given.

Adhere to relevant clinical guidelines and pathophysiology when requested. Integrate guideline recommendations into the plan where appropriate, citing sources if possible (e.g., PMID, calculator name).

Validate compliance with standard documentation norms (e.g., Joint Commission, CMS) where applicable.

If input is ambiguous or inconsistent, identify the ambiguity/inconsistency and state how you have chosen to interpret it for the note, or if necessary, indicate that clarification is needed."""

ROSETTA_CORE_OPERATIONAL_INSTRUCTIONS = """For each request:

New Patient: Generate questions in the form: Plan to ask about [X] to assess [Y]. Provide Impression & A&P.

Updates: Integrate new data into appropriate note sections. Synthesize new data with existing information, commenting on the significance of key findings (e.g., abnormal labs, relevant physical exam findings) in the context of the patient's condition.

Missing Data: Use phrases like Indicated to obtain [test] due to [reason] or Plan to further assess [symptom]. Explicitly state when information for a standard section (e.g., Allergies, Family History) is not available in the provided data.

Note Structure:

Impression: Provide a concise summary statement.

Subjective: HPI, PMH, SHx, FHx, ROS. Qualify information based on source (e.g., "Patient reports...", "Per family...").

Objective: Vitals, PE, Labs, Imaging. Include relevant positive and negative findings.

Assessment & Plan (A&P):
- Structure the A&P by problem if requested. Otherwise, group related issues logically.
- For each problem/assessment:
    - State the likely diagnosis or differential.
    - Briefly justify the assessment based on subjective and objective findings.
    - If requested, include relevant pathophysiology connected to the patient's case.
- Plan:
    - Use hyphenated lists (e.g., - Recommendation) for all plan actions.
    - Ensure plans are specific, actionable, and appropriate (e.g., specify medication dosage/route/frequency if inferable, specify type of imaging/lab).
    - Include follow-up plans and patient education points where relevant.
    - Consider including brief contingency plans or warning signs to monitor for.

IMPORTANT PREAMBLE (for the model's internal thoughts): Before generating the medical note, provide your analytical thoughts. This should include identifying key diagnostic anchors, potential red flags, significant positive and negative findings, and any critical missing information that impacts your assessment and plan. Delimit this section clearly with the specified markers."""

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing requests from your GitHub Pages site

# Ensure essential directories exist at startup (good practice)
if not os.path.exists(OUTPUT_NOTES_DIRECTORY):
    try:
        os.makedirs(OUTPUT_NOTES_DIRECTORY)
        print(f"Created output directory at startup: {OUTPUT_NOTES_DIRECTORY}")
    except OSError as e:
        print(f"Error creating output directory {OUTPUT_NOTES_DIRECTORY} at startup: {e}")

# --- Helper Functions (largely same as before) ---

def get_llm_response(dynamic_prompt_from_frontend):
    """
    Combines core instructions with dynamic prompt and sends to Gemini API.
    Returns the response text and any prompt feedback.
    """
    # Instruction for the LLM to provide its "thoughts" before the note
    thoughts_instruction = (
        "IMPORTANT PREAMBLE: Before generating the medical note based on the user's request that follows, "
        "first provide your analytical thoughts, reasoning, and implications of the given patient information and selected options. "
        "This 'thoughts' section should explain your high-level interpretation and any critical considerations before you proceed to construct the note. "
        "Delimit this entire 'thoughts' section clearly with the following markers:\n"
        "===ROSETTA_MODEL_THOUGHTS_START===\n"
        "[Your analytical thoughts and implications here]\n"
        "===ROSETTA_MODEL_THOUGHTS_END===\n\n"
        "After the '===ROSETTA_MODEL_THOUGHTS_END===' marker, then proceed to generate the complete medical note as requested by the main prompt below.\n\n"
    )

    try:
        # Prepend the thoughts_instruction to the existing full prompt structure
        full_prompt_to_gemini = (
            f"{thoughts_instruction}"
            f"{ROSETTA_SYSTEM_INSTRUCTION}\n\n"
            f"{ROSETTA_CORE_OPERATIONAL_INSTRUCTIONS}\n\n"
            f"Dynamic Request from Frontend:\n---\n{dynamic_prompt_from_frontend}\n---"
        )
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        print(f"Sending combined prompt to Gemini model {GEMINI_MODEL}...")

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=8192 # Increased max_output_tokens
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

                # Condense repeated phrases
                text_output = candidate.content.parts[0].text
                phrases = text_output.split(". ")  # Split into phrases
                phrase_counts = {}
                for phrase in phrases:
                    phrase = phrase.strip()
                    if phrase:
                        phrase_counts[phrase] = phrase_counts.get(phrase, 0) + 1

                for phrase, count in phrase_counts.items():
                    if count > 5:
                        text_output = text_output.replace(phrase, "[REPEATED PHRASE: " + phrase + "]")

                return text_output, feedback_str
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

# --- Flask Routes ---

SMARTPHRASE_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), 'smartphrase_templates') # Define directory for smartphrase templates, relative to script location

@app.route('/list_smartphrase_templates', methods=['GET'])
def list_smartphrase_templates():
    try:
        # Ensure the path is correct relative to the script's execution directory
        # If backend.py is at project root, and smartphrase_templates is also at root, this is fine.
        if not os.path.isdir(SMARTPHRASE_TEMPLATES_DIR):
            print(f"Error: Directory '{SMARTPHRASE_TEMPLATES_DIR}' not found.")
            return jsonify({"error": f"Template directory not found on server: {SMARTPHRASE_TEMPLATES_DIR}", "templates": []}), 404

        templates = [f for f in os.listdir(SMARTPHRASE_TEMPLATES_DIR) if f.endswith('.txt')]
        
        return jsonify({"templates": sorted(templates)}) # Sort for consistent order

    except Exception as e:
        print(f"Error listing smartphrase templates: {e}")
        return jsonify({"error": "An error occurred while listing templates.", "details": str(e), "templates": []}), 500

@app.route('/list_notes', methods=['GET'])
def list_notes():
    """
    Lists all .txt files in the OUTPUT_NOTES_DIRECTORY.
    """
    if not os.path.exists(OUTPUT_NOTES_DIRECTORY):
        print(f"Output directory {OUTPUT_NOTES_DIRECTORY} not found for listing notes.")
        return jsonify({"error": "Notes directory not found.", "notes": []}), 404
    try:
        notes = [f for f in os.listdir(OUTPUT_NOTES_DIRECTORY) if os.path.isfile(os.path.join(OUTPUT_NOTES_DIRECTORY, f)) and f.endswith('.txt')]
        return jsonify({"notes": sorted(notes, reverse=True)}), 200 # Sort by newest first
    except Exception as e:
        print(f"Error listing notes from {OUTPUT_NOTES_DIRECTORY}: {e}")
        return jsonify({"error": f"Failed to list notes: {str(e)}", "notes": []}), 500

@app.route('/save_smartphrase_template', methods=['POST'])
def save_smartphrase_template():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        filename = data.get('filename')
        content = data.get('content')

        if not filename or not filename.strip():
            return jsonify({"error": "Filename is missing or empty"}), 400
        if content is None: 
            return jsonify({"error": "Content is missing"}), 400

        # Basic Filename Sanitization
        base_filename = os.path.basename(filename)
        if not base_filename.endswith('.txt'): # Ensure .txt extension
            base_filename += '.txt'
        
        # Further sanitize to remove potentially problematic characters, allowing alphanumeric, underscore, hyphen
        safe_base_filename = "".join(c if c.isalnum() or c in ['_', '-','.'] else '_' for c in base_filename)
        if safe_base_filename != base_filename: # Check if original was unsafe
             print(f"Warning: Filename '{base_filename}' sanitized to '{safe_base_filename}'")
             base_filename = safe_base_filename # Use the sanitized version

        if not base_filename or base_filename == ".txt": # Check after sanitization
            return jsonify({"error": "Invalid or empty filename after sanitization."}), 400

        # Ensure the templates directory exists
        if not os.path.exists(SMARTPHRASE_TEMPLATES_DIR):
            try:
                os.makedirs(SMARTPHRASE_TEMPLATES_DIR)
                print(f"Created directory: {SMARTPHRASE_TEMPLATES_DIR}")
            except OSError as e:
                print(f"Error creating directory {SMARTPHRASE_TEMPLATES_DIR}: {e}")
                return jsonify({"error": f"Could not create template directory on server: {str(e)}"}), 500
        
        filepath = os.path.join(SMARTPHRASE_TEMPLATES_DIR, base_filename)

        # Optional: Check if file already exists to prevent accidental overwrite
        # if os.path.exists(filepath):
        #     return jsonify({"error": f"File '{base_filename}' already exists. Please choose a different name."}), 409 # 409 Conflict

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Template saved successfully to: {filepath}")
        return jsonify({"message": "Template saved successfully.", "filename": base_filename}), 200

    except Exception as e:
        print(f"Error saving smartphrase template: {e}")
        return jsonify({"error": "An error occurred while saving the template.", "details": str(e)}), 500

@app.route('/delete_smartphrase_template', methods=['POST', 'OPTIONS'])
def delete_smartphrase_template():
    if request.method == 'OPTIONS':
        # Explicitly handle the preflight request
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        filename = data.get('filename')

        if not filename or not filename.strip():
            return jsonify({"error": "Filename is missing or empty"}), 400

        # Basic Filename Sanitization (should match save logic)
        base_filename = os.path.basename(filename)
        if not base_filename.endswith('.txt'):
             # This case should ideally not happen if frontend sends correct filename
             print(f"Warning: Received filename without .txt extension for deletion: {filename}")
             # Decide how to handle: either return error or try to append .txt
             # For safety, let's require .txt from frontend or handle carefully.
             # Assuming frontend sends .txt, proceed. If not, add more robust handling.
             pass # Assuming frontend sends correct format

        # Further sanitize to remove potentially problematic characters
        safe_base_filename = "".join(c if c.isalnum() or c in ['_', '-','.'] else '_' for c in base_filename)
        if safe_base_filename != base_filename:
             print(f"Warning: Filename '{base_filename}' sanitized to '{safe_base_filename}' for deletion attempt.")
             base_filename = safe_base_filename

        if not base_filename or base_filename == ".txt":
             return jsonify({"error": "Invalid or empty filename after sanitization for deletion."}), 400


        filepath = os.path.join(SMARTPHRASE_TEMPLATES_DIR, base_filename)

        if not os.path.exists(filepath):
            print(f"Attempted to delete non-existent file: {filepath}")
            return jsonify({"error": f"Template file '{base_filename}' not found."}), 404

        if not os.path.isfile(filepath):
             print(f"Attempted to delete something that is not a file: {filepath}")
             return jsonify({"error": f"Path '{base_filename}' is not a file."}), 400 # Or 409 Conflict

        os.remove(filepath)
        
        print(f"Template deleted successfully: {filepath}")
        return jsonify({"message": "Template deleted successfully.", "filename": base_filename}), 200

    except Exception as e:
        print(f"Error deleting smartphrase template: {e}")
        return jsonify({"error": "An error occurred while deleting the template.", "details": str(e)}), 500


@app.route('/generate_note', methods=['POST'])
def handle_generate_note():
    print("DEBUG: /generate_note endpoint hit") # New log
    try:
        data = request.get_json()
        if data is None: # Check if data is None (parsing failed or empty request)
            print("DEBUG: request.get_json() returned None or empty data.")
            return jsonify({"error": "Invalid JSON or no data provided"}), 400
        print(f"DEBUG: Received data: {data}") # New log
    except Exception as e:
        print(f"DEBUG: Error getting or parsing JSON data: {e}")
        return jsonify({"error": f"Error processing request JSON: {str(e)}"}), 400
    
    if not data: # This check might be redundant if data is None check above catches it
        print("DEBUG: Data is empty after try-except (should not happen if None check is robust).")
        return jsonify({"error": "No data provided (empty after parsing)"}), 400

    # Parse new structured payload
    # Accept 'file_content' as an alternative to 'patient_data'
    patient_data = data.get('patient_data', '')
    file_content = data.get('file_content', '') # New field for file content

    # Use file_content if provided, otherwise use patient_data
    input_data = file_content if file_content else patient_data

    template_name = data.get('template_name', '') # e.g., "General Soap" or "custom_from_input"
    template_content = data.get('template_content', '') # Actual content of the template
    options = data.get('options', {}) # e.g., {"genSHN": true, "incPathophys": false}
    service_abbr = data.get('service_abbreviation', 'GENERAL').strip().upper()
    existing_note_filename = data.get('existing_note_filename')

    # Basic validation - check if either input_data or existing_note_filename is provided
    is_reformat_request_signal = "(No new clinical information provided" in input_data # Check signal in input_data
    if not input_data and not existing_note_filename:
        return jsonify({"error": "No patient data or file content provided for a new note"}), 400
    if not input_data and existing_note_filename and not is_reformat_request_signal:
        # This case implies an update but with no new info and not explicitly a reformat.
        # Could be an error or an implicit reformat. For now, let's flag if input_data is truly empty.
        print("Warning: Update request for existing note with empty new input_data, but not explicitly a reformat signal.")
        # We can let it proceed, the LLM will get empty new input data.

    if not service_abbr:
        service_abbr = "GENERAL"

    # --- Construct the dynamic_request_for_llm ---
    dynamic_request_parts = []

    # 1. Patient Information
    dynamic_request_parts.append(f"Patient Information:\n---\n{patient_data}\n---")

    # 2. Template Instructions
    if template_name == "custom_from_input":
        dynamic_request_parts.append(
            "User-Provided Custom Template/Example Note Guidance:\n"
            "The following text is provided by the user. It might be a blank template OR an example of a previously filled note.\n"
            "- If it appears to be a blank template (e.g., with placeholders like `***` or `@PLACEHOLDER@`), FILL IT using the new patient information.\n"
            "- If it appears to be an example of a filled note, USE ITS OVERALL STRUCTURE, SECTION HEADINGS, AND FORMATTING STYLE AS A GUIDE when generating the new note for the provided patient information. Adapt the content to the new patient's details while preserving the demonstrated organizational style.\n"
            "- Ensure all PII from any provided example is removed if generating a new note; only use the new patient's PII (which should also be ultimately redacted if requested by other options).\n"
            "User-provided template/example content:\n"
            "---\n"
            f"{template_content}\n"
            "---"
        )
    elif template_content and not template_content.startswith("(Error loading template"):
        dynamic_request_parts.append(
            f"Predefined Template to Use ({template_name}):\n"
            "--- (Fill the following template with the patient information) ---\n"
            f"{template_content}\n"
            "--- (End of predefined template) ---"
        )
    elif template_content.startswith("(Error loading template"):
        dynamic_request_parts.append(
            f"Note on Predefined Template ({template_name}):\n{template_content}\n" # Contains the error message
            "Proceed with generation based on patient data and selected options, without a specific template structure for this selection."
        )
    else: # No custom template, and no (or empty) predefined template content
        dynamic_request_parts.append("No specific template provided or loaded. Generate note based on standard structure and selected options.")

    # 3. User-Selected Options from checkboxes
    selected_options_instructions = ["\nUser-Selected Options for this request:"]
    has_any_option_selected = False
    if options: # Check if options object is not empty
        # Map option IDs from frontend to specific instructions for LLM
        option_to_instruction_map = {
            "genSHN": "- Output Format: Generate SHN (Short-hand Notation). Rephrase full note using standard clinical abbreviations while maintaining clarity.",
            "genVSHN": "- Output Format: Generate VSHN (Very Short-hand Notation). Distill into ultra-concise, rapid-style shorthand. Omit non-critical detail. Use standard medical abbreviations where appropriate. Avoid uncommon abbreviations or excessive capitalization. DO NOT use underscores (_) to connect words; instead, use terse phrasing or standard abbreviations.",
            "formatByProblem": "- A&P Structure: Format the Assessment & Plan section 'By Problem'. (Detailed instructions for 'By Problem' A&P will be appended if this is selected).",
            "incPathophys": "- Reasoning Detail: Include full pathophysiologic reasoning in the Assessment & Plan.",
            "incGuidelines": "- Reasoning Detail: Include guideline recommendations if relevant.",
            "formatSOAP": "- Documentation Type: Use SOAP format (if no overriding template is provided).",
            "formatHnP": "- Documentation Type: Use Full H&P format (if no overriding template is provided).",
            "formatDischarge": "- Documentation Type: Use Discharge summary format (if no overriding template is provided).",
            "formatPreOp": "- Documentation Type: Use Pre-op note format (if no overriding template is provided).",
            # Updated Context Options
            "specAnesthesia": "- Context: Anesthesia. Tailor questions, assessment, and plan accordingly.",
            "specDerm": "- Context: Dermatology. Tailor questions, assessment, and plan accordingly.",
            "specFM": "- Context: Family Medicine. Tailor questions, assessment, and plan accordingly.",
            "specIM": "- Context: Internal Medicine. Tailor questions, assessment, and plan accordingly.",
            "specNeuro": "- Context: Neurology. Tailer questions, assessment, and plan accordingly.",
            "specOBGYN": "- Context: OBGYN. Tailer questions, assessment, and plan accordingly.",
            "specPeds": "- Context: Pediatrics. Tailer questions, assessment, and plan accordingly.",
            "specPsych": "- Context: Psychiatry. Tailer questions, assessment, and plan accordingly.",
            "specSurgeryGen": "- Context: Surgery (General). Tailer questions, assessment, and plan accordingly.",
            "incMissingData": "- Output Feature: Include a checklist of missing objective data that would be relevant.",
            "genHistoryQuestions": "- Output Feature: Generate comprehensive history questions relevant to the patient's presentation. These should cover aspects of HPI (History of Present Illness), ROS (Review of Systems), PMH (Past Medical History), SHx (Social History), FHx (Family History), Medications, and Allergies as appropriate. Questions should be integrated into their respective sections within the note; if these sections do not exist, create them. Phrase questions naturally for a patient interview.",
            "genPEManeuvers": "- Assistance Request: Suggest relevant physical exam maneuvers based on the provided patient information, including potential findings and reasoning.",
            "genROSTemplate": "- Output Feature: Generate a Review of Systems (ROS) question template. These questions should be relevant to the patient's presentation (from input or existing note) and should be formatted to appear after the Subjective section of the main note.",
            "genChartReview": "- Output Feature: Generate a 'Chart Review Checklist'. This checklist MUST be placed at the VERY BEGINNING of the entire note, before any other content (including Impression). The style should be concise, like a hurried checklist, but each item must be accurate, thoughtful, and include a brief explanation for why that piece of information is needed from the chart. This checklist takes precedence in placement over the standard note structure.",
            "confirmDeidentified": "- Redaction: Confirm data is de-identified (this is a primary instruction; ensure PII is removed).",
            "removeDates": "- Redaction: Remove specific dates and convert to relative time where appropriate (e.g., 'yesterday', 'last week').",
            "stripNonStandardAbbr": "- Output Feature: Include all abbreviations from the input, including non-standard ones."
        }

        # Conflict Resolution
        # (1) User Template > (2) Documentation Type > (3) Notation Format > (4) Specialty Context > (5) Reasoning Detail

        # Input Validation & Feedback
        # If input is ambiguous or inconsistent, prompt user for clarification before generating the note.

        # Ensure generated content structurally complies with clinical documentation standards.
        for opt_id, is_checked in options.items():
            if is_checked and opt_id in option_to_instruction_map:
                selected_options_instructions.append(option_to_instruction_map[opt_id])
                has_any_option_selected = True
        
        if options.get("formatByProblem"): # Special detailed instructions for A&P By Problem
            selected_options_instructions.append("\nDetailed Instructions for 'Assessment & Plan By Problem' (if A&P By Problem option is selected):")
            selected_options_instructions.append("Structure the Assessment and Plan (A&P) section 'By Problem'. For EACH problem identified, strictly follow this format:\n")
            selected_options_instructions.append("#Problem Name (e.g., #Hypertension)")
            selected_options_instructions.append("Assessment: [Concisely define the problem based on available lab/history/physical exam/presentation details. Include likely or possible etiologies for this patient. Describe the patient's current state or status regarding this problem.]")
            selected_options_instructions.append("Plan:")
            selected_options_instructions.append("- [Specific action/recommendation 1 for this problem]")
            selected_options_instructions.append("- [Specific action/recommendation 2 for this problem]")
            selected_options_instructions.append("  - [Sub-point or further detail for action 2, if any, indented]")
            selected_options_instructions.append("- [Continue with more hyphenated plan items as needed for THIS problem, grouped logically as an attending physician would.]\n")
            selected_options_instructions.append("General Rules for 'By Problem' A&P:")
            selected_options_instructions.append("- Each problem MUST start with a '#' followed by the problem name.")
            selected_options_instructions.append("- The 'Assessment:' part for each problem should be a comprehensive but concise paragraph.")
            selected_options_instructions.append("- The 'Plan:' part for each problem MUST use hyphenated lists for actionable items.")
            selected_options_instructions.append("- Ensure clinical reasoning is evident in the grouping and content of plan items.")
            if options.get("genVSHN"):
                selected_options_instructions.append("\nIMPORTANT FOR VSHN + By Problem: After structuring the A&P 'By Problem', apply VSHN principles (ultra-concise, rapid-style shorthand) to the ENTIRE note, including the content within each problem's Assessment and Plan. Strive for maximum brevity while retaining the problem-oriented structure.")
            elif options.get("genSHN"):
                selected_options_instructions.append("\nIMPORTANT FOR SHN + By Problem: After structuring the A&P 'By Problem', apply SHN principles (standard clinical abbreviations) to the ENTIRE note, including the content within each problem's Assessment and Plan, while maintaining clarity.")


    if not has_any_option_selected:
        selected_options_instructions.append("- (Using default behaviors as per core instructions for non-specified options)")
    
    dynamic_request_parts.extend(selected_options_instructions)
    dynamic_request_for_llm = "\n".join(dynamic_request_parts)
    dynamic_request_for_llm += "\n\n--- END OF DYNAMIC REQUEST FROM FRONTEND ---"
    
    # --- End of Constructing dynamic_request_for_llm ---

    final_llm_prompt_parts = []
    output_filename = ""
    operation_type_message = "generated and saved"

    if existing_note_filename:
        # Update existing note
        print(f"Received UPDATE request for note: {existing_note_filename} (service: {service_abbr})")
        existing_note_path = os.path.join(OUTPUT_NOTES_DIRECTORY, existing_note_filename)
        if not os.path.isfile(existing_note_path):
            return jsonify({"error": f"Existing note '{existing_note_filename}' not found or is not a file."}), 404
        try:
            with open(existing_note_path, 'r', encoding='utf-8') as f:
                existing_note_content = f.read()
            
            if is_reformat_request_signal: # patient_data contains the signal "(No new clinical information provided..."
                print("This is a REFORMAT ONLY request for existing note.")
                final_llm_prompt_parts.append(
                    "You are REFORMATTING an existing medical note based on newly selected user options.\n"
                    "The 'EXISTING NOTE CONTENT' is provided below.\n"
                    "Your task is to re-write this entire existing content according to ALL instructions and 'User-Selected Options' (detailed in the 'Dynamic Request from Frontend' section that follows the existing content).\n"
                    "Pay close attention to formatting requests like SHN, VSHN, A&P By Problem, etc.\n\n"
                    f"EXISTING NOTE CONTENT:\n---\n{existing_note_content}\n---\n\n"
                    "NOW, APPLY THE FOLLOWING DYNAMIC REQUEST (CONTAINING OPTIONS AND FORMATTING INSTRUCTIONS) TO THE ABOVE EXISTING CONTENT:"
                )
            else: # Standard update: integrate new info from patient_data
                print("This is an UPDATE request with new information for an existing note.")
                final_llm_prompt_parts.append(
                    "You are UPDATING an existing medical note. The 'EXISTING NOTE CONTENT' is provided below.\n"
                    "1. The 'Dynamic Request from Frontend' (which follows the existing content) contains NEW 'Patient Information'. Integrate this new information into the existing content, making necessary modifications and additions.\n"
                    "2. When integrating, especially in structured sections like 'Objective', ensure that proper formatting, including line breaks for distinct items (e.g., HEENT, Heart, Lungs), is maintained or re-established throughout the section.\n"
                    "3. After integration, apply all other instructions and 'User-Selected Options' from the 'Dynamic Request from Frontend' to the ENTIRE resulting note (e.g., SHN/VSHN conversion, A&P by Problem, etc.).\n\n"
                    f"EXISTING NOTE CONTENT:\n---\n{existing_note_content}\n---\n\n"
                    "NOW, PROCESS THE FOLLOWING DYNAMIC REQUEST (CONTAINING NEW PATIENT INFO AND OPTIONS) AND APPLY IT TO THE ABOVE EXISTING CONTENT:"
                )
            
            final_llm_prompt_parts.append(dynamic_request_for_llm)
            output_filename = existing_note_filename
            operation_type_message = "updated and saved"
        except Exception as e:
            print(f"Error reading existing note {existing_note_filename}: {e}")
            return jsonify({"error": f"Failed to read existing note: {str(e)}"}), 500
    else:
        # Create new note
        print(f"Received NEW note request for service: {service_abbr}")
        final_llm_prompt_parts.append(dynamic_request_for_llm)
        output_filename = generate_filename(service_abbr)

    final_llm_prompt = "\n\n".join(final_llm_prompt_parts)
    
    # The get_llm_response function will prepend SHIHGPTMD_SYSTEM_INSTRUCTION and SHIHGPTMD_CORE_OPERATIONAL_INSTRUCTIONS
    # So, final_llm_prompt here is effectively the 'dynamic_prompt_from_frontend' argument for get_llm_response
    llm_raw_output, prompt_feedback_details = get_llm_response(final_llm_prompt) 
    
    print(f"DEBUG: llm_raw_output (first 500 chars): {llm_raw_output[:500]}") # Added DEBUG log
    
    response_data = {"prompt_feedback": prompt_feedback_details if prompt_feedback_details else "N/A"}

    model_thoughts_text = ""
    note_text = ""

    if llm_raw_output and not llm_raw_output.startswith("Error:"):
        thoughts_start_delim = "===ROSETTA_MODEL_THOUGHTS_START==="
        thoughts_end_delim = "===ROSETTA_MODEL_THOUGHTS_END==="

        start_idx = llm_raw_output.find(thoughts_start_delim)
        end_idx = llm_raw_output.find(thoughts_end_delim)

        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            model_thoughts_text = llm_raw_output[start_idx + len(thoughts_start_delim):end_idx].strip()
            # The actual note is whatever comes after the thoughts_end_delim
            note_text = llm_raw_output[end_idx + len(thoughts_end_delim):].strip()
        else:
            # If delimiters are not found, assume the whole output is the note.
            print("Warning: Model thoughts delimiters not found in LLM output. Treating entire output as note.")
            note_text = llm_raw_output.strip() # Assign raw output to note_text if delimiters are missing
            model_thoughts_text = "(No separate thoughts section provided by the model or delimiters not found.)"

        # Clean the note_text (as it's the part that will be saved and primarily displayed as "note")
        cleaned_note_text = note_text.replace("**", "").strip()
        
        print(f"DEBUG: model_thoughts_text (first 500 chars): {model_thoughts_text[:500]}") # Added DEBUG log
        print(f"DEBUG: cleaned_note_text (first 500 chars): {cleaned_note_text[:500]}") # Added DEBUG log
        
        # The model_thoughts_text can retain its original formatting from the LLM for now,
        # unless specific cleaning is also desired for it.

        if save_note_to_file(output_filename, cleaned_note_text): # Save only the cleaned note part
            response_data["message"] = f"Note {operation_type_message} successfully."
            response_data["filename"] = output_filename
            response_data["llm_model_thoughts"] = model_thoughts_text
            response_data["llm_note_output"] = cleaned_note_text
            print(f"DEBUG: Preparing to jsonify success response_data: {response_data}") # Added DEBUG log
            return jsonify(response_data), 200
        else:
            response_data["error"] = "Failed to save the note."
            response_data["llm_model_thoughts"] = model_thoughts_text # Still return thoughts if available
            response_data["llm_note_output"] = cleaned_note_text     # and note
            print(f"DEBUG: Preparing to jsonify save_failure response_data: {response_data}") # Added DEBUG log
            return jsonify(response_data), 500
    else:
        response_data["error"] = "Failed to get a valid response from LLM."
        response_data["details"] = llm_raw_output # This would be the error message from get_llm_response
        response_data["llm_model_thoughts"] = ""
        response_data["llm_note_output"] = ""
        print(f"DEBUG: Preparing to jsonify LLM_failure response_data: {response_data}") # Added DEBUG log
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
    print(f"Starting Rosetta Flask server on http://127.0.0.1:5000")
    print(f"Output notes will be saved in: {os.path.abspath(OUTPUT_NOTES_DIRECTORY)}")
    app.run(debug=True, host='0.0.0.0', port=5000) # Removed use_reloader=False as watchdog is removed
                                               # host='0.0.0.0' makes it accessible on your local network.
