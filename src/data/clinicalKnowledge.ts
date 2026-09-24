// Clinical Knowledge & Anatomy Mapping ported and enhanced from medical_logic.py, medical_data.py, and final_system.py

export interface AnatomyArea {
  id: string;
  name: string;
  category: string;
  conditions: string[];
  simpleAilments: string[];
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW/MEDIUM';
  datasetFile: string;
  stats: {
    datasetCases: number;
    avgAge: number;
    commonMedications: string[];
    emergencyRatePercent: number;
  };
}

export const ANATOMY_MAP: Record<string, AnatomyArea> = {
  'CHEST/HEART': {
    id: 'CHEST/HEART',
    name: 'Chest & Cardiovascular',
    category: 'Chest_Heart.csv',
    conditions: ['Hypertension', 'Asthma', 'Heart Attack (Myocardial Infarction)', 'Angina Pectoris', 'Pneumonia', 'Pulmonary Embolism'],
    simpleAilments: ['Mild Cough', 'Shortness of breath with exertion', 'Benign Palpitations', 'Costochondritis'],
    urgencyLevel: 'CRITICAL',
    datasetFile: 'Chest_Heart.csv',
    stats: {
      datasetCases: 18432,
      avgAge: 51,
      commonMedications: ['Aspirin', 'Lipitor', 'Penicillin', 'Ibuprofen', 'Paracetamol'],
      emergencyRatePercent: 67,
    }
  },
  'ABDOMEN/DIGESTION': {
    id: 'ABDOMEN/DIGESTION',
    name: 'Abdomen & Digestive System',
    category: 'Abdomen.csv',
    conditions: ['Acute Appendicitis', 'Cholecystitis (Gallbladder)', 'Diabetes Complications', 'Obesity-Related Disorders', 'Peptic Ulcer', 'Pancreatitis'],
    simpleAilments: ['Stomach Ache', 'Bloating', 'Acidity/Heartburn', 'Mild Indigestion'],
    urgencyLevel: 'MEDIUM',
    datasetFile: 'Abdomen.csv',
    stats: {
      datasetCases: 18320,
      avgAge: 51,
      commonMedications: ['Ibuprofen', 'Aspirin', 'Lipitor', 'Omeprazole', 'Metformin'],
      emergencyRatePercent: 54,
    }
  },
  'HEAD/BRAIN': {
    id: 'HEAD/BRAIN',
    name: 'Head & Neurological',
    category: 'General',
    conditions: ['Acute Ischemic Stroke', 'Transient Ischemic Attack', 'Meningitis', 'Severe Concussion', 'Subarachnoid Hemorrhage', 'Intracranial Pressure'],
    simpleAilments: ['Tension Headache', 'Migraine with Aura', 'Vestibular Dizziness', 'Fatigue/Brain Fog'],
    urgencyLevel: 'HIGH',
    datasetFile: 'General',
    stats: {
      datasetCases: 8940,
      avgAge: 49,
      commonMedications: ['Acetaminophen', 'Magnesium', 'Triptans', 'Aspirin'],
      emergencyRatePercent: 62,
    }
  },
  'LIMBS/BONES': {
    id: 'LIMBS/BONES',
    name: 'Limbs & Musculoskeletal',
    category: 'Limbs_Bones.csv',
    conditions: ['Rheumatoid & Osteoarthritis', 'Compound / Closed Fracture', 'Acute Ligament Tear', 'Severe Gout Flare', 'Deep Vein Thrombosis'],
    simpleAilments: ['Joint Stiffness', 'Minor Muscle Cramp', 'Localized Swelling', 'Mild Ankle Sprain'],
    urgencyLevel: 'LOW/MEDIUM',
    datasetFile: 'Limbs_Bones.csv',
    stats: {
      datasetCases: 9168,
      avgAge: 51,
      commonMedications: ['Ibuprofen', 'Penicillin', 'Aspirin', 'Paracetamol', 'Naproxen'],
      emergencyRatePercent: 42,
    }
  },
  'MENTAL_HEALTH': {
    id: 'MENTAL_HEALTH',
    name: 'Mental & Psychosomatic Health',
    category: 'Mental_Health.csv',
    conditions: ['Acute Panic Attack', 'Generalized Anxiety Disorder (GAD)', 'Clinical Depression', 'Severe Chronic Insomnia', 'PTSD Episodes'],
    simpleAilments: ['Situational Stress', 'Restlessness', 'Sleep disruption', 'Mild Nervousness'],
    urgencyLevel: 'MEDIUM',
    datasetFile: 'Mental_Health.csv',
    stats: {
      datasetCases: 500,
      avgAge: 38,
      commonMedications: ['Cognitive Behavioral Therapy (CBT)', 'Controlled Breathing', 'Sleep Hygiene', 'Melatonin', 'Support Consultation'],
      emergencyRatePercent: 28,
    }
  },
  'SYSTEMIC_COMPLEX': {
    id: 'SYSTEMIC_COMPLEX',
    name: 'Systemic & Oncology',
    category: 'Systemic_Complex.csv',
    conditions: ['Oncological Conditions', 'Systemic Sepsis', 'Severe Anaphylaxis', 'Multi-organ Infection'],
    simpleAilments: ['General Malaise', 'Mild Shivering', 'Low-grade Fever'],
    urgencyLevel: 'HIGH',
    datasetFile: 'Systemic_Complex.csv',
    stats: {
      datasetCases: 9245,
      avgAge: 52,
      commonMedications: ['Specialist Oncology Regimen', 'Broad-spectrum Antibiotics', 'Lipitor', 'Supportive Fluids'],
      emergencyRatePercent: 71,
    }
  }
};

