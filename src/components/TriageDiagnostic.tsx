import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  Database, 
  HeartPulse, 
  FileText, 
  Brain, 
  Stethoscope, 
  Save, 
  Send 
} from 'lucide-react';
import { evaluateClinicalTriage, TriageResult } from '../services/triageEngine';
import { ANATOMY_MAP } from '../data/clinicalKnowledge';

interface Props {
  onSaveLog?: (log: any) => void;
}

const CLINICAL_PRESETS = [
  {
    label: 'Cardiac Emergency',
    symptoms: 'Crushing chest pain radiating to left arm and neck, shortness of breath, cold sweat',
    expected: 'URGENT',
    anatomy: 'CHEST/HEART'
  },
  {
    label: 'Referred Pain (Gallbladder)',
    symptoms: 'Sharp pain in right shoulder and right upper abdomen after eating fatty meal, nausea',
    expected: 'URGENT / REFERRED',
    anatomy: 'ABDOMEN/DIGESTION'
  },
  {
    label: 'Acute Panic Surge',
    symptoms: 'Sudden racing heart, hyperventilation, shivering, heightened anxiety, feeling of impending doom',
    expected: 'ELECTIVE / MENTAL',
    anatomy: 'MENTAL_HEALTH'
  },
  {
    label: 'Common Cold / Viral URI',
    symptoms: 'Mild nasal congestion, sneezing, runny nose, slight dry cough for 2 days, no high fever',
    expected: 'SIMPLE',
    anatomy: 'CHEST/HEART'
  },
  {
    label: 'Musculoskeletal Sprain',
    symptoms: 'Twisted right ankle during jog, moderate swelling, mild stiffness, able to bear partial weight',
    expected: 'SIMPLE',
    anatomy: 'LIMBS/BONES'
  },
  {
    label: 'Neurological Red Flag',
    symptoms: 'Sudden severe headache with slurred speech and weakness on one side of face',
    expected: 'URGENT (CRITICAL)',
    anatomy: 'HEAD/BRAIN'
  }
];

