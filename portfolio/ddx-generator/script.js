// --- DOM Elements ---
const ageInput = document.getElementById('age');
const ddxListUl = document.getElementById('ddx-list');
const planSuggestionP = document.getElementById('plan-suggestion');
const inputElements = document.querySelectorAll('.input-section input'); // Select all inputs (age + checkboxes)

// --- Simplified Knowledge Base (Illustrative Example for Rash) ---
// Structure: { diagnosis: { name: "...", findings: ["finding_id", ...], plan: "...", baseScore: X } }
// Findings increase the score. We can add negative associations later if needed.
const knowledgeBase = {
    measles: {
        name: "Measles (Rubeola)",
        findings: ["fever", "sore_throat", "maculopapular", "starts_face"],
        plan: "Supportive care, hydration, vitamin A if indicated. Consider measles IgG/IgM, PCR. Reportable illness.",
        baseScore: 5 // Base likelihood
    },
    varicella: {
        name: "Varicella (Chickenpox)",
        findings: ["fever", "itchy", "vesicular"],
        plan: "Supportive care, hydration, antihistamines for itch. Consider acyclovir in specific populations. Avoid aspirin.",
        baseScore: 5
    },
    urticaria: {
        name: "Urticaria (Hives)",
        findings: ["itchy", "urticaria", "new_medication"], // Often associated with triggers
        plan: "Identify and avoid triggers. Antihistamines (H1 blockers). Consider H2 blockers or steroids if severe/persistent.",
        baseScore: 10 // Common
    },
    drug_eruption: {
        name: "Drug Eruption",
        findings: ["new_medication", "maculopapular", "itchy"], // Can be varied
        plan: "Stop offending medication if possible. Supportive care, antihistamines, topical steroids. Consider biopsy if severe/unclear.",
        baseScore: 8
    },
    sjs_ten: {
        name: "SJS/TEN Spectrum",
        findings: ["new_medication", "fever", "nikolsky_pos", "maculopapular", "vesicular"], // Severe, +Nikolsky is key
        plan: "EMERGENCY. Stop offending drug immediately. Hospital admission (often burn unit). Supportive care, wound care, pain management. Ophthalmology consult.",
        baseScore: 1 // Rare but critical
    },
    // Chest Pain DDx Examples
    acs: {
        name: "Acute Coronary Syndrome (ACS)",
        findings: ["cp_pressure", "cp_radiation", "cp_worse_exertion", "sob"],
        plan: "EMERGENCY. ECG, Troponins, Aspirin, Nitrates (if BP allows), Oxygen if hypoxic. Cardiology consult.",
        baseScore: 8
    },
    pe: {
        name: "Pulmonary Embolism (PE)",
        findings: ["sob", "cp_pleuritic", "hemoptysis", "leg_swelling", "recent_travel"], // Travel/immobility not checkbox yet
        plan: "Consider D-dimer (if low pretest prob), CT Angiogram or V/Q scan. Anticoagulation (e.g., Heparin, LMWH, DOAC).",
        baseScore: 6
    },
    gerd: {
        name: "Gastroesophageal Reflux Disease (GERD)",
        findings: ["cp_worse_eating", "cough"], // Can present as non-cardiac CP
        plan: "Trial of PPI or H2 blocker. Lifestyle modifications (diet, elevate head of bed). Consider EGD if persistent/alarm features.",
        baseScore: 10 // Very common
    },
    costochondritis: {
        name: "Costochondritis/Musculoskeletal CP",
        findings: ["cp_reproducible", "cp_pleuritic"], // Pleuritic can overlap
        plan: "Reassurance, NSAIDs, rest. Rule out more serious causes.",
        baseScore: 9
    },
     // Respiratory DDx Examples
    asthma_exacerbation: {
        name: "Asthma Exacerbation",
        findings: ["sob", "wheezing", "cough"],
        plan: "Inhaled beta-agonists (e.g., Albuterol), inhaled corticosteroids (ICS), possibly systemic steroids. Assess peak flow.",
        baseScore: 7
    },
    pneumonia: {
        name: "Pneumonia",
        findings: ["fever", "cough", "sob", "cp_pleuritic"],
        plan: "Chest X-ray. Consider CBC, blood cultures, sputum culture. Antibiotics based on likely pathogen (community vs hospital acquired).",
        baseScore: 6
    },
    // GI DDx Examples
    gastroenteritis: {
        name: "Gastroenteritis",
        findings: ["nausea_vomiting", "diarrhea", "abd_pain", "fever"],
        plan: "Supportive care, hydration (oral rehydration solution). Antiemetics/antidiarrheals if needed. Consider stool studies if severe/prolonged/bloody.",
        baseScore: 10 // Very common
    },
    appendicitis: {
        name: "Appendicitis",
        findings: ["abd_pain", "nausea_vomiting", "fever"], // Pain often starts periumbilical then RLQ
        plan: "Surgical consult. CT abdomen/pelvis or Ultrasound. NPO, IV fluids, pain control, antibiotics.",
        baseScore: 4
    },
    cholecystitis: {
        name: "Cholecystitis",
        findings: ["abd_pain", "nausea_vomiting", "fever", "jaundice"], // RUQ pain, +Murphy's sign (not checkbox)
        plan: "Ultrasound RUQ. CBC, LFTs, Lipase. NPO, IV fluids, pain control, antibiotics. Surgical consult.",
        baseScore: 3
    },
    // MSK DDx Examples
    muscle_strain: {
        name: "Muscle Strain / Sprain",
        findings: ["muscle_ache", "back_pain", "cp_reproducible"], // Can cause reproducible chest wall pain
        plan: "Rest, Ice/Heat, NSAIDs, stretching/physical therapy.",
        baseScore: 10 // Very common
    },
    arthritis: {
        name: "Arthritis Flare (Inflammatory/Osteo)",
        findings: ["joint_pain", "muscle_ache"],
        plan: "NSAIDs, Acetaminophen. Consider joint aspiration if septic arthritis suspected. Rheumatology referral if inflammatory.",
        baseScore: 7
    },
    // Neuro DDx Examples
    migraine: {
        name: "Migraine Headache",
        findings: ["headache", "nausea_vomiting"], // Often unilateral, pulsating, photo/phonophobia (not checkboxes)
        plan: "Abortive therapy (NSAIDs, Triptans). Prophylactic therapy if frequent. Identify triggers.",
        baseScore: 8
    },
    stroke_tia: {
        name: "Stroke / TIA",
        findings: ["focal_deficit", "altered_mental_status", "headache", "dizziness"], // Sudden onset is key
        plan: "EMERGENCY. Non-contrast Head CT STAT. Neurological consult. Consider thrombolysis/thrombectomy if indicated.",
        baseScore: 2
    },
    vertigo_bppv: {
        name: "Vertigo (e.g., BPPV)",
        findings: ["dizziness"], // Specific positional triggers (not checkbox)
        plan: "Dix-Hallpike maneuver for diagnosis. Epley maneuver for treatment (BPPV). Consider Meclizine short-term.",
        baseScore: 7
    },
    tension_headache: {
        name: "Tension Headache",
        findings: ["headache", "muscle_ache"], // Often bilateral, band-like
        plan: "Reassurance, NSAIDs/Acetaminophen, stress reduction techniques.",
        baseScore: 12 // Very common
    },
    cluster_headache: {
        name: "Cluster Headache",
        findings: ["headache"], // Severe, unilateral, orbital/temporal, autonomic symptoms (not checkboxes)
        plan: "High-flow oxygen, Sumatriptan (subcutaneous/nasal). Prophylaxis (e.g., Verapamil). Neurology consult.",
        baseScore: 2
    },
     meningitis: {
        name: "Meningitis",
        findings: ["headache", "fever", "altered_mental_status"], // Neck stiffness (not checkbox)
        plan: "EMERGENCY. Lumbar Puncture STAT (after Head CT if focal deficit/papilledema). Empiric antibiotics + steroids. Droplet precautions.",
        baseScore: 1
    },
    sah: {
        name: "Subarachnoid Hemorrhage (SAH)",
        findings: ["headache", "nausea_vomiting", "altered_mental_status"], // Sudden, severe ("thunderclap") headache is key
        plan: "EMERGENCY. Non-contrast Head CT STAT. If CT negative but high suspicion, Lumbar Puncture. Neurosurgery consult.",
        baseScore: 1
    },
    ibs: {
        name: "Irritable Bowel Syndrome (IBS)",
        findings: ["abd_pain", "diarrhea"], // Often alternating constipation/diarrhea, related to stress/food
        plan: "Diagnosis of exclusion. Lifestyle/diet modification (e.g., low FODMAP). Symptomatic treatment (antispasmodics, fiber, etc.).",
        baseScore: 9
    },
    pud: {
        name: "Peptic Ulcer Disease (PUD)",
        findings: ["abd_pain", "nausea_vomiting", "cp_worse_eating"], // Epigastric pain, can be worse/better with food
        plan: "PPI therapy. Test for H. pylori (breath test, stool antigen, or biopsy). Consider EGD.",
        baseScore: 7
    },
    fibromyalgia: {
        name: "Fibromyalgia",
        findings: ["muscle_ache", "joint_pain", "back_pain", "headache"], // Widespread pain, fatigue, tender points
        plan: "Multimodal approach: Exercise, CBT, patient education. Medications (e.g., TCAs, SNRIs, Gabapentinoids).",
        baseScore: 6
    },
    herniated_disc: {
        name: "Herniated Disc / Radiculopathy",
        findings: ["back_pain", "focal_deficit"], // Often radiating pain, numbness/weakness
        plan: "Conservative management initially (NSAIDs, PT). Consider MRI if persistent/red flags. Pain management/Neurosurgery consult if severe.",
        baseScore: 5
    },
    pneumothorax: {
        name: "Pneumothorax",
        findings: ["sob", "cp_pleuritic"], // Sudden onset SOB/pleuritic CP, decreased breath sounds (not checkbox)
        plan: "Chest X-ray STAT. Oxygen. If large or tension, needle decompression / chest tube placement.",
        baseScore: 3
    },
    cellulitis: {
        name: "Cellulitis",
        findings: ["localized_redness", "fever"], // Localized skin infection findings
        plan: "Antibiotics covering likely pathogens (e.g., Staph, Strep). Mark borders. Elevate limb if applicable. Consider CBC, blood cultures if systemic signs.",
        baseScore: 8
    }
    // Add more conditions as needed
};

