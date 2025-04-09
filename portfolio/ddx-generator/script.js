// --- DOM Elements ---
const generateBtn = document.getElementById('generate-btn');
const ddxListUl = document.getElementById('ddx-list');
const planSuggestionP = document.getElementById('plan-suggestion');

// --- Event Listener ---
generateBtn.addEventListener('click', generatePlaceholderDDx);

// --- Placeholder Logic ---
function generatePlaceholderDDx() {
    // Clear previous results
    ddxListUl.innerHTML = '';
    planSuggestionP.textContent = 'Plan suggestions will appear here...';

    // Get a few example inputs (can be expanded later)
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const isFeverChecked = document.getElementById('ros_fever')?.checked;
    const isHeadacheChecked = document.getElementById('ros_headache')?.checked;
    // Add more input gathering here if needed for more complex placeholder logic

    let ddxResults = [];
    let planSuggestions = [];

    // --- VERY BASIC PLACEHOLDER LOGIC ---
    // This is NOT medically accurate and only serves as a UI demo

    if (isFeverChecked) {
        ddxResults.push("Infection (Placeholder)");
        planSuggestions.push("Consider basic labs like CBC (Placeholder).");
    }

    if (isHeadacheChecked) {
        ddxResults.push("Headache Syndrome (Placeholder)");
        planSuggestions.push("Consider neurological exam details (Placeholder).");
        if (parseInt(age) > 50) {
             ddxResults.push("Rule out secondary causes (Placeholder - Age > 50)");
             planSuggestions.push("Consider imaging if red flags present (Placeholder).");
        }
    }

    // --- Update UI ---
    if (ddxResults.length === 0) {
        ddxListUl.innerHTML = '<li>No specific findings selected for placeholder logic.</li>';
        planSuggestionP.textContent = 'Enter information and click generate...';
    } else {
        ddxResults.forEach(dx => {
            const li = document.createElement('li');
            li.textContent = dx;
            ddxListUl.appendChild(li);
        });

        if (planSuggestions.length > 0) {
            planSuggestionP.textContent = "Placeholder Plan: " + planSuggestions.join(' ');
        } else {
             planSuggestionP.textContent = 'No specific plan suggestions for these placeholders.';
        }
    }
}

// --- Initial State ---
// No initial calculation needed, waits for button click.