// Keyword mapping for initial triage routing
export const SYMPTOM_KEYWORDS: Record<string, { part: string; priority: number; weight: number }> = {
  // Chest & Heart (High priority)
  'chest': { part: 'CHEST/HEART', priority: 1, weight: 15 },
  'chest pain': { part: 'CHEST/HEART', priority: 1, weight: 25 },
  'heart': { part: 'CHEST/HEART', priority: 1, weight: 20 },
  'cardiac': { part: 'CHEST/HEART', priority: 1, weight: 25 },
  'breath': { part: 'CHEST/HEART', priority: 1, weight: 20 },
  'shortness of breath': { part: 'CHEST/HEART', priority: 1, weight: 25 },
  'breathing': { part: 'CHEST/HEART', priority: 1, weight: 20 },
  'palpitation': { part: 'CHEST/HEART', priority: 1, weight: 15 },
  'asthma': { part: 'CHEST/HEART', priority: 1, weight: 15 },
  'wheezing': { part: 'CHEST/HEART', priority: 1, weight: 18 },

  // Abdomen & Digestion
  'stomach': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 12 },
  'belly': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 10 },
  'abdomen': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 12 },
  'abdominal': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 14 },
  'gallbladder': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 16 },
  'liver': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 16 },
  'side pain': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 10 },
  'nausea': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 8 },
  'vomiting': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 12 },
  'diabetes': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 10 },
  'appendix': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 20 },
  'heartburn': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 6 },
  'bloating': { part: 'ABDOMEN/DIGESTION', priority: 2, weight: 4 },

  // Head & Brain
  'head': { part: 'HEAD/BRAIN', priority: 3, weight: 10 },
  'headache': { part: 'HEAD/BRAIN', priority: 3, weight: 12 },
  'migraine': { part: 'HEAD/BRAIN', priority: 3, weight: 12 },
  'dizzy': { part: 'HEAD/BRAIN', priority: 3, weight: 10 },
  'dizziness': { part: 'HEAD/BRAIN', priority: 3, weight: 10 },
  'slurred': { part: 'HEAD/BRAIN', priority: 1, weight: 25 },
  'speech': { part: 'HEAD/BRAIN', priority: 2, weight: 15 },
  'vision': { part: 'HEAD/BRAIN', priority: 2, weight: 15 },
  'blur': { part: 'HEAD/BRAIN', priority: 2, weight: 12 },
  'concussion': { part: 'HEAD/BRAIN', priority: 1, weight: 22 },
  'fainting': { part: 'HEAD/BRAIN', priority: 1, weight: 22 },
  'brain fog': { part: 'HEAD/BRAIN', priority: 4, weight: 6 },

  // Limbs & Bones
  'leg': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'arm': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'bone': { part: 'LIMBS/BONES', priority: 3, weight: 15 },
  'joint': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'knee': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'ankle': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'fracture': { part: 'LIMBS/BONES', priority: 2, weight: 20 },
  'sprain': { part: 'LIMBS/BONES', priority: 4, weight: 8 },
  'arthritis': { part: 'LIMBS/BONES', priority: 4, weight: 10 },
  'swelling': { part: 'LIMBS/BONES', priority: 4, weight: 8 },

  // Mental Health
  'anxiety': { part: 'MENTAL_HEALTH', priority: 3, weight: 12 },
  'panic': { part: 'MENTAL_HEALTH', priority: 2, weight: 16 },
  'panic attack': { part: 'MENTAL_HEALTH', priority: 2, weight: 18 },
  'nervous': { part: 'MENTAL_HEALTH', priority: 4, weight: 6 },
  'scared': { part: 'MENTAL_HEALTH', priority: 4, weight: 6 },
  'shivering': { part: 'MENTAL_HEALTH', priority: 3, weight: 10 },
  'insomnia': { part: 'MENTAL_HEALTH', priority: 4, weight: 8 },
  'depression': { part: 'MENTAL_HEALTH', priority: 3, weight: 10 },
  'doom': { part: 'MENTAL_HEALTH', priority: 2, weight: 14 },

  // Systemic
  'fever': { part: 'SYSTEMIC_COMPLEX', priority: 3, weight: 10 },
  'shiver': { part: 'SYSTEMIC_COMPLEX', priority: 3, weight: 8 },
  'cancer': { part: 'SYSTEMIC_COMPLEX', priority: 2, weight: 15 },
  'infection': { part: 'SYSTEMIC_COMPLEX', priority: 3, weight: 12 },
  'unconscious': { part: 'CHEST/HEART', priority: 1, weight: 30 },
  'bleeding': { part: 'LIMBS/BONES', priority: 1, weight: 25 },
};

