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

];

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
    resultsList.innerHTML = ''; // Clear previous results

    if (potentialDdx.length === 0 && allSelections.length > 0) {
         resultsList.innerHTML = '<li>No specific diagnoses strongly suggested by these findings based on this simplified model. Consider broader possibilities or consult clinical resources.</li>';
    } else if (potentialDdx.length === 0) {
         resultsList.innerHTML = '<li>Please select patient findings to generate differentials.</li>';
    } else {
        // Display top 5 or fewer
        const topDdx = potentialDdx.slice(0, 5);
        topDdx.forEach(dx => {
            const listItem = document.createElement('li');
            listItem.textContent = `${dx.name} (Score: ${dx.score}, System: ${dx.system})`;
            resultsList.appendChild(listItem);
        });
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