// --- Core Logic ---

function calculateDDx() {
    const findings = {};
    // Collect all input values
    findings.age = parseInt(ageInput.value) || null; // Get age or null
    document.querySelectorAll('.input-section input[type="checkbox"]').forEach(cb => {
        findings[cb.value] = cb.checked; // Store boolean state for each finding ID
    });

    let ddxResults = [];

    // Score each diagnosis based on findings
    for (const dxKey in knowledgeBase) {
        const dx = knowledgeBase[dxKey];
        let score = dx.baseScore;

        // Increase score for matching findings
        let numberOfMatchingFindings = 0;
        dx.findings.forEach(findingId => {
            if (findings[findingId] === true) {
                numberOfMatchingFindings++;
                // Increase base score boost for a match - Make it much larger
                let boost = 30; // Higher default boost

                // Specific high-yield findings get even larger boosts
                if (findingId === 'headache' && (dxKey === 'migraine' || dxKey === 'tension_headache' || dxKey === 'cluster_headache' || dxKey === 'meningitis' || dxKey === 'sah')) boost = 50; // Significantly boost headache diagnoses if headache is checked
                if (findingId === 'focal_deficit' && dxKey === 'stroke_tia') boost = 60;
                if (findingId === 'nikolsky_pos' && dxKey === 'sjs_ten') boost = 60;
                if (findingId === 'cp_pressure' && dxKey === 'acs') boost = 40;
                if (findingId === 'leg_swelling' && dxKey === 'pe') boost = 35;
                if (findingId === 'cp_reproducible' && dxKey === 'costochondritis') boost = 35;
                if (findingId === 'wheezing' && dxKey === 'asthma_exacerbation') boost = 35;
                if (findingId === 'jaundice' && dxKey === 'cholecystitis') boost = 40;
                if (findingId === 'localized_redness' && dxKey === 'cellulitis') boost = 40;

                score += boost;

                 // Penalties / Negative Associations (Example)
                 // If headache is present, slightly reduce likelihood of purely peripheral things?
                 // This can get complex and requires careful tuning. Let's keep it simple for now.
                 // if (findings['headache'] === true && dxKey === 'costochondritis') score -= 5;


                 // Existing special boosts/penalties (keep but adjust base boost above)
                 // if (dxKey === 'sjs_ten' && findings['nikolsky_pos'] === true) score += 30; // Covered by boost logic now
                 if (dxKey !== 'sjs_ten' && findings['nikolsky_pos'] === true) score -= 10; // Penalize others if +Nikolsky
                 if (dxKey === 'sjs_ten' && findings['nikolsky_neg'] === true) score -= 20; // Penalize SJS if -Nikolsky

                 // Removed redundant score adjustments here - rely on initial boost logic
            }
        });

        // Adjust score based on age (very simplified example)
        if (findings.age !== null) {
            if ((dxKey === 'measles' || dxKey === 'varicella') && findings.age > 40) {
                score -= 5; // Less common in older adults if first presentation
            }
            // Add age adjustments for other conditions if needed
             if (dxKey === 'acs' && findings.age > 50) score += 5;
             if (dxKey === 'stroke_tia' && findings.age > 60) score += 5;
        }

        // Determine if *any* finding was checked by the user
        const anyFindingChecked = Object.values(findings).some(f => f === true);

        // Include if:
        // 1. At least one finding was checked by the user AND
        // 2. At least one of this diagnosis's findings was matched AND
        // 3. The final score is greater than the base score
        if (anyFindingChecked && numberOfMatchingFindings > 0 && score > dx.baseScore) {
             // Ensure score is non-negative
             score = Math.max(0, score);
             ddxResults.push({ name: dx.name, score: score, plan: dx.plan });
        } else if (!anyFindingChecked) {
             // If nothing is checked, maybe show top 5 base scores? Or nothing? Let's show nothing for now.
             // ddxResults.push({ name: dx.name, score: score, plan: dx.plan }); // Keep this line if you want to show base scores
        }


    }

    // Sort by score descending
    ddxResults.sort((a, b) => b.score - a.score);

    // Calculate likelihood percentages (simple normalization)
    const totalScore = ddxResults.reduce((sum, dx) => sum + dx.score, 0);
    if (totalScore > 0) {
        ddxResults = ddxResults.map(dx => ({
            ...dx,
            likelihood: ((dx.score / totalScore) * 100).toFixed(1)
        }));
    } else {
         ddxResults = ddxResults.map(dx => ({ ...dx, likelihood: 'N/A' }));
    }


    updateUI(ddxResults);
}