// Emergency red-flag definitions from medical_data.py
export const EMERGENCY_RED_FLAGS: Record<string, string[]> = {
  cardiac: [
    'chest pain',
    'chest pressure',
    'crushing chest',
    'left arm pain',
    'heart racing',
    'palpitations',
    'radiating to jaw',
    'radiating to neck'
  ],
  respiratory: [
    'shortness of breath',
    'difficulty breathing',
    'cannot breathe',
    'gasping for air',
    'severe wheezing',
    'stridor',
    'throat closing',
    'blue lips'
  ],
  neurological: [
    'slurred speech',
    'facial droop',
    'arm weakness',
    'sudden numbness',
    'severe dizziness',
    'loss of consciousness',
    'fainting',
    'seizure',
    'worst headache of life'
  ],
  trauma: [
    'heavy bleeding',
    'compound fracture',
    'bone visible',
    'deep cut',
    'severe head impact',
    'uncontrolled hemorrhage'
  ],
  abdominal_acute: [
    'rigid abdomen',
    'sudden excruciating abdominal pain',
    'rebound tenderness',
    'vomiting blood'
  ]
};

// Common ailments reference
export const COMMON_AILMENTS: Record<string, {
  symptoms: string[];
  remedies: string[];
  precaution: string;
  likelyConditions: string[];
}> = {
  'Common Cold / Upper Respiratory': {
    symptoms: ['sneezing', 'runny nose', 'mild cough', 'congestion', 'scratchy throat'],
    remedies: ['Adequate hydration (warm fluids)', 'Rest and sleep', 'Steam inhalation & saline spray', 'Vitamin C and zinc'],
    precaution: 'Monitor body temperature; if fever exceeds 102°F (38.9°C) or shortness of breath develops, seek immediate evaluation.',
    likelyConditions: ['Viral Rhinitis', 'Pharyngitis', 'Mild URI']
  },
  'Migraine / Tension Headache': {
    symptoms: ['throbbing headache', 'sensitivity to light (photophobia)', 'nausea', 'sound sensitivity'],
    remedies: ['Rest in a quiet, dark room', 'Targeted hydration & electrolytes', 'Cold compress on forehead or neck', 'Magnesium supplementation'],
    precaution: 'Seek emergency evaluation immediately if this presents as a sudden thunderclap headache or is accompanied by neurological deficits.',
    likelyConditions: ['Migraine without Aura', 'Tension-Type Headache']
  },
  'Indigestion & Gastric Discomfort': {
    symptoms: ['stomach ache', 'bloating', 'mild heartburn', 'burping', 'fullness after meals'],
    remedies: ['Warm ginger or chamomile tea', 'Avoid greasy, acidic, or heavily spiced foods', 'Consume smaller, frequent meals', 'Remain upright for at least 2 hours post-meal'],
    precaution: 'If pain migrates to the lower right abdomen (McBurney point) or becomes sharp and persistent, seek emergency surgical evaluation for appendicitis.',
    likelyConditions: ['Dyspepsia', 'GERD', 'Gastric Hyperacidity']
  },
  'Ankle / Muscle Sprain': {
    symptoms: ['localized pain', 'mild swelling', 'stiffness', 'tender to touch', 'can bear partial weight'],
    remedies: ['R.I.C.E. protocol (Rest, Ice 15-20 min, Compression bandage, Elevation above heart)', 'Gentle range of motion after 48 hours'],
    precaution: 'If unable to bear any weight for 4 steps, or severe bone deformity/crepitus is felt, an X-ray is required to rule out fracture.',
    likelyConditions: ['Grade 1 Inversion Sprain', 'Musculotendinous Strain']
  },
  'Acute Panic or Anxiety Surge': {
    symptoms: ['racing heart', 'hyperventilation', 'trembling / shivering', 'feeling of impending doom', 'dizziness'],
    remedies: ['4-7-8 deep diaphragmatic breathing technique', 'Grounding exercise: 5 things you see, 4 you feel, 3 you hear', 'Sip cool water slowly in a safe posture'],
    precaution: 'First-time panic attacks must have cardiac etiology ruled out with an ECG, especially if accompanied by diaphoresis or crushing chest discomfort.',
    likelyConditions: ['Panic Attack', 'Acute Stress Reaction']
  }
};