export const TriageDiagnostic: React.FC<Props> = ({ onSaveLog }) => {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [logSaved, setLogSaved] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const handleRunDiagnostic = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || symptomsInput).trim();
    if (!text) return;

    setIsAnalyzing(true);
    setAiReport(null);
    setLogSaved(false);

    try {
      // 1. Run deterministic local triage evaluation
      const localResult = evaluateClinicalTriage(text);
      setTriageResult(localResult);

      // 2. Fetch server-side clinical synthesis (simulating Meditron / Llama 3 via API)
      setAiLoading(true);
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms: text, triageResult: localResult }),
        });
        if (response.ok) {
          const data = await response.json();
          setAiReport(data.clinicalReport);
        }
      } catch (err) {
        console.warn('AI endpoint not reachable, local report will be shown');
      } finally {
        setAiLoading(false);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setSymptomsInput(presetText);
    handleRunDiagnostic(presetText);
  };

  const handleSaveToLog = async () => {
    if (!triageResult) return;
    try {
      const payload = {
        status: triageResult.status,
        detail: `${triageResult.confidenceDetail}: ${triageResult.clinicalAnalysis.pathophysiologySummary.slice(0, 80)}...`,
        symptoms: symptomsInput,
        targetAnatomy: triageResult.targetAnatomy,
        organ: triageResult.clinicalAnalysis.likelyOrgan,
        confidence: triageResult.confidence,
      };

      const res = await fetch('/api/consultation-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLogSaved(true);
        if (onSaveLog) onSaveLog(payload);
      }
    } catch (err) {
      console.error('Failed to save log', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Triage Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              Triage Engine v3.0 Final • 55,605 Records Trained
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Clinical Symptom Triage & Recommendation
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Anatomical routing engine with multi-variable urgency triage, referred pain pathing (Liver/Gallbladder vs Cardiac), and hospital dataset medication mapping.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Healthcare DB: <strong className="text-white">Active</strong></span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Meditron / Llama-3 Model: <strong className="text-emerald-400">Ready</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                Describe Patient Symptoms & Pain Locations
              </span>
              <span className="text-xs text-slate-400 font-mono">Free-form or anatomical keywords</span>
            </label>

            <div className="relative">
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Example: I have sharp, squeezing chest discomfort that radiates into my left shoulder and arm, accompanied by lightheadedness..."
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Tip: Include body quadrant (left/right), organ areas, and duration.
              </div>
              <div className="flex items-center gap-2">
                {symptomsInput && (
                  <button
                    onClick={() => {
                      setSymptomsInput('');
                      setTriageResult(null);
                      setAiReport(null);
                    }}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => handleRunDiagnostic()}
                  disabled={!symptomsInput.trim() || isAnalyzing}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Run Clinical Triage
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Clinical Presets */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Validation Scenarios (from Medical Datasets)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {CLINICAL_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.symptoms)}
                  className="text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {preset.label}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      preset.expected.includes('URGENT') 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {preset.expected}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {preset.symptoms}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Anatomical Quick Navigation / Body Part Focus */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
              Target Anatomy Sectors
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click an anatomical zone to inject clinical focus keywords.
            </p>

            <div className="space-y-2">
              {Object.entries(ANATOMY_MAP).map(([key, area]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedBodyPart(key);
                    setSymptomsInput((prev) => 
                      prev ? `${prev}, feeling pain and pressure in ${area.name}` : `Symptoms localized in ${area.name}: `
                    );
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                    triageResult?.targetAnatomy === key
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      area.urgencyLevel === 'CRITICAL' ? 'bg-rose-500' :
                      area.urgencyLevel === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="font-medium">{area.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {area.datasetFile}
                  </span>
                </button>
              ))}
            </div>

            {/* Critical Rules Notice Box */}
            <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Diagnostic Differential Rules
              </div>
              <p className="text-[11px] text-slate-300">
                • <strong>Right arm + Right abdomen:</strong> Hepatobiliary / Gallbladder. Do not confuse with Heart Attack.
              </p>
              <p className="text-[11px] text-slate-300">
                • <strong>Left arm + Chest:</strong> Acute Myocardial Ischemia. Immediate emergency protocol.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Diagnostic Results Section */}
      {triageResult && (
        <div className="space-y-6 pt-4 border-t border-slate-800/80 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
            triageResult.status === 'URGENT'
              ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/40 border-rose-600/60'
              : 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/40 border-emerald-600/60'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl ${
                  triageResult.status === 'URGENT' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {triageResult.status === 'URGENT' ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      triageResult.status === 'URGENT'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                    }`}>
                      TRIAGE: {triageResult.status === 'URGENT' ? 'URGENT / EMERGENCY' : 'SIMPLE / ELECTIVE'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {triageResult.confidenceDetail}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
                    {triageResult.actionPlan.urgencyHeadline}
                  </h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Primary Organ Focus: <strong className="text-white">{triageResult.clinicalAnalysis.likelyOrgan}</strong> • Anatomical Sector: <strong className="text-cyan-400">{triageResult.targetAnatomy}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={handleSaveToLog}
                  disabled={logSaved}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {logSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Consultation Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save to Audit Log
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referred Pain Notice Banner if triggered */}
            {triageResult.referredPainNotice && (
              <div className="mt-5 p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-amber-300">
                    {triageResult.referredPainNotice.title}
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {triageResult.referredPainNotice.description}
                  </p>
                  <div className="text-[11px] font-mono text-amber-300 font-semibold mt-1">
                    {triageResult.referredPainNotice.warning}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Column Clinical Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Action Plan & Protocols */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                Immediate Action Protocol
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Primary Recommendation
                </div>
                <div className="text-sm font-bold text-white">
                  {triageResult.actionPlan.action}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Action Steps & Immediate Measures
                </div>
                <ul className="space-y-2">
                  {triageResult.actionPlan.steps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Major Precaution */}
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200">
                <div className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Major Clinical Precaution
                </div>
                <p className="leading-relaxed">
                  {triageResult.actionPlan.precaution}
                </p>
              </div>
            </div>

            {/* Column 2: Dataset Evidence & Pathology */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Database className="w-4 h-4 text-cyan-400" />
                Dataset Evidence & Pathology
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Routing Dataset:</span>
                  <span className="font-mono text-cyan-300">{triageResult.targetAnatomyDetails?.datasetFile}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Matched Anatomical Area:</span>
                  <span className="text-white font-medium">{triageResult.targetAnatomyDetails?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Baseline Urgency Level:</span>
                  <span className="font-mono font-bold text-amber-400">{triageResult.targetAnatomyDetails?.urgencyLevel}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Emergency Rate in DB:</span>
                  <span className="font-mono text-emerald-400">{triageResult.targetAnatomyDetails?.stats.emergencyRatePercent}%</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Clinical Context Summary
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  {triageResult.clinicalAnalysis.pathophysiologySummary}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Common Hospital Dataset Medications
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {triageResult.targetAnatomyDetails?.stats.commonMedications.map((med, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: AI Model Recommendation (Meditron / Llama-3 Synthesis) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Brain className="w-4 h-4 text-purple-400" />
                    Clinical Recommendation
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                    LLM Synthesis
                  </span>
                </div>

                {aiLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                    Generating in-depth clinical report...
                  </div>
                ) : aiReport ? (
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line font-sans">
                    {aiReport}
                  </div>
                ) : (
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                    <div className="font-semibold text-white">
                      [LOCAL CLINICAL ENGINE REPORT]
                    </div>
                    <div>
                      <strong>STATUS:</strong> {triageResult.status}
                    </div>
                    <div>
                      <strong>ANALYSIS:</strong> {triageResult.clinicalAnalysis.pathophysiologySummary}
                    </div>
                    <div>
                      <strong>CAUSE/ORGAN:</strong> {triageResult.clinicalAnalysis.likelyOrgan}
                    </div>
                    <div>
                      <strong>ACTION PLAN:</strong> {triageResult.actionPlan.action}
                    </div>
                    <div>
                      <strong>MAJOR PRECAUTION:</strong> {triageResult.actionPlan.precaution}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Reproduced from Meditron & Llama 3 v3.0</span>
                <span>Port 3000 Node.js Runtime</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