function updateUI(ddxResults) {
    ddxListUl.innerHTML = ''; // Clear previous list

    // --- TEMPORARY DEBUG ---
    // Display the count of results found, even if zero
    const debugMsg = `DEBUG: Found ${ddxResults.length} potential diagnoses.`;
    const debugLi = document.createElement('li');
    debugLi.style.color = 'orange';
    debugLi.textContent = debugMsg;
    ddxListUl.appendChild(debugLi);
    // --- END TEMP DEBUG ---


    if (ddxResults.length === 0) {
        // Keep the default message if no results, but the debug line will also show
        if (ddxListUl.children.length <= 1) { // Avoid adding default msg if debug msg is already there
             ddxListUl.innerHTML += '<li>Enter findings to generate ideas...</li>';
        }
        planSuggestionP.textContent = 'Plan suggestions will appear here based on top differential ideas.';
        return;
    }

    // Display top N results (e.g., top 5)
    const topN = 5;
    ddxResults.slice(0, topN).forEach(dx => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${dx.name}</strong> (Likelihood: ${dx.likelihood}%)`;
        ddxListUl.appendChild(li);
    });

    // Suggest plan based on top diagnosis (or combination)
    if (ddxResults.length > 0) {
        planSuggestionP.textContent = `Based on the top possibility (${ddxResults[0].name}), consider: ${ddxResults[0].plan}`;
        // Could add logic here to combine plans or suggest broader workup if likelihoods are close
    } else {
         planSuggestionP.textContent = 'Plan suggestions will appear here based on top differential ideas.';
    }
}

// --- Event Listeners ---

// Add listener to all input elements (age and checkboxes)
inputElements.forEach(element => {
    element.addEventListener('input', calculateDDx); // 'input' covers number changes and checkbox clicks
});

// --- Initial Calculation ---
calculateDDx(); // Run once on load (will show default message)
