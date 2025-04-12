// Basic data structure for diagnoses and their associated findings
// NOTE: This is a highly simplified model for demonstration. Real-world DDx requires extensive medical knowledge and complex algorithms/data.
const diagnoses = [
    // Respiratory
    { name: "Pneumonia", score: 0, system: "Respiratory", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'chest_pain', 'chills', 'fatigue'], pe: ['rales', 'rhonchi', 'decreased_breath_sounds', 'ill_appearing'] } },
    { name: "Acute Bronchitis", score: 0, system: "Respiratory", criteria: { vitals: ['fever'], ros: ['cough', 'sob', 'fatigue'], pe: ['rhonchi', 'wheezes'] } },
    { name: "COPD Exacerbation", score: 0, system: "Respiratory", criteria: { vitals: ['tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'wheezing', 'sputum_change'], pe: ['wheezes', 'decreased_breath_sounds'] } },
    { name: "Pulmonary Embolism", score: 0, system: "Respiratory/Cardiovascular", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypoxia'], ros: ['sob', 'chest_pain'], pe: ['leg_swelling_unilateral'] /* Often normal exam */ } },
    { name: "Asthma Exacerbation", score: 0, system: "Respiratory", criteria: { vitals: ['tachycardia', 'tachypnea'], ros: ['sob', 'cough', 'wheezing'], pe: ['wheezes'] } },
    { name: "Upper Respiratory Infection (URI)", score: 0, system: "Respiratory/HEENT", criteria: { vitals: ['fever'], ros: ['sore_throat', 'cough', 'headache', 'fatigue', 'nasal_congestion'], pe: ['pharyngeal_erythema'] } },
    { name: "COVID-19", score: 0, system: "Respiratory/Constitutional", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'fatigue', 'headache', 'sore_throat'], pe: ['decreased_breath_sounds'] } },
    { name: "Pneumothorax", score: 0, system: "Respiratory", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypoxia'], ros: ['sob', 'chest_pain'], pe: ['decreased_breath_sounds'] /* Unilateral */ } },
    { name: "Pleural Effusion", score: 0, system: "Respiratory", criteria: { vitals: ['tachypnea', 'hypoxia'], ros: ['sob', 'cough', 'chest_pain'], pe: ['decreased_breath_sounds', 'dullness_to_percussion'] } },
    { name: "Interstitial Lung Disease (ILD)", score: 0, system: "Respiratory", criteria: { vitals: ['tachypnea', 'hypoxia'], ros: ['sob', 'cough' /* Dry */, 'fatigue'], pe: ['rales' /* Velcro */] } },
    { name: "Lung Cancer", score: 0, system: "Oncology/Respiratory", criteria: { vitals: [], ros: ['cough', 'sob', 'chest_pain', 'weight_loss', 'fatigue'], pe: ['cachectic', 'decreased_breath_sounds'] } },
    { name: "Tuberculosis (Pulmonary)", score: 0, system: "Infectious/Respiratory", criteria: { vitals: ['fever'], ros: ['cough', 'weight_loss', 'fatigue', 'night_sweats', 'hemoptysis'], pe: ['rales'] } },
    { name: "Sarcoidosis", score: 0, system: "Rheum/Respiratory", criteria: { vitals: [], ros: ['cough', 'sob', 'fatigue', 'rash', 'eye_redness'], pe: ['rales', 'lymphadenopathy', 'skin_lesions_specific'] } },
    { name: "Aspiration Pneumonia", score: 0, system: "Respiratory/Infectious", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypoxia'], ros: ['cough', 'sob', 'sputum_change', 'confusion'], pe: ['rales', 'rhonchi', 'decreased_breath_sounds', 'altered_mental_status'] } },
    { name: "Lung Abscess", score: 0, system: "Respiratory/Infectious", criteria: { vitals: ['fever'], ros: ['cough', 'sputum_change' /* Foul */, 'chest_pain', 'weight_loss', 'fatigue'], pe: ['decreased_breath_sounds', 'rales'] } },
    { name: "Pulmonary Fibrosis", score: 0, system: "Respiratory", criteria: { vitals: ['tachypnea', 'hypoxia'], ros: ['sob', 'cough' /* Dry */, 'fatigue'], pe: ['rales' /* Velcro */] } }, // Similar to ILD


    // Cardiovascular
    { name: "Heart Failure Exacerbation", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypoxia', 'hypertension'], ros: ['sob', 'edema', 'cough', 'fatigue'], pe: ['jvd', 'pedal_edema', 'rales'] } },
    { name: "Acute Coronary Syndrome (ACS)", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia', 'hypertension', 'hypotension'], ros: ['chest_pain', 'sob', 'nausea', 'fatigue'], pe: [] /* Often normal exam */ } },
    { name: "Atrial Fibrillation", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia'], ros: ['palpitations', 'sob', 'fatigue', 'chest_pain'], pe: [] /* Irregularly irregular pulse */ } },
    { name: "Pericarditis", score: 0, system: "Cardiovascular", criteria: { vitals: ['fever', 'tachycardia'], ros: ['chest_pain', 'sob'], pe: [] /* Pericardial friction rub */ } },
    { name: "Hypertensive Urgency/Emergency", score: 0, system: "Cardiovascular", criteria: { vitals: ['hypertension'], ros: ['headache', 'vision_change', 'chest_pain', 'sob'], pe: [] } },
    { name: "Deep Vein Thrombosis (DVT)", score: 0, system: "Cardiovascular", criteria: { vitals: [], ros: ['leg_pain', 'leg_swelling'], pe: ['leg_swelling_unilateral', 'leg_tenderness_calf'] } },
    { name: "Aortic Dissection", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia', 'hypertension', 'hypotension'], ros: ['chest_pain' /* Tearing */, 'back_pain', 'sob', 'abd_pain'], pe: ['unequal_pulses_bp'] } },
    { name: "Endocarditis", score: 0, system: "Cardiovascular/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: ['fatigue', 'sob', 'chills', 'weight_loss'], pe: ['murmur' /* New/changed */, 'petechiae', 'splinter_hemorrhages'] } },
    { name: "Supraventricular Tachycardia (SVT)", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia'], ros: ['palpitations', 'sob', 'chest_pain', 'anxiety'], pe: [] } },
    { name: "Heart Block (High Degree)", score: 0, system: "Cardiovascular", criteria: { vitals: ['bradycardia', 'hypotension'], ros: ['fatigue', 'sob', 'confusion'], pe: [] } },
    { name: "Peripheral Artery Disease (PAD)", score: 0, system: "Vascular", criteria: { vitals: [], ros: ['leg_pain' /* Claudication */], pe: ['decreased_pedal_pulses'] } },
    { name: "Aortic Stenosis", score: 0, system: "Cardiovascular", criteria: { vitals: [], ros: ['sob', 'chest_pain', 'fatigue' /* Syncope */], pe: ['murmur' /* Systolic ejection */] } },
    { name: "Myocarditis", score: 0, system: "Cardiovascular/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: ['chest_pain', 'sob', 'fatigue', 'palpitations'], pe: ['murmur', 'rales'] } },
    { name: "Vasculitis (General)", score: 0, system: "Rheum/Vascular", criteria: { vitals: ['fever'], ros: ['fatigue', 'weight_loss', 'rash', 'joint_pain', 'muscle_pain'], pe: ['skin_lesions_specific', 'decreased_pulses'] } },
    { name: "Angina (Stable/Unstable)", score: 0, system: "Cardiovascular", criteria: { vitals: [], ros: ['chest_pain' /* Substernal, exertional/rest */, 'sob'], pe: [] } },
    { name: "Cardiomyopathy", score: 0, system: "Cardiovascular", criteria: { vitals: ['tachycardia'], ros: ['sob', 'fatigue', 'edema', 'palpitations'], pe: ['jvd', 'pedal_edema', 'rales', 'murmur'] } },
    { name: "Syncope (Vasovagal/Orthostatic/Cardiac)", score: 0, system: "Cardiovascular/Neurologic", criteria: { vitals: ['bradycardia', 'hypotension'], ros: ['syncope_episode', 'palpitations', 'fatigue'], pe: [] } }, // Need syncope ROS


    // Gastrointestinal
    { name: "Gastroenteritis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'diarrhea', 'abd_pain', 'fatigue'], pe: ['tenderness'] } },
    { name: "Appendicitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness', 'rebound', 'guarding', 'ill_appearing'] } },
    { name: "Cholecystitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness' /* RUQ */, 'guarding'] } },
    { name: "Pancreatitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia', 'hypotension'], ros: ['nausea', 'vomiting', 'abd_pain'], pe: ['tenderness' /* Epigastric */, 'distension'] } },
    { name: "Bowel Obstruction", score: 0, system: "Gastrointestinal", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['nausea', 'vomiting', 'abd_pain', 'constipation'], pe: ['tenderness', 'distension'] } },
    { name: "GERD", score: 0, system: "Gastrointestinal", criteria: { vitals: [], ros: ['heartburn', 'chest_pain', 'cough'], pe: [] } },
    { name: "Peptic Ulcer Disease (PUD)", score: 0, system: "Gastrointestinal", criteria: { vitals: ['tachycardia'], ros: ['abd_pain' /* Epigastric */, 'heartburn', 'nausea'], pe: ['tenderness' /* Epigastric */] } },
    { name: "Diverticulitis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['abd_pain' /* LLQ */, 'diarrhea', 'constipation', 'nausea'], pe: ['tenderness' /* LLQ */] } },
    { name: "Inflammatory Bowel Disease (IBD - Crohn's/UC)", score: 0, system: "Gastrointestinal", criteria: { vitals: ['fever', 'tachycardia'], ros: ['abd_pain', 'diarrhea' /* Bloody */, 'weight_loss', 'fatigue'], pe: ['tenderness'] } },
    { name: "Irritable Bowel Syndrome (IBS)", score: 0, system: "Gastrointestinal", criteria: { vitals: [], ros: ['abd_pain', 'diarrhea', 'constipation' /* Alternating */, 'bloating'], pe: ['tenderness' /* Mild */] } },
    { name: "Mesenteric Ischemia", score: 0, system: "Gastrointestinal/Vascular", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['abd_pain' /* Severe, out of proportion */, 'nausea', 'vomiting', 'diarrhea'], pe: ['tenderness' /* Often mild initially */] } },
    { name: "Abdominal Aortic Aneurysm (AAA) Leak/Rupture", score: 0, system: "Vascular", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['abd_pain', 'back_pain'], pe: ['pulsatile_abdominal_mass'] } },
    { name: "Esophageal Spasm", score: 0, system: "Gastrointestinal", criteria: { vitals: [], ros: ['chest_pain', 'dysphagia'], pe: [] } },
    { name: "Hepatitis (Acute/Chronic)", score: 0, system: "Gastrointestinal/Infectious", criteria: { vitals: ['fever'], ros: ['fatigue', 'nausea', 'abd_pain' /* RUQ */, 'itching'], pe: ['jaundice', 'tenderness' /* RUQ */] } },
    { name: "Gastritis", score: 0, system: "Gastrointestinal", criteria: { vitals: [], ros: ['abd_pain' /* Epigastric */, 'nausea', 'vomiting', 'heartburn'], pe: ['tenderness' /* Epigastric */] } },
    { name: "Constipation (as primary Dx)", score: 0, system: "Gastrointestinal", criteria: { vitals: [], ros: ['constipation', 'abd_pain', 'bloating'], pe: ['distension', 'tenderness'] } },
    { name: "Cirrhosis", score: 0, system: "Gastrointestinal", criteria: { vitals: ['hypotension'], ros: ['fatigue', 'weight_loss', 'abd_pain', 'edema', 'itching'], pe: ['jaundice', 'ascites', 'spider_angiomata', 'palmar_erythema'] } },
    { name: "C. difficile Colitis", score: 0, system: "Gastrointestinal/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: ['diarrhea' /* Watery */, 'abd_pain', 'nausea'], pe: ['tenderness'] } },
    { name: "Ischemic Colitis", score: 0, system: "Gastrointestinal/Vascular", criteria: { vitals: ['hypotension'], ros: ['abd_pain' /* LLQ common */, 'diarrhea' /* Bloody */], pe: ['tenderness'] } },
    { name: "Gastroparesis", score: 0, system: "Gastrointestinal/Endocrine", criteria: { vitals: [], ros: ['nausea', 'vomiting', 'abd_pain', 'bloating', 'early_satiety'], pe: [] } },
    { name: "Acute Gastric Ulcer Perforation", score: 0, system: "Gastrointestinal/Surgical", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['abd_pain' /* Sudden, severe */, 'nausea', 'vomiting'], pe: ['tenderness', 'rebound', 'guarding' /* Rigid abdomen */, 'ill_appearing'] } },
    { name: "Choledocholithiasis/Cholangitis", score: 0, system: "Gastrointestinal/Hepatobiliary", criteria: { vitals: ['fever', 'tachycardia', 'hypotension'], ros: ['abd_pain' /* RUQ */, 'nausea', 'vomiting', 'itching'], pe: ['jaundice', 'tenderness' /* RUQ */, 'altered_mental_status'] } },
    { name: "GI Bleed (Upper - e.g., ulcer, varices)", score: 0, system: "Gastrointestinal", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['abd_pain', 'nausea', 'vomiting' /* Coffee ground */, 'melena'], pe: ['pallor', 'tenderness'] } }, // Need melena/hematemesis ROS
    { name: "GI Bleed (Lower - e.g., diverticular, AVM)", score: 0, system: "Gastrointestinal", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['hematochezia'], pe: ['pallor'] } }, // Need hematochezia ROS
    { name: "Celiac Disease", score: 0, system: "Gastrointestinal/Autoimmune", criteria: { vitals: [], ros: ['diarrhea', 'abd_pain', 'bloating', 'weight_loss', 'fatigue'], pe: [] } },


    // Genitourinary
    { name: "Urinary Tract Infection (UTI)/Pyelonephritis", score: 0, system: "Genitourinary", criteria: { vitals: ['fever', 'tachycardia'], ros: ['dysuria', 'frequency', 'abd_pain', 'nausea', 'vomiting', 'fatigue'], pe: ['tenderness' /* Suprapubic or CVA */] } },
    { name: "Kidney Stone", score: 0, system: "Genitourinary", criteria: { vitals: ['tachycardia'], ros: ['abd_pain' /* Flank */, 'nausea', 'vomiting', 'hematuria', 'dysuria'], pe: ['tenderness' /* CVA */] } },
    { name: "Epididymitis/Orchitis", score: 0, system: "Genitourinary", criteria: { vitals: ['fever'], ros: ['testicular_pain', 'testicular_swelling'], pe: ['testicular_tenderness', 'testicular_swelling'] } },
    { name: "Testicular Torsion", score: 0, system: "Genitourinary/Surgical", criteria: { vitals: [], ros: ['testicular_pain' /* Sudden, severe */, 'nausea', 'vomiting'], pe: ['testicular_tenderness', 'testicular_swelling', 'absent_cremasteric_reflex'] } },
    { name: "Ovarian Torsion", score: 0, system: "Genitourinary/OBGYN", criteria: { vitals: ['tachycardia'], ros: ['abd_pain' /* Sudden, severe lower */, 'nausea', 'vomiting'], pe: ['adnexal_tenderness'] } },
    { name: "Ectopic Pregnancy", score: 0, system: "Genitourinary/OBGYN", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['abd_pain', 'vaginal_bleeding', 'missed_period'], pe: ['tenderness', 'cervical_motion_tenderness'] } },
    { name: "Prostatitis", score: 0, system: "Genitourinary", criteria: { vitals: ['fever'], ros: ['dysuria', 'frequency', 'pelvic_pain'], pe: ['prostate_tenderness'] } },
    { name: "Pelvic Inflammatory Disease (PID)", score: 0, system: "Genitourinary/OBGYN", criteria: { vitals: ['fever'], ros: ['abd_pain' /* Lower */, 'vaginal_discharge', 'dyspareunia'], pe: ['cervical_motion_tenderness', 'adnexal_tenderness'] } },
    { name: "Nephrotic Syndrome", score: 0, system: "Renal", criteria: { vitals: [], ros: ['edema' /* Generalized */, 'fatigue'], pe: ['pedal_edema', 'ascites', 'periorbital_edema'] } },
    { name: "Acute Kidney Injury (AKI)", score: 0, system: "Renal", criteria: { vitals: ['hypertension', 'hypotension'], ros: ['fatigue', 'nausea', 'decreased_urine_output', 'edema'], pe: ['pedal_edema'] } },
    { name: "Glomerulonephritis", score: 0, system: "Renal/Rheum", criteria: { vitals: ['hypertension'], ros: ['hematuria', 'edema', 'fatigue'], pe: ['pedal_edema'] } },
    { name: "Benign Prostatic Hyperplasia (BPH)", score: 0, system: "Genitourinary", criteria: { vitals: [], ros: ['frequency', 'urgency', 'nocturia', 'weak_stream'], pe: ['enlarged_prostate'] } }, // Need more specific ROS/PE
    { name: "Chronic Kidney Disease (CKD)", score: 0, system: "Renal", criteria: { vitals: ['hypertension'], ros: ['fatigue', 'nausea', 'itching', 'edema'], pe: ['pedal_edema'] } }, // Often asymptomatic until late


    // HEENT
    { name: "Otitis Media", score: 0, system: "HEENT", criteria: { vitals: ['fever'], ros: ['ear_pain'], pe: ['tm_bulging'] } },
    { name: "Strep Pharyngitis", score: 0, system: "HEENT", criteria: { vitals: ['fever'], ros: ['sore_throat', 'headache'], pe: ['pharyngeal_erythema'] } },
    { name: "Migraine Headache", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['headache', 'nausea', 'vomiting', 'vision_change'], pe: [] } },
    { name: "Conjunctivitis (Viral/Bacterial/Allergic)", score: 0, system: "HEENT", criteria: { vitals: [], ros: ['eye_redness', 'eye_discharge', 'eye_itching'], pe: ['conjunctival_injection', 'eye_discharge_type'] } },
    { name: "Hordeolum (Stye)", score: 0, system: "HEENT", criteria: { vitals: [], ros: ['eyelid_swelling', 'eyelid_pain'], pe: ['eyelid_swelling_localized', 'eyelid_erythema'] } },
    { name: "Acute Sinusitis", score: 0, system: "HEENT", criteria: { vitals: ['fever'], ros: ['headache', 'facial_pain_pressure', 'nasal_congestion', 'cough'], pe: ['nasal_discharge_purulent', 'sinus_tenderness'] } },
    { name: "Vertigo (BPPV/Vestibular Neuritis)", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['vertigo', 'nausea', 'vomiting'], pe: ['nystagmus', 'positive_dix_hallpike'] } },
    { name: "Tension Headache", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['headache' /* Band-like */], pe: [] } },
    { name: "Cluster Headache", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['headache' /* Severe, unilateral, orbital */, 'eye_redness', 'nasal_congestion'], pe: ['conjunctival_injection'] } },
    { name: "Temporal Arteritis (GCA)", score: 0, system: "HEENT/Rheum/Vascular", criteria: { vitals: ['fever'], ros: ['headache' /* Temporal */, 'vision_change', 'jaw_claudication', 'fatigue'], pe: ['temporal_artery_tenderness'] } },
    { name: "Otitis Externa", score: 0, system: "HEENT", criteria: { vitals: [], ros: ['ear_pain', 'itching', 'ear_discharge'], pe: ['tragal_tenderness', 'external_canal_erythema_edema'] } },
    { name: "Allergic Rhinitis", score: 0, system: "HEENT/Allergy", criteria: { vitals: [], ros: ['nasal_congestion', 'eye_itching', 'sneezing'], pe: ['allergic_shiners', 'nasal_turbinate_pallor'] } },
    { name: "Epiglottitis", score: 0, system: "HEENT/Infectious", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea'], ros: ['sore_throat', 'dysphagia', 'drooling'], pe: ['stridor'] } },
    { name: "Peritonsillar Abscess", score: 0, system: "HEENT/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: ['sore_throat' /* Unilateral */, 'dysphagia', 'muffled_voice'], pe: ['uvular_deviation', 'trismus'] } },
    { name: "Acute Angle-Closure Glaucoma", score: 0, system: "HEENT/Ophthalmology", criteria: { vitals: [], ros: ['eye_pain' /* Severe */, 'vision_change' /* Blurred/halos */, 'headache', 'nausea', 'vomiting'], pe: ['conjunctival_injection', 'corneal_edema', 'mid_dilated_pupil'] } },
    { name: "Retinal Detachment", score: 0, system: "HEENT/Ophthalmology", criteria: { vitals: [], ros: ['vision_change' /* Floaters, flashes, curtain */], pe: ['visual_field_defect'] } },
    { name: "Labyrinthitis", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['vertigo', 'nausea', 'vomiting', 'hearing_loss'], pe: ['nystagmus'] } },
    { name: "Meniere's Disease", score: 0, system: "HEENT/Neuro", criteria: { vitals: [], ros: ['vertigo' /* Episodic */, 'hearing_loss' /* Fluctuating */, 'tinnitus', 'ear_fullness'], pe: ['nystagmus'] } }, // Need tinnitus/fullness ROS


    // Neurologic
    { name: "Stroke (Ischemic/Hemorrhagic)", score: 0, system: "Neurologic", criteria: { vitals: ['hypertension'], ros: ['headache', 'vision_change', 'confusion'], pe: ['altered_mental_status', 'focal_neuro_deficit', 'abnormal_gait', 'pupils_unequal'] } },
    { name: "Seizure", score: 0, system: "Neurologic", criteria: { vitals: ['tachycardia'], ros: ['seizure_activity', 'confusion'], pe: ['altered_mental_status', 'post_ictal_state'] } },
    { name: "Meningitis/Encephalitis", score: 0, system: "Neurologic/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: ['headache', 'confusion', 'neck_stiffness'], pe: ['altered_mental_status', 'nuchal_rigidity', 'kernigs_brudzinskis'] } },
    { name: "Subarachnoid Hemorrhage (SAH)", score: 0, system: "Neurologic/Vascular", criteria: { vitals: ['hypertension', 'tachycardia'], ros: ['headache' /* Thunderclap */, 'nausea', 'vomiting', 'confusion', 'neck_stiffness'], pe: ['altered_mental_status', 'focal_neuro_deficit', 'nuchal_rigidity'] } },
    { name: "Delirium", score: 0, system: "Neurologic/Systemic", criteria: { vitals: [], ros: ['confusion', 'sleep_disturbance'], pe: ['altered_mental_status'] /* Underlying cause varies */ } },
    { name: "Transient Ischemic Attack (TIA)", score: 0, system: "Neurologic/Vascular", criteria: { vitals: ['hypertension'], ros: ['vision_change', 'confusion' /* Transient neuro sx */], pe: ['focal_neuro_deficit' /* Transient/resolved */] } },
    { name: "Peripheral Neuropathy", score: 0, system: "Neurologic", criteria: { vitals: [], ros: ['numbness_tingling', 'burning_pain'], pe: ['decreased_sensation_stocking_glove'] } },
    { name: "Multiple Sclerosis (MS)", score: 0, system: "Neurologic/Autoimmune", criteria: { vitals: [], ros: ['fatigue', 'vision_change', 'numbness_tingling', 'muscle_weakness', 'gait_problems'], pe: ['focal_neuro_deficit', 'abnormal_gait'] } },
    { name: "Guillain-Barre Syndrome (GBS)", score: 0, system: "Neurologic/Autoimmune", criteria: { vitals: ['tachycardia', 'hypotension', 'hypertension'], ros: ['muscle_weakness' /* Ascending */, 'numbness_tingling'], pe: ['areflexia', 'focal_neuro_deficit' /* Symmetric weakness */] } },
    { name: "Myasthenia Gravis", score: 0, system: "Neurologic/Autoimmune", criteria: { vitals: [], ros: ['fatigue' /* Worse w/ activity */, 'muscle_weakness', 'ptosis', 'diplopia'], pe: ['ptosis', 'diplopia', 'fatigable_weakness'] } },
    { name: "Essential Tremor", score: 0, system: "Neurologic", criteria: { vitals: [], ros: ['tremor' /* Action/postural */], pe: ['tremor'] } },
    { name: "Parkinson's Disease", score: 0, system: "Neurologic", criteria: { vitals: [], ros: ['tremor' /* Rest */, 'stiffness', 'slowness'], pe: ['tremor' /* Pill-rolling */, 'rigidity', 'bradykinesia', 'abnormal_gait' /* Shuffling */] } },
    { name: "Bell's Palsy", score: 0, system: "Neurologic", criteria: { vitals: [], ros: ['facial_weakness_unilateral'], pe: ['facial_droop_unilateral_upper_lower'] } }, // Need specific ROS/PE
    { name: "Carpal Tunnel Syndrome", score: 0, system: "Neurologic/Musculoskeletal", criteria: { vitals: [], ros: ['numbness_tingling' /* Median nerve distribution */, 'hand_pain'], pe: ['positive_tinel_phalen'] } }, // Need specific ROS/PE


    // Constitutional / Other
    { name: "Sepsis", score: 0, system: "Systemic", criteria: { vitals: ['fever', 'tachycardia', 'tachypnea', 'hypotension', 'hypoxia'], ros: ['fatigue', 'chills', 'confusion'], pe: ['ill_appearing', 'altered_mental_status'] } },
    { name: "Anemia", score: 0, system: "Hematologic", criteria: { vitals: ['tachycardia'], ros: ['fatigue', 'sob', 'palpitations'], pe: [] /* Pallor */ } },
    { name: "Malignancy (General)", score: 0, system: "Oncology", criteria: { vitals: [], ros: ['fatigue', 'weight_loss'], pe: ['cachectic'] /* Highly variable */ } },
    { name: "Dehydration", score: 0, system: "Systemic", criteria: { vitals: ['tachycardia', 'hypotension'], ros: ['fatigue', 'polydipsia', 'decreased_urine_output'], pe: ['dry_mucous_membranes', 'poor_skin_turgor'] } },
    { name: "Electrolyte Imbalance (e.g., Hypo/Hyperkalemia)", score: 0, system: "Systemic/Renal", criteria: { vitals: ['tachycardia', 'bradycardia'], ros: ['fatigue', 'palpitations', 'muscle_cramps_weakness'], pe: [] } },
    { name: "Sleep Apnea", score: 0, system: "Respiratory/Neuro", criteria: { vitals: ['hypertension'], ros: ['fatigue', 'snoring', 'witnessed_apneas'], pe: [] } },
    { name: "Fibromyalgia", score: 0, system: "Musculoskeletal/Rheum", criteria: { vitals: [], ros: ['fatigue', 'widespread_pain', 'sleep_disturbance'], pe: ['multiple_tender_points'] } },
    { name: "Systemic Lupus Erythematosus (SLE)", score: 0, system: "Rheum/Systemic", criteria: { vitals: ['fever'], ros: ['fatigue', 'rash' /* Malar */, 'joint_pain', 'sob', 'chest_pain'], pe: ['malar_rash', 'oral_ulcers', 'arthritis'] } },
    { name: "Anaphylaxis", score: 0, system: "Allergy/Systemic", criteria: { vitals: ['tachycardia', 'hypotension', 'tachypnea', 'hypoxia'], ros: ['sob', 'wheezing', 'itching', 'rash'], pe: ['wheals', 'angioedema'] } },
    { name: "Infectious Mononucleosis (Mono)", score: 0, system: "Infectious/Systemic", criteria: { vitals: ['fever'], ros: ['fatigue', 'sore_throat', 'headache'], pe: ['pharyngeal_erythema', 'lymphadenopathy' /* Posterior cervical */, 'splenomegaly'] } },
    { name: "Lymphoma", score: 0, system: "Oncology/Hematologic", criteria: { vitals: ['fever'], ros: ['fatigue', 'weight_loss', 'night_sweats', 'itching'], pe: ['lymphadenopathy' /* Painless */] } },
    { name: "Vitamin B12 Deficiency", score: 0, system: "Hematologic/Neuro", criteria: { vitals: [], ros: ['fatigue', 'palpitations', 'numbness_tingling', 'confusion'], pe: ['pallor', 'decreased_sensation_stocking_glove'] } },
    { name: "Folate Deficiency", score: 0, system: "Hematologic", criteria: { vitals: [], ros: ['fatigue', 'palpitations'], pe: ['pallor'] } },
    { name: "Iron Deficiency Anemia", score: 0, system: "Hematologic", criteria: { vitals: ['tachycardia'], ros: ['fatigue', 'sob', 'palpitations', 'pica'], pe: ['pallor', 'koilonychia'] } }, // Need specific ROS/PE
    { name: "Vitamin D Deficiency", score: 0, system: "Endocrine/Systemic", criteria: { vitals: [], ros: ['fatigue', 'bone_pain', 'muscle_weakness'], pe: [] } },


    // Endocrine
    { name: "Hyperglycemia/DKA", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia', 'tachypnea', 'hypotension'], ros: ['polyuria', 'polydipsia', 'nausea', 'vomiting', 'abd_pain', 'fatigue', 'blurry_vision', 'confusion'], pe: ['ill_appearing', 'altered_mental_status'] } },
    { name: "Hypoglycemia", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia'], ros: ['sweating', 'tremor', 'confusion', 'palpitations', 'fatigue'], pe: ['altered_mental_status'] } },
    { name: "Hypothyroidism", score: 0, system: "Endocrine", criteria: { vitals: ['bradycardia'], ros: ['fatigue', 'weight_gain', 'constipation', 'cold_intolerance', 'sad_mood'], pe: [] /* Delayed reflexes, goiter */ } },
    { name: "Hyperthyroidism", score: 0, system: "Endocrine", criteria: { vitals: ['tachycardia', 'hypertension'], ros: ['weight_loss', 'heat_intolerance', 'diarrhea', 'palpitations', 'anxiety', 'tremor'], pe: ['tremor'] /* Goiter, exophthalmos */ } },
    { name: "Adrenal Insufficiency", score: 0, system: "Endocrine", criteria: { vitals: ['hypotension', 'tachycardia'], ros: ['fatigue', 'weight_loss', 'nausea', 'vomiting', 'abd_pain'], pe: ['hyperpigmentation'] } },
    { name: "Thyroiditis (Subacute/Hashimoto's)", score: 0, system: "Endocrine", criteria: { vitals: ['fever', 'tachycardia'], ros: ['fatigue', 'neck_pain', 'palpitations', 'heat_intolerance', 'cold_intolerance'], pe: ['goiter_tenderness'] } },
    { name: "SIADH", score: 0, system: "Endocrine/Systemic", criteria: { vitals: [], ros: ['nausea', 'fatigue', 'headache', 'confusion'], pe: ['altered_mental_status'] /* Needs hyponatremia */ } },
    { name: "Diabetes Insipidus", score: 0, system: "Endocrine/Renal", criteria: { vitals: ['hypotension'], ros: ['polyuria', 'polydipsia', 'fatigue'], pe: ['dry_mucous_membranes'] } },


    // Musculoskeletal
    { name: "Low Back Pain (Musculoskeletal)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['back_pain'], pe: ['tenderness' /* Lumbar */] } },
    { name: "Low Back Pain (Radicular/Herniated Disc)", score: 0, system: "Musculoskeletal/Neurologic", criteria: { vitals: [], ros: ['back_pain', 'radiculopathy'], pe: ['tenderness' /* Lumbar */, 'positive_slr', 'focal_neuro_deficit'] } }, // Refined
    { name: "Spinal Stenosis", score: 0, system: "Musculoskeletal/Neurologic", criteria: { vitals: [], ros: ['back_pain', 'leg_pain' /* Neurogenic claudication */, 'numbness_tingling'], pe: [] /* Often normal exam */ } },
    { name: "Knee Pain (Osteoarthritis)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['knee_pain', 'knee_stiffness'], pe: ['knee_crepitus', 'knee_tenderness_jointline'] } },
    { name: "Knee Pain (Meniscal Tear)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['knee_pain', 'knee_locking', 'knee_instability'], pe: ['knee_effusion', 'knee_tenderness_jointline', 'positive_mcmurray'] } },
    { name: "Knee Pain (Ligament Sprain - e.g., ACL)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['knee_pain', 'knee_instability', 'knee_swelling_acute'], pe: ['knee_effusion', 'positive_lachman', 'positive_anterior_drawer'] } },
    { name: "Gout Flare", score: 0, system: "Musculoskeletal/Rheum", criteria: { vitals: ['fever'], ros: ['joint_pain_acute', 'joint_swelling'], pe: ['joint_erythema', 'joint_warmth', 'joint_tenderness_severe'] } },
    { name: "Septic Arthritis", score: 0, system: "Musculoskeletal/Infectious", criteria: { vitals: ['fever'], ros: ['joint_pain_acute', 'joint_swelling'], pe: ['joint_erythema', 'joint_warmth', 'joint_tenderness_severe', 'pain_with_rom'] } },
    { name: "Osteomyelitis", score: 0, system: "Musculoskeletal/Infectious", criteria: { vitals: ['fever'], ros: ['bone_pain', 'fatigue'], pe: ['tenderness' /* Over bone */, 'skin_erythema', 'skin_warmth'] } },
    { name: "Costochondritis", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['chest_pain'], pe: ['costochondral_tenderness'] } },
    { name: "Shoulder Impingement/Rotator Cuff Tendinopathy", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['shoulder_pain'], pe: ['painful_arc', 'positive_impingement_signs', 'rotator_cuff_weakness'] } },
    { name: "Rheumatoid Arthritis (RA)", score: 0, system: "Rheum/Musculoskeletal", criteria: { vitals: [], ros: ['joint_pain', 'joint_swelling', 'stiffness' /* Morning */, 'fatigue'], pe: ['joint_tenderness_swelling' /* Symmetric, small joints */] } },
    { name: "Polymyalgia Rheumatica (PMR)", score: 0, system: "Rheum/Musculoskeletal", criteria: { vitals: [], ros: ['stiffness' /* Shoulder/hip girdle */, 'fatigue', 'weight_loss'], pe: ['pain_with_rom' /* Shoulders/hips */] } },
    { name: "Bursitis (e.g., Olecranon, Trochanteric)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['joint_pain', 'joint_swelling'], pe: ['point_tenderness_over_bursa', 'joint_effusion'] } },
    { name: "Tendinitis (e.g., Achilles, Patellar)", score: 0, system: "Musculoskeletal", criteria: { vitals: [], ros: ['joint_pain' /* Worse w/ activity */], pe: ['tenderness_over_tendon'] } },
    { name: "Pseudogout (CPPD)", score: 0, system: "Musculoskeletal/Rheum", criteria: { vitals: ['fever'], ros: ['joint_pain_acute', 'joint_swelling'], pe: ['joint_erythema', 'joint_warmth', 'joint_tenderness_severe'] } },
    { name: "Reactive Arthritis", score: 0, system: "Musculoskeletal/Rheum", criteria: { vitals: ['fever'], ros: ['joint_pain', 'eye_redness', 'dysuria'], pe: ['arthritis', 'conjunctival_injection'] } },
    { name: "Polymyositis/Dermatomyositis", score: 0, system: "Musculoskeletal/Rheum", criteria: { vitals: [], ros: ['muscle_weakness' /* Proximal */, 'fatigue', 'rash' /* Heliotrope, Gottron's */], pe: ['proximal_muscle_weakness', 'skin_rash_specific'] } },
    { name: "Septic Bursitis", score: 0, system: "Musculoskeletal/Infectious", criteria: { vitals: ['fever'], ros: ['joint_pain', 'joint_swelling'], pe: ['joint_erythema', 'joint_warmth', 'point_tenderness_over_bursa'] } },


    // Skin
    { name: "Cellulitis", score: 0, system: "Skin/Infectious", criteria: { vitals: ['fever', 'tachycardia'], ros: [], pe: ['skin_erythema', 'skin_warmth', 'skin_swelling', 'tenderness'] } },
    { name: "Urticaria (Hives)", score: 0, system: "Skin/Allergy", criteria: { vitals: [], ros: ['itching', 'rash'], pe: ['wheals'] } },
    { name: "Contact Dermatitis", score: 0, system: "Skin/Allergy", criteria: { vitals: [], ros: ['rash', 'itching'], pe: ['skin_erythema', 'vesicles_bullae'] } },
    { name: "Drug Reaction", score: 0, system: "Skin/Allergy", criteria: { vitals: ['fever'], ros: ['rash', 'itching'], pe: ['skin_erythema' /* Morbilliform */] } },
    { name: "Psoriasis", score: 0, system: "Skin/Rheum", criteria: { vitals: [], ros: ['rash', 'itching', 'joint_pain'], pe: ['plaques_silvery_scale'] } },
    { name: "Eczema (Atopic Dermatitis)", score: 0, system: "Skin/Allergy", criteria: { vitals: [], ros: ['rash', 'itching'], pe: ['skin_erythema', 'dry_skin_lichenification'] } },
    { name: "Herpes Zoster (Shingles)", score: 0, system: "Skin/Infectious/Neuro", criteria: { vitals: ['fever'], ros: ['rash', 'pain' /* Dermatomal */, 'itching'], pe: ['dermatomal_vesicular_rash'] } },
    { name: "Tinea (Fungal Infection)", score: 0, system: "Skin/Infectious", criteria: { vitals: [], ros: ['rash', 'itching'], pe: ['annular_lesion_scaling'] } },
    { name: "Abscess (Skin)", score: 0, system: "Skin/Infectious", criteria: { vitals: ['fever'], ros: ['skin_lesion_painful', 'skin_swelling'], pe: ['skin_erythema', 'skin_warmth', 'fluctuance', 'induration'] } },
    { name: "Scabies", score: 0, system: "Skin/Infectious", criteria: { vitals: [], ros: ['itching' /* Severe, worse at night */, 'rash'], pe: ['burrows', 'papules_vesicles' /* Web spaces, wrists */] } }, // Need specific PE
    { name: "Impetigo", score: 0, system: "Skin/Infectious", criteria: { vitals: [], ros: ['rash'], pe: ['honey_crusted_lesions'] } }, // Need specific PE


    // Psychiatric
    { name: "Depression/Anxiety", score: 0, system: "Psychiatric", criteria: { vitals: [], ros: ['fatigue', 'sad_mood', 'anxiety', 'sleep_disturbance', 'palpitations'], pe: [] } },
    { name: "Panic Attack", score: 0, system: "Psychiatric", criteria: { vitals: ['tachycardia', 'tachypnea'], ros: ['palpitations', 'sob', 'chest_pain', 'anxiety', 'tremor', 'sweating'], pe: [] } },
    { name: "Substance Use Disorder/Withdrawal", score: 0, system: "Psychiatric/Systemic", criteria: { vitals: ['tachycardia', 'hypertension', 'fever'], ros: ['anxiety', 'tremor', 'sweating', 'nausea', 'vomiting', 'sleep_disturbance'], pe: ['pupils_dilated_constricted'] } },
    { name: "Adjustment Disorder", score: 0, system: "Psychiatric", criteria: { vitals: [], ros: ['sad_mood', 'anxiety', 'sleep_disturbance' /* Related to stressor */], pe: [] } },
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
                planItems.add("PE Exam: Auscultate lungs. Plan: Usually clinical diagnosis. Symptomatic treatment. CXR if pneumonia suspected.");
                break;
             case "Upper Respiratory Infection (URI)":
                planItems.add("PE Exam: Inspect pharynx, check TMs. Plan: Clinical diagnosis. Symptomatic treatment.");
                break;
            case "COPD Exacerbation":
                planItems.add("PE Exam: Assess WOB, wheezing, accessory muscle use. Plan: CXR, ABG (if severe), Nebulizers (Duoneb), Steroids, Antibiotics (if indicated).");
                break;
            case "Pneumothorax":
                planItems.add("PE Exam: Check for unilateral decreased breath sounds, tracheal deviation (tension). Plan: STAT CXR. Chest tube if large/tension.");
                break;
            case "Pleural Effusion":
                planItems.add("PE Exam: Check for decreased breath sounds, dullness to percussion. Plan: CXR (lateral decubitus helpful), Thoracentesis (diagnostic/therapeutic), Treat underlying cause.");
                break;
            case "Interstitial Lung Disease (ILD)":
            case "Pulmonary Fibrosis": // Grouped with ILD for plan
                planItems.add("PE Exam: Listen for velcro crackles. Plan: CXR, HRCT, PFTs, Consider rheumatologic workup/biopsy. Pulmonology consult.");
                break;
            case "Lung Cancer":
                planItems.add("PE Exam: Assess respiratory status, cachexia, clubbing. Plan: CXR, CT Chest, PET scan, Sputum cytology, Bronchoscopy/Biopsy. Oncology consult.");
                break;
            case "Tuberculosis (Pulmonary)":
                planItems.add("PE Exam: Auscultate lungs. Plan: CXR, Sputum AFB smear/culture x3, IGRA. Isolate if suspected active. ID consult.");
                break;
            case "Sarcoidosis":
                planItems.add("PE Exam: Check lymphadenopathy, skin lesions, listen lungs. Plan: CXR (hilar adenopathy), PFTs, ACE level, Calcium. Consider biopsy. Pulm/Rheum consult.");
                break;
            case "Aspiration Pneumonia":
                planItems.add("PE Exam: Assess respiratory status, mental status. Plan: CXR, CBC, BMP, Blood cultures. Antibiotics (cover anaerobes). Swallow evaluation.");
                break;
            case "Lung Abscess":
                planItems.add("PE Exam: Auscultate lungs. Plan: CXR, CT Chest. Sputum/Blood cultures. Bronchoscopy if needed. Prolonged antibiotics. Consider drainage.");
                break;
            case "Pulmonary Embolism":
                planItems.add("PE Exam: Check for unilateral leg swelling. Plan: PERC/Wells score. Consider D-dimer, CTA Chest, V/Q Scan, LE Dopplers, EKG, Troponin, BNP.");
                break;
            case "Asthma Exacerbation":
                planItems.add("PE Exam: Auscultate for wheezing, assess work of breathing. Plan: Consider Peak Flow, Nebulizer treatment, Steroids, CXR.");
                break;
            case "Heart Failure Exacerbation":
            case "Cardiomyopathy": // Grouped with HF for plan
                planItems.add("PE Exam: Check JVD, listen for rales, check for pedal edema. Plan: Consider BNP, Troponin, CBC, BMP, EKG, CXR, Echo.");
                break;
            case "Acute Coronary Syndrome (ACS)":
            case "Angina (Stable/Unstable)": // Grouped with ACS for plan
                planItems.add("PE Exam: Often normal, assess for signs of shock/HF. Plan: STAT EKG, Troponin series, CBC, BMP, CXR. Consider MONA-BASH. Stress test if stable angina suspected.");
                break;
            case "Atrial Fibrillation":
                planItems.add("PE Exam: Check pulse for irregular rhythm. Plan: EKG, Troponin, BNP, CBC, BMP, TSH. Consider anticoagulation (CHADS2-VASc), Rate/Rhythm control.");
                break;
            case "Pericarditis":
                planItems.add("EKG, Troponin, Inflammatory markers (CRP/ESR), CXR, Echocardiogram.");
                break;
            case "Hypertensive Urgency/Emergency":
                planItems.add("PE Exam: Check BP both arms, fundoscopy, neuro exam. Plan: EKG, Troponin, BMP, UA, Head CT (if neuro sx). Gradual BP reduction (Urgency) or IV meds (Emergency).");
                break;
            case "Deep Vein Thrombosis (DVT)":
                planItems.add("PE Exam: Assess unilateral leg swelling, calf tenderness, warmth, erythema. Plan: Wells score. D-dimer (if low suspicion), LE Doppler US. Anticoagulation.");
                break;
            case "Aortic Dissection":
                planItems.add("PE Exam: Check BP both arms, assess pulses, listen for murmur. Plan: STAT CTA Chest/Abdomen/Pelvis or TEE. Control BP/HR (beta-blockers). Emergent surgical consult.");
                break;
            case "Endocarditis":
                planItems.add("PE Exam: Listen for new/changed murmur, check for skin stigmata (petechiae, Janeway, Osler). Plan: Blood cultures x3, CBC, BMP, ESR/CRP, EKG, Echocardiogram (TTE then TEE). ID consult. IV antibiotics.");
                break;
            case "Supraventricular Tachycardia (SVT)":
                planItems.add("PE Exam: Assess stability. Plan: EKG. Vagal maneuvers. Adenosine if stable. Cardioversion if unstable.");
                break;
            case "Heart Block (High Degree)":
                planItems.add("PE Exam: Assess stability. Plan: EKG, Troponin, BMP, TSH. Atropine/Pacing if unstable. Cardiology consult.");
                break;
            case "Peripheral Artery Disease (PAD)":
                planItems.add("PE Exam: Check pedal pulses, capillary refill, skin changes. Plan: ABI. Consider Doppler US, CTA/MRA. Risk factor modification, Exercise program, Antiplatelet, Cilostazol.");
                break;
            case "Vasculitis (General)":
                planItems.add("PE Exam: Detailed skin/neuro/MSK exam. Plan: CBC, BMP, UA, ESR/CRP, ANA, ANCA, Complements. Consider biopsy. Rheumatology consult.");
                break;
            case "Aortic Stenosis":
                planItems.add("PE Exam: Listen for systolic ejection murmur (RUSB, radiates to carotids), assess pulses. Plan: Echocardiogram. Cardiology consult.");
                break;
            case "Myocarditis":
                planItems.add("PE Exam: Listen for murmur, gallops, friction rub. Plan: EKG, Troponin, CK-MB, ESR/CRP, Viral studies. Echocardiogram, Cardiac MRI. Cardiology consult.");
                break;
            case "Syncope (Vasovagal/Orthostatic/Cardiac)":
                planItems.add("PE Exam: Orthostatic vitals, cardiac exam, neuro exam. Plan: EKG, CBC, BMP. Consider Echo, Holter, Tilt table based on history/suspicion. Address underlying cause.");
                break;
            case "Gastroenteritis":
                planItems.add("PE Exam: Assess hydration status, abdominal tenderness. Plan: Usually clinical diagnosis. Consider BMP (if dehydration), Stool studies (if severe/prolonged/bloody). Supportive care (hydration).");
                break;
            case "Appendicitis":
                planItems.add("PE Exam: Check for RLQ tenderness, rebound, guarding (McBurney's point). Plan: CBC, BMP. Consider CT A/P or US. Surgical consult.");
                break;
            case "Cholecystitis":
                planItems.add("PE Exam: Check for RUQ tenderness, Murphy's sign. Plan: CBC, BMP, LFTs. Ultrasound RUQ. Surgical consult.");
                break;
            case "Pancreatitis":
                 planItems.add("PE Exam: Check for epigastric tenderness. Plan: CBC, BMP, LFTs, Lipase. Consider CT A/P. NPO, IV fluids, pain control.");
                 break;
            case "Bowel Obstruction":
                 planItems.add("PE Exam: Assess for distension, tenderness, high-pitched/absent bowel sounds, check for hernias. Plan: CBC, BMP. Abdominal X-ray (supine/upright). Consider CT A/P. NPO, NG tube, IV fluids. Surgical consult.");
                 break;
            case "GERD":
                planItems.add("PE Exam: Usually normal. Plan: Clinical diagnosis. Trial of PPI/H2 blocker. Consider EGD if red flags or refractory.");
                break;
            case "Peptic Ulcer Disease (PUD)":
                planItems.add("PE Exam: Check for epigastric tenderness. Plan: CBC (anemia), Stool guaiac. Consider EGD. PPI, H. pylori testing/treatment.");
                break;
            case "Diverticulitis":
                planItems.add("PE Exam: Check for LLQ tenderness. Plan: CBC, BMP. CT A/P. Antibiotics (outpatient vs inpatient), Bowel rest/clear liquids initially.");
                break;
            case "Inflammatory Bowel Disease (IBD - Crohn's/UC)":
                planItems.add("PE Exam: Assess abdominal tenderness, check perianal area. Plan: CBC, BMP, ESR/CRP, Stool studies (incl C diff, calprotectin). Colonoscopy. GI consult.");
                break;
            case "Irritable Bowel Syndrome (IBS)":
                planItems.add("PE Exam: Usually normal or mild tenderness. Plan: Clinical diagnosis (Rome criteria). Rule out red flags. Symptomatic treatment (fiber, antispasmodics, etc.).");
                break;
            case "Mesenteric Ischemia":
                planItems.add("PE Exam: Assess for pain out of proportion, peritonitis (late). Plan: STAT Lactate, ABG, CBC, BMP. CTA Abdomen/Pelvis. Emergent surgical consult.");
                break;
            case "Abdominal Aortic Aneurysm (AAA) Leak/Rupture":
                planItems.add("PE Exam: Assess for pulsatile mass, hypotension, tenderness. Plan: STAT Bedside Ultrasound, CTA A/P if stable enough. Emergent vascular surgery consult.");
                break;
            case "Esophageal Spasm":
                planItems.add("PE Exam: Usually normal. Plan: Trial of nitrates/calcium channel blockers. Consider EGD, Barium swallow, Manometry.");
                break;
            case "Hepatitis (Acute/Chronic)":
                planItems.add("PE Exam: Check for jaundice, RUQ tenderness, hepatomegaly. Plan: LFTs, Hepatitis panel, CBC, BMP. Consider Ultrasound. Treat underlying cause/refer to GI/ID.");
                break;
            case "Cirrhosis":
                planItems.add("PE Exam: Check for jaundice, ascites, spider angiomata, palmar erythema, caput medusae. Plan: LFTs, CBC, Coags, Albumin, Hep panel. Ultrasound, Fibroscan/Biopsy. GI consult.");
                break;
            case "C. difficile Colitis":
                planItems.add("PE Exam: Assess hydration, abdominal tenderness. Plan: Stool C. diff toxin test. CBC, BMP. Oral Vancomycin or Fidaxomicin. Avoid anti-motility agents.");
                break;
            case "Ischemic Colitis":
                planItems.add("PE Exam: Assess abdominal tenderness, check perfusion. Plan: CBC, BMP, Lactate. CT A/P. Supportive care (fluids, bowel rest). Consider colonoscopy. Vascular/Surgical consult if severe.");
                break;
            case "Gastroparesis":
                planItems.add("PE Exam: Usually normal. Plan: Rule out obstruction (EGD/imaging). Gastric emptying study. Metoclopramide/Erythromycin. Dietary changes. Check HbA1c.");
                break;
            case "Acute Gastric Ulcer Perforation":
                planItems.add("PE Exam: Assess for rigid abdomen, rebound, guarding. Plan: STAT Upright CXR (free air), CBC, BMP, Lipase. Emergent surgical consult. NPO, IV fluids, IV PPI, Broad-spectrum antibiotics.");
                break;
            case "Choledocholithiasis/Cholangitis":
                planItems.add("PE Exam: Check for RUQ tenderness, jaundice, fever, AMS. Plan: CBC, BMP, LFTs, Lipase, Blood cultures. RUQ Ultrasound. Consider MRCP/ERCP. IV antibiotics (if cholangitis). GI/Surgical consult.");
                break;
            case "GI Bleed (Upper - e.g., ulcer, varices)":
                planItems.add("PE Exam: Assess vitals, pallor, perform DRE. Plan: CBC, BMP, Coags, Type & Screen. IV fluids, IV PPI. EGD. GI consult.");
                break;
            case "GI Bleed (Lower - e.g., diverticular, AVM)":
                planItems.add("PE Exam: Assess vitals, pallor, perform DRE. Plan: CBC, BMP, Coags, Type & Screen. IV fluids. Colonoscopy. GI/Surgical consult.");
                break;
            case "Celiac Disease":
                planItems.add("PE Exam: Assess nutritional status. Plan: IgA TTG antibody test, Total IgA. Consider EGD with duodenal biopsy. Gluten-free diet. GI consult.");
                break;
            case "Gastritis":
                planItems.add("PE Exam: Check for epigastric tenderness. Plan: Clinical diagnosis often. Consider EGD if severe/persistent/red flags. PPI/H2 blocker, Avoid irritants.");
                break;
            case "Constipation (as primary Dx)":
                planItems.add("PE Exam: Assess abdomen for distension/tenderness, DRE. Plan: Rule out obstruction/red flags. Increase fiber/fluids, Laxatives (osmotic, stimulant).");
                break;
            case "Urinary Tract Infection (UTI)/Pyelonephritis":
                planItems.add("PE Exam: Check suprapubic tenderness (cystitis) or CVA tenderness (pyelo). Plan: UA, Urine culture. Consider CBC, BMP, Blood cultures (if pyelo/sepsis). Antibiotics.");
                break;
            case "Pelvic Inflammatory Disease (PID)":
                planItems.add("PE Exam: Pelvic exam (check CMT, adnexal tenderness, discharge). Plan: Urine hCG, GC/Chlamydia testing, Wet prep. Empiric antibiotics. OB/GYN consult.");
                break;
            case "Prostatitis":
                planItems.add("PE Exam: Gentle DRE (check for tenderness/bogginess). Plan: UA, Urine culture. Consider PSA. Antibiotics (prolonged course). Urology consult if refractory.");
                break;
            case "Testicular Torsion":
                planItems.add("PE Exam: Assess affected testicle (high-riding, horizontal lie), check cremasteric reflex (absent). Plan: STAT Scrotal Ultrasound w/ Doppler. Emergent Urology consult for surgical detorsion.");
                break;
            case "Ovarian Torsion":
                planItems.add("PE Exam: Assess lower abdominal/adnexal tenderness. Plan: STAT Pelvic Ultrasound w/ Doppler. Emergent OB/GYN consult for surgical detorsion.");
                break;
            case "Glomerulonephritis":
                planItems.add("PE Exam: Assess BP, edema. Plan: UA (check RBC casts, protein), BMP, Complement levels, ANA, ANCA, Hep panel. Consider Renal biopsy. Nephrology consult.");
                break;
            case "Nephrotic Syndrome":
                planItems.add("PE Exam: Assess generalized edema. Plan: UA (protein), Urine protein/Cr ratio, BMP, Albumin, Lipids. Consider Renal biopsy. Nephrology consult.");
                break;
            case "Acute Kidney Injury (AKI)":
                planItems.add("PE Exam: Assess volume status, check for edema. Plan: BMP (monitor Cr), UA, Renal Ultrasound (rule out obstruction). Identify/Treat underlying cause (pre-renal, intrinsic, post-renal).");
                break;
            case "Benign Prostatic Hyperplasia (BPH)":
                planItems.add("PE Exam: DRE (assess size/consistency). Plan: UA (rule out UTI), PSA. Consider Post-void residual (PVR). Alpha-blockers (Tamsulosin), 5-alpha-reductase inhibitors (Finasteride). Urology consult.");
                break;
            case "Chronic Kidney Disease (CKD)":
                planItems.add("PE Exam: Assess volume status, BP. Plan: BMP (monitor Cr/GFR), UA (proteinuria), Renal Ultrasound. Manage BP, diabetes, underlying causes. Nephrology consult.");
                break;
            case "Epididymitis/Orchitis":
                planItems.add("PE Exam: Assess testicular swelling/tenderness, Prehn's sign. Plan: UA, Urine culture, GC/Chlamydia testing. Scrotal Ultrasound w/ Doppler. Antibiotics.");
                break;
            case "Ectopic Pregnancy":
                planItems.add("PE Exam: Assess abdominal/pelvic tenderness, CMT. Plan: STAT Urine/Serum hCG, Transvaginal Ultrasound. CBC, BMP. OB/GYN consult. Consider Methotrexate vs Surgery.");
                break;
            case "Kidney Stone":
                planItems.add("PE Exam: Check for CVA tenderness. Plan: UA, BMP. Consider CT A/P (non-contrast) or Renal US. Pain control, Hydration, Strain urine.");
                break;
            case "Otitis Media":
                planItems.add("PE Exam: Otoscopy (check TM mobility/bulging). Plan: Clinical diagnosis. Consider antibiotics.");
                break;
            case "Strep Pharyngitis":
                planItems.add("PE Exam: Inspect pharynx (erythema, exudates), palpate anterior cervical nodes. Plan: Centor score. Consider Rapid Strep / Throat Culture. Antibiotics if positive/high suspicion.");
                break;
            case "Acute Sinusitis":
                planItems.add("PE Exam: Palpate sinuses for tenderness, check nasal passages. Plan: Usually clinical diagnosis. Symptomatic care. Consider antibiotics if persistent/severe/bacterial suspected.");
                break;
            case "Vertigo (BPPV/Vestibular Neuritis)":
                planItems.add("PE Exam: Dix-Hallpike (BPPV), HINTS exam (if acute/persistent), check gait. Plan: Epley maneuver (BPPV). Meclizine/Benzodiazepine short term. Vestibular rehab. MRI if central cause suspected.");
                break;
            case "Tension Headache":
                planItems.add("PE Exam: Palpate pericranial muscles. Neuro exam normal. Plan: Clinical diagnosis. NSAIDs/Acetaminophen. Stress reduction.");
                break;
            case "Cluster Headache":
                planItems.add("PE Exam: Check for unilateral autonomic features (ptosis, miosis, lacrimation, rhinorrhea). Plan: High-flow oxygen. Sumatriptan SC. Prophylaxis (e.g., Verapamil). Neuro consult.");
                break;
            case "Temporal Arteritis (GCA)":
                planItems.add("PE Exam: Palpate temporal arteries, check vision. Plan: STAT ESR/CRP. High-dose steroids immediately if suspected. Temporal artery biopsy. Rheumatology consult.");
                break;
            case "Otitis Externa":
                planItems.add("PE Exam: Check for tragal tenderness, inspect external canal. Plan: Clinical diagnosis. Topical antibiotic/steroid drops. Keep ear dry.");
                break;
            case "Epiglottitis":
                planItems.add("PE Exam: Assess stridor, tripod position, drooling (AVOID tongue depressor). Plan: Lateral neck X-ray ('thumb sign'). Secure airway STAT. IV antibiotics, Steroids. ENT/Anesthesia consult STAT.");
                break;
            case "Peritonsillar Abscess":
                planItems.add("PE Exam: Assess uvular deviation, trismus, muffled voice. Plan: CT Neck w/ contrast or Intraoral US. Needle aspiration or I&D. IV antibiotics. ENT consult.");
                break;
            case "Labyrinthitis":
                planItems.add("PE Exam: HINTS exam, check hearing. Plan: Clinical diagnosis often. Consider MRI if central cause suspected. Meclizine/Benzodiazepines short term. Steroids maybe. Vestibular rehab.");
                break;
            case "Meniere's Disease":
                planItems.add("PE Exam: Audiometry, assess nystagmus during attack. Plan: Clinical diagnosis. Low salt diet, Diuretics. Betahistine. ENT consult.");
                break;
            case "Acute Angle-Closure Glaucoma":
                planItems.add("PE Exam: Check IOP, pupil reactivity, corneal clarity. Plan: STAT Ophthalmology consult. Topical beta-blockers, alpha-agonists, pilocarpine, carbonic anhydrase inhibitors. Possible laser iridotomy.");
                break;
            case "Retinal Detachment":
                planItems.add("PE Exam: Assess visual fields, perform fundoscopy (may see detachment). Plan: STAT Ophthalmology consult. Keep patient NPO. Surgical repair likely needed.");
                break;
            case "Allergic Rhinitis":
                planItems.add("PE Exam: Check for allergic shiners, nasal turbinate pallor/bogginess. Plan: Clinical diagnosis. Intranasal steroids, Antihistamines. Allergen avoidance.");
                break;
            case "Conjunctivitis (Viral/Bacterial/Allergic)":
                planItems.add("PE Exam: Inspect conjunctiva, check discharge type, visual acuity. Plan: Usually clinical diagnosis. Cultures if severe/atypical. Symptomatic care (viral/allergic), Antibiotic drops (bacterial).");
                break;
            case "Hordeolum (Stye)":
                planItems.add("PE Exam: Inspect eyelid for localized swelling/pustule. Plan: Clinical diagnosis. Warm compresses. Consider topical antibiotics if draining/cellulitis.");
                break;
            case "Migraine Headache":
                planItems.add("PE Exam: Full Neurologic exam (CN, motor, sensory, cerebellar, gait) to rule out red flags. Plan: Clinical diagnosis. Abortive/prophylactic meds. Neuroimaging if red flags.");
                break;
            case "Stroke (Ischemic/Hemorrhagic)":
                planItems.add("PE Exam: STAT NIH Stroke Scale, full neuro exam. Plan: STAT Head CT (non-contrast), Fingerstick glucose, EKG, CBC, BMP, Coags, Troponin. Consider CTA Head/Neck, MRI/MRA. Neurology consult. Thrombolysis/Thrombectomy eval if ischemic.");
                break;
            case "Seizure":
                planItems.add("PE Exam: Assess post-ictal state, neuro deficits, trauma signs. Plan: Protect airway. Fingerstick glucose, CBC, BMP, Ca, Mg, Tox screen, EKG. Consider Head CT/MRI, EEG. Neuro consult. Antiepileptics if indicated.");
                break;
            case "Meningitis/Encephalitis":
                planItems.add("PE Exam: Check nuchal rigidity, Kernig's, Brudzinski's, mental status. Plan: STAT Lumbar Puncture (after Head CT if focal deficit/papilledema). Blood cultures. Empiric IV antibiotics +/- antivirals. ID/Neuro consult.");
                break;
            case "Subarachnoid Hemorrhage (SAH)":
                planItems.add("PE Exam: Assess mental status, neuro deficits, nuchal rigidity. Plan: STAT Head CT (non-contrast). If CT neg but high suspicion, Lumbar Puncture (check xanthochromia). Neurosurgery consult. BP control.");
                break;
            case "Delirium":
                planItems.add("PE Exam: Assess orientation, attention (CAM assessment). Plan: Identify and treat underlying cause (infection, meds, metabolic, etc.). Supportive care, reorientation, avoid restraints.");
                break;
            case "Transient Ischemic Attack (TIA)":
                planItems.add("PE Exam: Full neuro exam (may be normal now). Plan: ABCD2 score. Head CT/MRI, Carotid US/CTA/MRA, EKG, Echo. Antiplatelet therapy. Risk factor modification. Neurology consult.");
                break;
            case "Peripheral Neuropathy":
                planItems.add("PE Exam: Check sensation (monofilament), reflexes, strength. Plan: Fingerstick glucose, HbA1c, B12, TSH. Consider EMG/NCS. Treat underlying cause. Gabapentin/Pregabalin for symptoms.");
                break;
            case "Multiple Sclerosis (MS)":
                planItems.add("PE Exam: Detailed neuro exam. Plan: MRI Brain/Spine w/ contrast. Consider LP (oligoclonal bands). Neurology consult. Disease-modifying therapy.");
                break;
            case "Guillain-Barre Syndrome (GBS)":
                planItems.add("PE Exam: Assess ascending weakness, areflexia, respiratory status. Plan: Monitor respiratory function (NIF/VC). LP (cytoalbuminologic dissociation). EMG/NCS. IVIG or Plasmapheresis. Neurology consult.");
                break;
            case "Myasthenia Gravis":
                planItems.add("PE Exam: Assess fatigable weakness (sustained gaze), ptosis, diplopia. Plan: Ice pack test. AChR-Ab, MuSK-Ab. EMG/NCS (repetitive stim). Chest CT/MRI (thymoma). Neuro consult. Pyridostigmine.");
                break;
            case "Bell's Palsy":
                planItems.add("PE Exam: Assess unilateral facial droop (upper & lower face). Plan: Clinical diagnosis. Rule out stroke/other causes. Prednisone +/- Valacyclovir. Eye care.");
                break;
            case "Carpal Tunnel Syndrome":
                planItems.add("PE Exam: Tinel's, Phalen's tests. Assess sensation/strength in median distribution. Plan: Clinical diagnosis often. Consider EMG/NCS. Wrist splinting, NSAIDs, Steroid injection, Surgery if severe/refractory.");
                break;
            case "Essential Tremor":
                planItems.add("PE Exam: Assess tremor characteristics (action/postural). Neuro exam otherwise normal. Plan: Clinical diagnosis. Rule out other causes (thyroid). Propranolol/Primidone if treatment needed.");
                break;
            case "Parkinson's Disease":
                planItems.add("PE Exam: Assess for TRAP (Tremor, Rigidity, Akinesia/Bradykinesia, Postural instability). Plan: Clinical diagnosis. Consider trial of Levodopa. Neurology consult.");
                break;
            case "Sepsis":
                planItems.add("PE Exam: Assess mental status, perfusion, source. Plan: STAT Lactate, Blood cultures x2, CBC, CMP, UA, CXR. Source control. Broad-spectrum IV antibiotics, IV fluids. Monitor closely.");
                break;
            case "Anemia":
                planItems.add("PE Exam: Check for pallor, jaundice, tachycardia. Plan: CBC, Iron studies, B12, Folate, Retic count. Consider further workup based on type (LDH, Haptoglobin, Bilirubin if hemolysis; GI eval if iron deficiency).");
                break;
            case "Malignancy (General)":
                planItems.add("PE Exam: Focused exam based on symptoms (e.g., lymph nodes, breast, rectal). Plan: Basic labs (CBC, CMP, LDH). Age-appropriate cancer screening. Imaging/Biopsy based on suspicion.");
                break;
            case "Dehydration":
                planItems.add("PE Exam: Check mucous membranes, skin turgor, orthostatic vitals. Plan: BMP (check BUN/Cr). Oral vs IV fluids based on severity.");
                break;
            case "Electrolyte Imbalance (e.g., Hypo/Hyperkalemia)":
                planItems.add("PE Exam: Assess volume status, neuro/cardiac exam. Plan: BMP, Magnesium, EKG. Replete/correct electrolytes cautiously.");
                break;
            case "Sleep Apnea":
                planItems.add("PE Exam: Assess BMI, neck circumference, oropharynx. Plan: Epworth Sleepiness Scale. Sleep study (Polysomnography). CPAP if indicated. Weight loss.");
                break;
            case "Fibromyalgia":
                planItems.add("PE Exam: Check for widespread tenderness. Plan: Clinical diagnosis (ACR criteria). Rule out other causes (TSH, CBC, ESR/CRP). Education, Exercise, TCAs/SNRIs/Gabapentinoids.");
                break;
            case "Systemic Lupus Erythematosus (SLE)":
                planItems.add("PE Exam: Check for malar rash, oral ulcers, arthritis, listen heart/lungs. Plan: CBC, BMP, UA, ESR/CRP, ANA, dsDNA, Complements. Rheumatology consult.");
                break;
            case "Infectious Mononucleosis (Mono)":
                planItems.add("PE Exam: Check pharyngitis, posterior cervical lymphadenopathy, splenomegaly. Plan: Monospot test, EBV serologies. CBC (lymphocytosis). Supportive care, avoid contact sports.");
                break;
            case "Lymphoma":
                planItems.add("PE Exam: Check painless lymphadenopathy, hepatosplenomegaly. Plan: CBC, CMP, LDH. CXR, CT C/A/P. Lymph node biopsy. Heme/Onc consult.");
                break;
            case "Vitamin B12 Deficiency":
                planItems.add("PE Exam: Check pallor, neuro exam (sensation, reflexes). Plan: CBC (check MCV), Serum B12 level, Methylmalonic acid, Homocysteine. B12 supplementation.");
                break;
            case "Folate Deficiency":
                planItems.add("PE Exam: Check pallor. Plan: CBC (check MCV), Serum folate level. Folate supplementation.");
                break;
            case "Iron Deficiency Anemia":
                planItems.add("PE Exam: Check pallor, koilonychia. Plan: CBC (check MCV), Iron studies (Ferritin, Iron, TIBC). Identify/Treat source of loss. Iron supplementation.");
                break;
            case "Vitamin D Deficiency":
                planItems.add("PE Exam: Usually normal. Plan: Serum 25-hydroxyvitamin D level. Vitamin D supplementation.");
                break;
            case "Anaphylaxis":
                planItems.add("PE Exam: Assess airway (stridor/angioedema), breathing (wheezing), circulation (hypotension), skin (urticaria). Plan: Epinephrine IM STAT. Oxygen, IV fluids, Antihistamines, Steroids. Monitor closely.");
                break;
            case "Hyperglycemia/DKA":
                planItems.add("PE Exam: Assess hydration, mental status, Kussmaul breathing. Plan: Fingerstick glucose, BMP (gap), ABG/VBG, UA (ketones), Serum ketones, CBC. IV fluids, Insulin drip, Electrolyte repletion.");
                break;
            case "Adrenal Insufficiency":
                planItems.add("PE Exam: Check orthostatics, hyperpigmentation. Plan: BMP (check Na/K), AM Cortisol, ACTH stim test. Stress dose steroids if acute crisis. Endocrinology consult.");
                break;
            case "Thyroiditis (Subacute/Hashimoto's)":
                planItems.add("PE Exam: Palpate thyroid for tenderness/goiter. Plan: TSH, Free T4, ESR/CRP, Thyroid antibodies. Thyroid US. Treat based on phase (hyper/hypo).");
                break;
            case "SIADH":
                planItems.add("PE Exam: Assess volume status (euvolemic), mental status. Plan: BMP (check Na), Serum/Urine osmolality, Urine Na. Fluid restriction. Treat underlying cause.");
                break;
            case "Diabetes Insipidus":
                planItems.add("PE Exam: Assess volume status (dehydrated). Plan: BMP (check Na), Serum/Urine osmolality. Water deprivation test. Desmopressin (DDAVP) for central DI.");
                break;
            case "Hypoglycemia":
                planItems.add("Fingerstick glucose. Give glucose (oral if awake, IV D50 if altered). Investigate cause.");
                break;
            case "Hypothyroidism":
            case "Hyperthyroidism":
                planItems.add("TSH, Free T4. Consider thyroid antibodies. Treatment based on results.");
                break;
            case "Low Back Pain (Musculoskeletal)":
                planItems.add("PE Exam: Palpate paraspinal muscles, assess ROM. Plan: Clinical diagnosis. Conservative management (NSAIDs, PT). Imaging generally not needed unless red flags.");
                break;
            case "Low Back Pain (Radicular/Herniated Disc)":
                planItems.add("PE Exam: SLR, neuro exam (strength, sensation, reflexes). Plan: Clinical diagnosis. Conservative management initially. Consider MRI if red flags or failure.");
                break;
            case "Spinal Stenosis":
                planItems.add("PE Exam: Neuro exam (may be normal). Assess gait. Plan: Clinical diagnosis often (neurogenic claudication). MRI Lumbar spine. Conservative management, Epidural steroids, Consider surgery.");
                break;
            case "Knee Pain (Osteoarthritis)":
                planItems.add("PE Exam: Assess ROM, crepitus, joint line tenderness, stability. Plan: Weight-bearing X-rays. Conservative (NSAIDs, PT, injections).");
                break;
            case "Knee Pain (Meniscal Tear)":
                planItems.add("PE Exam: McMurray's test, Thessaly test, joint line tenderness, effusion. Plan: Conservative trial vs MRI. PT, possible surgery.");
                break;
            case "Knee Pain (Ligament Sprain - e.g., ACL)":
                planItems.add("PE Exam: Lachman's test, Anterior Drawer test, Pivot Shift test, assess effusion/stability. Plan: MRI. PT, bracing, possible surgery.");
                break;
            case "Gout Flare":
                planItems.add("PE Exam: Inspect joint for erythema, swelling, warmth, tenderness. Plan: Clinical diagnosis often sufficient. Consider Arthrocentesis (crystals) if uncertain. NSAIDs, Colchicine, Steroids for flare. Allopurinol/Febuxostat for prevention (not during flare).");
                break;
            case "Septic Arthritis":
                planItems.add("PE Exam: Assess joint effusion, warmth, erythema, severe pain with ROM. Plan: STAT Arthrocentesis (cell count, gram stain, culture). CBC, ESR/CRP, Blood cultures. Empiric IV antibiotics. Ortho consult.");
                break;
            case "Osteomyelitis":
                planItems.add("PE Exam: Assess for localized bone tenderness, overlying skin changes. Plan: CBC, ESR/CRP, Blood cultures. X-ray (may be normal early), MRI is better. Bone biopsy often needed. ID consult. Long-term antibiotics +/- surgery.");
                break;
            case "Costochondritis":
                planItems.add("PE Exam: Palpate costochondral junctions for tenderness. Plan: Clinical diagnosis. Rule out cardiac/pulmonary causes. Reassurance, NSAIDs.");
                break;
            case "Shoulder Impingement/Rotator Cuff Tendinopathy":
                planItems.add("PE Exam: Assess ROM, impingement tests (Neer, Hawkins), strength (empty can, lift-off). Plan: Clinical diagnosis often. Consider X-ray/US/MRI if refractory/tear suspected. PT, NSAIDs, Injections.");
                break;
            case "Bursitis (e.g., Olecranon, Trochanteric)":
                planItems.add("PE Exam: Palpate for point tenderness over bursa, assess effusion. Plan: Clinical diagnosis. RICE, NSAIDs. Consider aspiration/injection.");
                break;
            case "Tendinitis (e.g., Achilles, Patellar)":
                planItems.add("PE Exam: Palpate for tenderness over tendon. Plan: Clinical diagnosis. RICE, NSAIDs, Stretching/PT.");
                break;
            case "Pseudogout (CPPD)":
                planItems.add("PE Exam: Inspect joint (similar to gout). Plan: Arthrocentesis (check for rhomboid-shaped, positively birefringent crystals). NSAIDs, Colchicine, Steroids.");
                break;
            case "Reactive Arthritis":
                planItems.add("PE Exam: Assess joints, eyes, GU symptoms. Plan: Clinical diagnosis. Treat underlying infection if identified (e.g., Chlamydia). NSAIDs. Rheumatology consult.");
                break;
            case "Polymyositis/Dermatomyositis":
                planItems.add("PE Exam: Assess proximal muscle strength, look for heliotrope rash/Gottron's papules. Plan: CK level, Aldolase, EMG/NCS, Muscle biopsy, Autoantibodies (e.g., anti-Jo-1). Steroids. Rheumatology consult.");
                break;
            case "Septic Bursitis":
                planItems.add("PE Exam: Assess joint/bursa for erythema, warmth, tenderness, possible fluctuance. Plan: Aspiration of bursa (cell count, gram stain, culture). Antibiotics. Consider I&D.");
                break;
            case "Rheumatoid Arthritis (RA)":
                planItems.add("PE Exam: Assess joint swelling/tenderness (esp small joints), check deformities. Plan: CBC, ESR/CRP, RF, Anti-CCP antibodies. X-rays. Rheumatology consult. DMARDs.");
                break;
            case "Polymyalgia Rheumatica (PMR)":
                planItems.add("PE Exam: Assess shoulder/hip ROM and pain. Check for temporal artery tenderness (rule out GCA). Plan: ESR/CRP (usually elevated). Low-dose steroids (dramatic response typical). Rheumatology consult.");
                break;
            case "Cellulitis":
                planItems.add("PE Exam: Assess extent, warmth, tenderness, lymphangitis. Mark borders. Plan: Clinical diagnosis. Consider CBC, Blood cultures if systemic signs. Antibiotics.");
                break;
            case "Herpes Zoster (Shingles)":
                planItems.add("PE Exam: Look for dermatomal vesicular rash. Plan: Clinical diagnosis. Antivirals (e.g., Valacyclovir) within 72h if possible. Pain control. Consider Gabapentin for postherpetic neuralgia prevention.");
                break;
            case "Tinea (Fungal Infection)":
                planItems.add("PE Exam: Inspect characteristic rash (annular, scaling). Plan: Clinical diagnosis often. KOH prep if uncertain. Topical antifungals.");
                break;
            case "Abscess (Skin)":
                planItems.add("PE Exam: Assess fluctuance, induration, surrounding cellulitis. Plan: Incision & Drainage (I&D). Consider wound culture. Antibiotics often needed (cover MRSA).");
                break;
            case "Scabies":
                planItems.add("PE Exam: Look for burrows, papules, vesicles (web spaces, wrists). Plan: Clinical diagnosis often. Skin scraping for mites if uncertain. Permethrin cream. Treat contacts.");
                break;
            case "Impetigo":
                planItems.add("PE Exam: Look for honey-crusted lesions. Plan: Clinical diagnosis. Topical Mupirocin or oral antibiotics (e.g., Cephalexin).");
                break;
            case "Contact Dermatitis":
                planItems.add("PE Exam: Assess distribution/pattern of rash, vesicles. Plan: Identify/avoid irritant/allergen. Topical steroids. Antihistamines for itching.");
                break;
            case "Drug Reaction":
                planItems.add("PE Exam: Assess type/distribution of rash (morbilliform common). Plan: Stop offending drug. Antihistamines. Consider steroids if severe.");
                break;
            case "Psoriasis":
                planItems.add("PE Exam: Look for silvery plaques on extensor surfaces, scalp, nails. Plan: Clinical diagnosis. Topical steroids, Vitamin D analogs, Phototherapy, Systemics for severe disease. Dermatology consult.");
                break;
            case "Eczema (Atopic Dermatitis)":
                planItems.add("PE Exam: Look for erythematous, dry, itchy patches, often in flexural areas. Plan: Emollients, Topical steroids, Avoid triggers. Antihistamines. Dermatology consult if severe.");
                break;
            case "Urticaria (Hives)":
                planItems.add("PE Exam: Inspect skin for characteristic wheals. Plan: Clinical diagnosis. Antihistamines. Identify/avoid triggers. Consider epinephrine/steroids if severe/anaphylaxis.");
                break;
            case "Depression/Anxiety":
                planItems.add("PE Exam: Assess mood, affect, screen with PHQ-9/GAD-7. Plan: Rule out organic causes (TSH, CBC, BMP). Consider therapy, SSRIs/SNRIs.");
                break;
            case "Panic Attack":
                planItems.add("PE Exam: Usually normal between attacks. Plan: Rule out dangerous causes (PE, ACS, etc.). Reassurance. Consider SSRIs, Benzodiazepines short-term, CBT.");
                break;
            case "Substance Use Disorder/Withdrawal":
                planItems.add("PE Exam: Assess vitals, pupils, mental status, track marks. Plan: Clinical diagnosis. Urine tox screen. Symptomatic management (e.g., CIWA for alcohol, COWS for opioids). Refer for treatment.");
                break;
            case "Adjustment Disorder":
                planItems.add("PE Exam: Assess mood/anxiety in context of stressor. Plan: Clinical diagnosis. Supportive counseling, Stress management. Consider short-term meds if severe.");
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
    const sex = document.querySelector('input[name="sex"]:checked')?.value; // Changed from gender
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
        if (dx.name === "Testicular Torsion" && selectedPe.includes('absent_cremasteric_reflex')) currentScore += 2; // High importance
        if (dx.name === "Acute Angle-Closure Glaucoma" && selectedPe.includes('mid_dilated_pupil')) currentScore += 2; // High importance
        if (dx.name === "Epiglottitis" && selectedPe.includes('stridor')) currentScore += 2; // High importance


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
