// Basic data structure for diagnoses and their associated findings
// NOTE: This is a highly simplified model for demonstration. Real-world DDx requires extensive medical knowledge and complex algorithms/data.
const diagnoses = [
    // Respiratory
    { name: "Pneumonia", score: 0, system: "Respiratory", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'chest_pain', 'chills', 'fatigue'], pe: ['rales', 'rhonchi', 'decreased_breath_sounds', 'ill_appearing'] } },
    { name: "Acute Bronchitis", score: 0, system: "Respiratory", criteria: { vitals: ['fever'], ros: ['cough', 'sob', 'fatigue'], pe: ['rhonchi', 'wheezes'] } },
    { name: "Pulmonary Embolism", score: 0, system: "Respiratory/Cardiovascular", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypoxia'], ros: ['sob', 'chest_pain'], pe: [] /* Often normal exam, maybe tachycardia */ } },
    { name: "Asthma Exacerbation", score: 0, system: "Respiratory", criteria: { vitals: ['tachycardia', 'tachypnea'], ros: ['sob', 'cough', 'wheezing'], pe: ['wheezes'] } },
    { name: "Upper Respiratory Infection (URI)", score: 0, system: "Respiratory/HEENT", criteria: { vitals: ['fever'], ros: ['sore_throat', 'cough', 'headache', 'fatigue'], pe: ['pharyngeal_erythema'] } },
    { name: "COVID-19", score: 0, system: "Respiratory/Constitutional", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'fatigue', 'headache', 'sore_throat'], pe: ['decreased_breath_sounds'] } },

    // Cardiovascular
    { name: "Heart Failure Exacerbation", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypoxia', 'hypertension'], ros: ['sob', 'edema', 'cough', 'fatigue'], pe: ['jvd', 'pedal_edema', 'rales'] } },
    { name: "Acute Coronary Syndrome (ACS)", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia', 'hypertension', 'hypotension'], ros: ['chest_pain', 'sob', 'nausea', 'fatigue'], pe: [] /* Often normal exam */ } },
    { name: "Atrial Fibrillation", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia'], ros: ['palpitations', 'sob', 'fatigue', 'chest_pain'], pe: [] /* Irregularly irregular pulse */ } },
    { name: "Pericarditis", score: 0, system: "Cardiovascular", criteria: { vitals: ['fever', 'tachycardia'], ros: ['chest_pain', 'sob'], pe: [] /* Pericardial friction rub */ } },
    { name: "Hypertensive Urgency/Emergency", score: 0, system: "Cardiovascular", criteria: { vitals: ['hypertension'], ros: ['headache', 'vision_change', 'chest_pain', 'sob'], pe: [] } },

    // Gastrointestinal
    { name: "Gastroenteritis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'diarrhea', 'abd_pain', 'fatigue'], pe: ['tenderness'] } },
    { name: "Appendicitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness', 'rebound', 'guarding', 'ill_appearing'] } },
    { name: "Cholecystitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness' /* RUQ */, 'guarding'] } },
    { name: "Pancreatitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia', 'hypotension'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness' /* Epigastric */, 'distension'] } },
    { name: "Bowel Obstruction", score: 0, system: "Gastrointestinal", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['nausea', 'vomiting', 'abd_pain', 'constipation'], pe: ['tenderness', 'distension'] } },

    // Genitourinary
    { name: "Urinary Tract Infection (UTI)/Pyelonephritis", score: 0, system: "Genitourinary", criteria: { vitals: ['fever', 'tachycardia'], ros: ['dysuria', 'frequency', 'abd_pain', 'nausea', 'vomiting', 'fatigue'], pe: ['tenderness' /* Suprapubic or CVA */] } },
    { name: "Kidney Stone", score: 0, system: "Genitourinary", criteria: { vitals: ['tachycardia'], ros: ['abd_pain' /* Flank */, 'nausea', 'vomiting', 'hematuria', 'dysuria'], pe: ['tenderness' /* CVA */] } },

    // HEENT
    { name: "Otitis Media", score: 0, system: "HEENT", criteria: { vitals: ['fever'], ros: ['ear_pain'], pe: ['tm_bulging'] } },
    { name: "Strep Pharyngitis", score: 0, system: "HEENT", criteria: { vitals: ['fever'], ros: ['sore_throat', 'headache'], pe: ['pharyngeal_erythema'] } },
    { name: "Migraine Headache", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['headache', 'nausea', 'vomiting', 'vision_change'], pe: [] } },

    // Constitutional / Other
    { name: "Sepsis", score: 0, system: "Systemic", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypotension', 'hypoxia'], ros: ['fatigue', 'chills'], pe: ['ill_appearing'] } },
    { name: "Anemia", score: 0, system: "Hematologic", criteria: { vitals: ['tachycardia'], ros: ['fatigue', 'sob', 'palpitations'], pe: [] /* Pallor */ } },

    // Endocrine
    { name: "Hyperglycemia/DKA", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypotension'], ros: ['polyuria', 'polydipsia', 'nausea', 'vomiting', 'abd_pain', 'fatigue', 'blurry_vision'], pe: ['ill_appearing'] } },
    { name: "Hypoglycemia", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia'], ros: ['sweating', 'tremor', 'confusion', 'palpitations', 'fatigue'], pe: [] } },
    { name: "Hypothyroidism", score: 0, system: "Endocrine", criteria: { vitals: ['bradycardia'], ros: ['fatigue', 'weight_gain', 'constipation', 'cold_intolerance', 'sad_mood'], pe: [] /* Delayed reflexes, goiter */ } },
    { name: "Hyperthyroidism", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia', 'hypertension'], ros: ['weight_loss', 'heat_intolerance', 'diarrhea', 'palpitations', 'anxiety', 'tremor'], pe: [] /* Goiter, exophthalmos, tremor */ } },

    // Musculoskeletal
    { name: "Low Back Pain (Musculoskeletal)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['back_pain'], pe: ['tenderness' /* Lumbar */] } },
    { name: "Low Back Pain (Radicular)", score: 0, system: "Musculoskeletal/Neurologic", criteria: { vitals: [], ros: ['back_pain', 'radiculopathy'], pe: ['tenderness' /* Lumbar */] /* Positive straight leg raise */ } },

    // Skin
    { name: "Cellulitis", score: 0, system: "Skin/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: [], pe: ['skin_erythema', 'skin_warmth', 'skin_swelling', 'tenderness'] } },

    // Psychiatric
    { name: "Depression/Anxiety", score: 0, system: "Psychiatric", criteria: { vitals: [], ros: ['fatigue', 'sad_mood', 'anxiety', 'sleep_disturbance', 'palpitations'], pe: [] } },
];

// --- Helper Function to Generate Basic Plan ---
function generatePlan(topDiagnoses) {
    if (!topDiagnoses || topDiagnoses.length === 0) {
        return "<li>No specific plan suggested. Consider basic workup based on presentation or consult clinical resources.</li>";
    }

    let planItems = new Set(); // Use a Set to avoid duplicate suggestions

    topDiagnoses.forEach(dx => {
        switch (dx.name) {
            case "Pneumonia":
            case "COVID-19":
                planItems.add("Consider CBC, BMP, Inflammatory markers (CRP/ESR), Blood cultures, Respiratory pathogen panel, Chest X-ray (CXR)");
                break;
            case "Acute Bronchitis":
            case "Upper Respiratory Infection (URI)":
                planItems.add("Usually clinical diagnosis. Consider symptomatic treatment. CXR if pneumonia suspected.");
                break;
            case "Pulmonary Embolism":
                planItems.add("Consider D-dimer (if low suspicion), CT Angiography (CTA) Chest, V/Q Scan, Lower extremity dopplers, EKG, Troponin, BNP");
                break;
            case "Asthma Exacerbation":
                planItems.add("Consider Peak Flow, Nebulizer treatment, Steroids, CXR to rule out other causes.");
                break;
            case "Heart Failure Exacerbation":
                planItems.add("Consider BNP, Troponin, CBC, BMP, EKG, CXR, Echocardiogram (if new/worsening)");
                break;
            case "Acute Coronary Syndrome (ACS)":
                planItems.add("STAT EKG, Troponin series, CBC, BMP, CXR. Consider MONA-BASH (Morphine, Oxygen, Nitrates, Aspirin, Beta-blocker, ACEi, Statin, Heparin)");
                break;
            case "Atrial Fibrillation":
                planItems.add("EKG, Troponin, BNP, CBC, BMP, TSH. Consider anticoagulation (CHADS2-VASc), Rate/Rhythm control.");
                break;
            case "Pericarditis":
                planItems.add("EKG, Troponin, Inflammatory markers (CRP/ESR), CXR, Echocardiogram.");
                break;
            case "Hypertensive Urgency/Emergency":
                planItems.add("EKG, Troponin, BMP, Urinalysis, Head CT (if neuro symptoms). Gradual BP reduction (Urgency) or IV meds (Emergency).");
                break;
            case "Gastroenteritis":
                planItems.add("Usually clinical diagnosis. Consider BMP (if dehydration), Stool studies (if severe/prolonged/bloody). Supportive care (hydration).");
                break;
            case "Appendicitis":
            case "Cholecystitis":
            case "Pancreatitis":
            case "Bowel Obstruction":
                planItems.add("CBC, BMP, LFTs, Lipase (if pancreatitis suspected), Urinalysis. Consider Abdominal X-ray, Ultrasound (RUQ for Cholecystitis), CT Abdomen/Pelvis. Surgical consult likely needed.");
                break;
            case "Urinary Tract Infection (UTI)/Pyelonephritis":
                planItems.add("Urinalysis (UA), Urine culture. Consider CBC, BMP, Blood cultures (if pyelo/sepsis suspected). Antibiotics.");
                break;
            case "Kidney Stone":
                planItems.add("UA, BMP. Consider CT Abdomen/Pelvis (non-contrast), Renal Ultrasound. Pain control, Hydration.");
                break;
            case "Otitis Media":
            case "Strep Pharyngitis":
                planItems.add("Clinical diagnosis often sufficient. Consider Rapid Strep Test / Throat Culture (for pharyngitis). Antibiotics if bacterial.");
                break;
            case "Migraine Headache":
                planItems.add("Clinical diagnosis. Consider abortive/prophylactic medications. Neuroimaging if red flags present.");
                break;
            case "Sepsis":
                planItems.add("STAT Lactate, Blood cultures x2, CBC, CMP, UA, CXR. Source control. Broad-spectrum IV antibiotics, IV fluids. Monitor vitals closely.");
                break;
            case "Anemia":
                planItems.add("CBC, Iron studies, B12, Folate, Reticulocyte count. Consider further workup based on type (e.g., GI eval for iron deficiency).");
                break;
            case "Hyperglycemia/DKA":
                planItems.add("Fingerstick glucose, BMP (check gap), ABG/VBG, UA (ketones), Serum ketones, CBC. IV fluids, Insulin drip, Electrolyte repletion.");
                break;
            case "Hypoglycemia":
                planItems.add("Fingerstick glucose. Give glucose (oral if awake, IV D50 if altered). Investigate cause.");
                break;
            case "Hypothyroidism":
            case "Hyperthyroidism":
                planItems.add("TSH, Free T4. Consider thyroid antibodies. Treatment based on results.");
                break;
            case "Low Back Pain (Musculoskeletal)":
                planItems.add("Usually clinical diagnosis. Conservative management (NSAIDs, PT). Imaging generally not needed unless red flags or persistent symptoms.");
                break;
            case "Low Back Pain (Radicular)":
                planItems.add("Clinical diagnosis. Conservative management initially. Consider MRI if red flags or failure of conservative therapy.");
                break;
            case "Cellulitis":
                planItems.add("Clinical diagnosis. Consider marking borders. CBC, Blood cultures if systemic signs. Antibiotics (cover Staph/Strep).");
                break;
            case "Depression/Anxiety":
                planItems.add("Clinical assessment (e.g., PHQ-9, GAD-7). Rule out organic causes (TSH, CBC, BMP). Consider therapy, SSRIs/SNRIs.");
                break;
            default:
                // Add a generic suggestion if no specific plan is listed
                planItems.add("Consider basic labs (CBC, BMP) and imaging based on primary symptoms.");
                break;
        }
    });

    // Convert Set back to list items
    let planHtml = "";
    planItems.forEach(item => {
        planHtml += `<li>${item}</li>`;
    });
    return planHtml;
}


function generateDdx() {
    // Reset scores
    diagnoses.forEach(dx => dx.score = 0);

    // Get selected inputs
    const age = document.getElementById('age').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const selectedVitals = Array.from(document.querySelectorAll('input[name="vitals"]:checked')).map(el => el.value);
    const selectedRos = Array.from(document.querySelectorAll('input[name="ros"]:checked')).map(el => el.value);
    const selectedPe = Array.from(document.querySelectorAll('input[name="pe"]:checked')).map(el => el.value);

    const allSelections = [...selectedVitals, ...selectedRos, ...selectedPe];

    // Basic Scoring Logic: +1 for each matching criterion
    diagnoses.forEach(dx => {
        let currentScore = 0;
        const criteria = [
            ...(dx.criteria.vitals || []),
            ...(dx.criteria.ros || []),
            ...(dx.criteria.pe || [])
        ];

        criteria.forEach(criterion => {
            if (allSelections.includes(criterion)) {
                currentScore++;
            }
        });

        // Simple boost for key findings (can be expanded)
        if (dx.name === "Appendicitis" && selectedPe.includes('rebound')) currentScore += 1;
        if (dx.name === "Heart Failure Exacerbation" && selectedPe.includes('jvd')) currentScore += 1;
        if (dx.name === "Pneumonia" && selectedPe.includes('rales')) currentScore += 1;
        if (dx.name === "Sepsis" && selectedVitals.includes('hypotension')) currentScore += 1;


        dx.score = currentScore;
    });

    // Filter out diagnoses with zero score and sort by score descending
    const potentialDdx = diagnoses
        .filter(dx => dx.score > 0)
        .sort((a, b) => b.score - a.score);

    // Display results
    const resultsList = document.getElementById('ddx-list');
    const planList = document.getElementById('plan-list'); // Get plan list element once

    resultsList.innerHTML = ''; // Clear previous results
    if (planList) planList.innerHTML = ''; // Clear previous plan

    if (potentialDdx.length === 0) {
        // No potential diagnoses found
        if (allSelections.length > 0) {
            resultsList.innerHTML = '<li>No specific diagnoses strongly suggested by these findings based on this simplified model. Consider broader possibilities or consult clinical resources.</li>';
        } else {
            resultsList.innerHTML = '<li>Please select patient findings to generate differentials.</li>';
        }
        // Set default plan message when no DDx
        if (planList) {
            planList.innerHTML = '<li>Please select findings to generate a plan.</li>';
        }
    } else {
        // Potential diagnoses found - display DDx and Plan
        const topDdx = potentialDdx.slice(0, 5);

        // Display top DDx
        topDdx.forEach(dx => {
            const listItem = document.createElement('li');
            listItem.textContent = `${dx.name} (Score: ${dx.score}, System: ${dx.system})`;
            resultsList.appendChild(listItem);
        });

        // Generate and Display Plan
        if (planList) {
             planList.innerHTML = generatePlan(topDdx); // Populate with generated plan items
        } else {
            console.error("Element with ID 'plan-list' not found.");
        }
    }

    // Send height update to parent window
    sendHeightToParent();
}

// Function to send the document height to the parent window
function sendHeightToParent() {
    const height = document.body.scrollHeight;
    // Send message to parent window; '*' allows any origin, consider restricting for security if needed
    window.parent.postMessage({ frameHeight: height }, '*');
}

// Initial generation and height sending on load
document.addEventListener('DOMContentLoaded', () => {
    generateDdx(); // Generate initial state (likely empty list)
    sendHeightToParent(); // Send initial height
});


// Add event listener to the form for real-time updates
document.getElementById('ddx-form').addEventListener('input', generateDdx); // Use 'input' for better responsiveness with number fields

// Optional: Use ResizeObserver for more robust height updates if content changes dynamically outside of generateDdx
// const resizeObserver = new ResizeObserver(sendHeightToParent);
// resizeObserver.observe(document.body);
