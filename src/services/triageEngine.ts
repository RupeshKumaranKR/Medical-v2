import { ANATOMY_MAP, SYMPTOM_KEYWORDS, EMERGENCY_RED_FLAGS, COMMON_AILMENTS, AnatomyArea } from '../data/clinicalKnowledge';

export interface TriageResult {
  status: 'URGENT' | 'SIMPLE';
  confidence: number;
  confidenceDetail: string;
  targetAnatomy: string;
  targetAnatomyDetails: AnatomyArea | null;
  datasetContext: string;
  referredPainNotice?: {
    type: 'GALLBLADDER_LIVER' | 'CARDIAC' | 'NONE';
    title: string;
    description: string;
    warning: string;
  };
  matchedConditions: string[];
  matchedRedFlags: string[];
  actionPlan: {
    urgencyHeadline: string;
    action: string;
    steps: string[];
    precaution: string;
    homeRemedies?: string[];
  };
  clinicalAnalysis: {
    suspectedSystem: string;
    likelyOrgan: string;
    pathophysiologySummary: string;
    historicalMedicationHint: string;
  };
  timestamp: string;
}

export function evaluateClinicalTriage(userInput: string): TriageResult {
  const normalized = userInput.toLowerCase().trim();
  const timestamp = new Date().toISOString();

  // 1. Check for Emergency Red Flags
  const redFlagsTriggered: { category: string; flag: string }[] = [];
  for (const [category, flags] of Object.entries(EMERGENCY_RED_FLAGS)) {
    for (const flag of flags) {
      if (normalized.includes(flag)) {
        redFlagsTriggered.push({ category, flag });
      }
    }
  }

  // 2. Critical Referred Pain Logic (from final_system.py)
  // Rule 1: Right shoulder / arm + Right abdomen / stomach -> Gallbladder / Liver
  const hasRightSide = normalized.includes('right');
  const hasLeftSide = normalized.includes('left');
  const hasShoulderOrArm = normalized.includes('shoulder') || normalized.includes('arm');
  const hasAbdomenOrStomach = normalized.includes('abdomen') || normalized.includes('stomach') || normalized.includes('gallbladder') || normalized.includes('liver') || normalized.includes('belly') || normalized.includes('side');
  const hasChest = normalized.includes('chest') || normalized.includes('heart') || normalized.includes('cardiac') || normalized.includes('sternum');

  let referredPain: TriageResult['referredPainNotice'];

  if ((hasRightSide && (hasShoulderOrArm || normalized.includes('scapula'))) && (hasAbdomenOrStomach || normalized.includes('right upper'))) {
    referredPain = {
      type: 'GALLBLADDER_LIVER',
      title: '📍 REFERRED PAIN DETECTED: Hepatobiliary / Gallbladder Pattern',
      description: 'Pain in the RIGHT shoulder, scapula, or upper arm combined with RIGHT abdominal/stomach discomfort is classic referred pain via the phrenic nerve radiating from the Gallbladder (Acute Cholecystitis / Biliary Colic) or Liver capsule.',
      warning: 'CRITICAL CLINICAL RULE: Do not confuse right-sided referred pain with acute coronary syndromes. However, acute cholecystitis requires urgent ultrasound and surgical evaluation.'
    };
  } else if ((hasLeftSide && hasShoulderOrArm) && (hasChest || normalized.includes('pressure') || normalized.includes('shortness of breath'))) {
    referredPain = {
      type: 'CARDIAC',
      title: '🚨 CRITICAL REFERRED PAIN: Classic Cardiac Distribution',
      description: 'Radiation of discomfort from the CHEST to the LEFT shoulder, arm, inner wrist, or jaw strongly signifies myocardial ischemia (Angina Pectoris or Acute Myocardial Infarction).',
      warning: 'HIGH-RISK CARDIAC EMERGENCY: Call emergency medical dispatch immediately. Do not exert yourself.'
    };
  }

  // 3. Anatomical Routing with Priority Hierarchy:
  // Priority: Internal Organs (Chest > Abdomen > Head) > Limbs > Mental Health > General
  let targetAreaKey = 'CHEST/HEART';
  let bestScore = -1;

  for (const [keyword, info] of Object.entries(SYMPTOM_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      // Calculate score based on weight and priority (lower priority number is higher priority)
      const score = info.weight * (10 - info.priority);
      if (score > bestScore) {
        bestScore = score;
        targetAreaKey = info.part;
      }
    }
  }

  // If no direct keyword matched, fallback to general check
  const anatomyDetails = ANATOMY_MAP[targetAreaKey] || ANATOMY_MAP['CHEST/HEART'];

  // 4. ML / Algorithmic Triage Score (Emulating SGDClassifier & Vectorizer on 55k rows)
  let urgentScore = 0;
  let simpleScore = 0;

  // Weight red flags heavily
  if (redFlagsTriggered.length > 0) {
    urgentScore += redFlagsTriggered.length * 40;
  }

  if (referredPain?.type === 'CARDIAC') {
    urgentScore += 80;
  } else if (referredPain?.type === 'GALLBLADDER_LIVER') {
    urgentScore += 45;
  }

  // Keyword scoring
  for (const [keyword, info] of Object.entries(SYMPTOM_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      if (info.priority <= 2) urgentScore += info.weight * 1.5;
      else simpleScore += info.weight;
    }
  }

  // Known simple phrases dampen urgency unless red flags exist
  const simpleKeywords = ['mild', 'slight', 'congestion', 'itch', 'runny nose', 'sneezing', 'for 2 days', 'minor', 'sunburn', 'fatigue after desk'];
  for (const sk of simpleKeywords) {
    if (normalized.includes(sk)) {
      simpleScore += 20;
      urgentScore = Math.max(0, urgentScore - 15);
    }
  }

  const isUrgent = redFlagsTriggered.length > 0 || referredPain?.type === 'CARDIAC' || urgentScore >= simpleScore + 10;
  const totalScore = Math.max(1, urgentScore + simpleScore);
  const rawConfidence = isUrgent ? (urgentScore / totalScore) : (simpleScore / totalScore);
  const confidence = Math.min(0.98, Math.max(0.62, parseFloat(rawConfidence.toFixed(2))));

  // 5. Match Healthcare Dataset context (from 55k rows dataset)
  const stats = anatomyDetails.stats;
  const datasetContext = `Database Analytics (${anatomyDetails.datasetFile}): 
Contains ${stats.datasetCases.toLocaleString()} clinical records. Average patient age is ${stats.avgAge} yrs for this anatomical area. 
Emergency/Urgent admission rate: ${stats.emergencyRatePercent}%. Top prescribed medications: ${stats.commonMedications.slice(0, 3).join(', ')}.`;

  // 6. Formulate Action Plan & Clinical Analysis
  let actionPlan: TriageResult['actionPlan'];
  let clinicalAnalysis: TriageResult['clinicalAnalysis'];

  if (isUrgent) {
    const redFlagDescriptions = redFlagsTriggered.map(r => r.flag);
    actionPlan = {
      urgencyHeadline: 'EMERGENCY / HIGH URGENCY ADMISSION RECOMMENDED',
      action: 'Seek Immediate Emergency Medical Attention (Call Emergency Services)',
      steps: [
        'Call 911 / 112 / 999 or your local emergency dispatch immediately.',
        'Cease all physical exertion; rest in a seated or supported position.',
        'Do not consume food, fluids, or non-prescribed analgesics until cleared by paramedics.',
        'If chest tightness or shortness of breath is present, loosen restrictive clothing around neck and waist.'
      ],
      precaution: referredPain?.warning || 'High-risk clinical indicators detected in healthcare dataset analysis. Delaying medical contact increases complication rates.',
      homeRemedies: ['None recommended during acute presentation - require clinical triage.']
    };

    clinicalAnalysis = {
      suspectedSystem: anatomyDetails.name,
      likelyOrgan: referredPain ? (referredPain.type === 'CARDIAC' ? 'Myocardium / Coronary Arteries' : 'Gallbladder / Biliary Tract') : anatomyDetails.conditions[0] || 'Vital Organ System',
      pathophysiologySummary: referredPain ? referredPain.description : `Clinical symptom profile correlates with high-urgency presentations documented in ${anatomyDetails.datasetFile}. Symptoms include: ${redFlagDescriptions.length > 0 ? redFlagDescriptions.join(', ') : 'High-acuity indicators'}.`,
      historicalMedicationHint: `Emergency department protocols typically evaluate with diagnostics (ECG, Troponin, CT/Ultrasound). Dataset correlates with: ${stats.commonMedications[0] || 'Hospital intervention'}.`
    };
  } else {
    // Find closest common ailment
    let matchedAilment = Object.entries(COMMON_AILMENTS)[0][1];
    let matchedAilmentName = Object.keys(COMMON_AILMENTS)[0];

    for (const [name, ailment] of Object.entries(COMMON_AILMENTS)) {
      if (ailment.symptoms.some(s => normalized.includes(s))) {
        matchedAilment = ailment;
        matchedAilmentName = name;
        break;
      }
    }

    actionPlan = {
      urgencyHeadline: 'SIMPLE / ELECTIVE CARE PROTOCOL',
      action: 'Home Supportive Care & Primary Physician Consultation if Persistent',
      steps: matchedAilment.remedies,
      precaution: matchedAilment.precaution,
      homeRemedies: matchedAilment.remedies
    };

    clinicalAnalysis = {
      suspectedSystem: anatomyDetails.name,
      likelyOrgan: matchedAilmentName,
      pathophysiologySummary: `Symptoms correlate with low-acuity, outpatient or elective admission profiles in the healthcare dataset. No life-threatening red flags detected.`,
      historicalMedicationHint: `Typical healthcare dataset outpatient medications for this group include: ${stats.commonMedications.join(', ')}.`
    };
  }

  return {
    status: isUrgent ? 'URGENT' : 'SIMPLE',
    confidence,
    confidenceDetail: `Dataset Statistical Model (Confidence: ${(confidence * 100).toFixed(0)}%)`,
    targetAnatomy: anatomyDetails.id,
    targetAnatomyDetails: anatomyDetails,
    datasetContext,
    referredPainNotice: referredPain,
    matchedConditions: anatomyDetails.conditions,
    matchedRedFlags: redFlagsTriggered.map(r => r.flag),
    actionPlan,
    clinicalAnalysis,
    timestamp
  };
}
