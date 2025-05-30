![Rosetta Logo](assets/img/rosetta_logo.png)
© Philip Shih 2025

Rosetta calls Google's Gemini API to craft structured medical notes. Inputs are deidentified using Google Cloud Data Loss Prevention (DLP) API.

---

### **Getting Started with Rosetta**
Rosetta is organized into collapsible sections for ease of use.

## 🕶️ Incognito Mode
For on-screen privacy, toggle the switch at the top-right of Rosetta to make input and output text areas white, blending them with the background.

## ⌨️ Input
Enter pertinent clinical details – HPI, exam findings, lab results, imaging interpretations, etc.

The **De-identify Button**, located at the top-right of the input area, securely routes your input to Google Cloud DLP for thorough de-identification. The anonymized text will then replace your original input.

To work with a previously saved note, check the **Update Existing Note?** option. This will reveal a dropdown list of your saved notes; select one to load its content. Use the adjacent refresh icon to fetch the most current list of saved notes.

## 📄 Template
Manage your note structures here.

Choose from your list of saved **Manuals** (e.g., "General SOAP Note") using the dropdown to apply a predefined structure to your note. Selecting "None (Use General Structure)" means no specific Manual will be applied, and notes will be structured based on selected Options or as deemed appropriate by the LLM.

The **Edit Selected Manual** button appears upon selecting a Manual from the dropdown. Use it to load the content of that Manual into the "Custom Template" text area below, allowing you to view and modify it.

Next to the edit button, the **Delete Selected Manual** button allows you to remove the currently selected Manual from the server after a confirmation.

The **Custom Template** Paste any specific format, an EPIC SmartPhrase, or the content of a Manual you've loaded for editing. If this area has content, it will be used as the primary template.

To save your work, use the **Save Changes** button. This button appears after you've loaded a Manual for editing and will save any modifications back to the original manual file. The button's text will indicate which file is being saved (e.g., "Save Changes to general_soap").

Alternatively, use the **Save as New Manual** button to save the current content of the "Custom Template" textarea as a brand new Manual. You will be prompted to enter a name for this new Manual.

The **Clear** button will erase the content of the "Custom Template" textarea. If you were editing a loaded Manual, this action also resets the editing state, causing the "Save Changes" button to disappear.

## ⚙️ Options
Select any combination of options to tailor your output.

In **Output**, select SHN (Short-hand Notation), VSHN (Very Short-hand), or opt to structure your Assessment & Plan by problem.

Under **Reasoning**, elect to include full pathophysiologic reasoning or cite relevant clinical guidelines.

The **Documentation** type can be specified as SOAP, H&P, Discharge Summary, or Pre-op note.

**Context** options allow you to adapt note generation for various specialties such as Dermatology, Pediatrics, Internal Medicine, and more.

**Features** let you request initial history questions, a list of missing data, and other helpful additions.

**Security** settings include confirming de-identification, converting dates to relative time, and using standard abbreviations.
   
## ✨ Generate
Click the large right-arrow button (<i class="fas fa-angle-right"></i>) after providing your input and selecting your desired options. Rosetta then compiles all inputs and options and sends them to the LLM for processing.

## 💡 Output
The **Model Impression** area displays the LLM's preliminary reasoning and thought process before the final note is generated. It also shows backend status messages, keeping you informed of the generation process.

## 📝 Note
Your completed and structured medical notes appear in this section.

The **Copy Button** (<i class="fas fa-copy"></i> icon) located at the top-right of the note area will copy the Note to your clipboard.

## 💾 Saved Notes
Manage your collection of generated Notes here.

Use the **Refresh List** button to retrieve the latest list of all your saved Notes from the server.

The **Delete All Notes** button allows you to remove all saved Notes from your archive after confirmation.

---
*I developed Rosetta as proof-of-concept. Exercise judgment by reviewing and verifying generated content. Send feedback to my email address linked on my homepage.*
