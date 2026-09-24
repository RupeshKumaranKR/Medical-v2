import React, { useState } from 'react';
import { ANATOMY_MAP } from '../data/clinicalKnowledge';
import { 
  HeartPulse, 
  Activity, 
  AlertCircle, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Database,
  Info
} from 'lucide-react';

export const AnatomyAtlas: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string>('CHEST/HEART');
  const selectedArea = ANATOMY_MAP[activeZone];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              Anatomical Routing & Referred Pain Architecture
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Anatomy Atlas & Clinical Routing Engine
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Explains how user complaints are mapped from specific body sectors into categorical clinical CSV slices and differential referred-pain tracks.
            </p>
          </div>
        </div>
      </div>

      {/* Referred Pain Highlight Feature Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider font-semibold mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Special Case 1: Hepatobiliary Referred Pain
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Right Shoulder / Arm + Right Abdomen
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Irritation of the diaphragm or peritoneum via the right phrenic nerve (C3-C5) projects sensory signals into the right supraclavicular and shoulder area.
          </p>
          <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-800/40 text-xs text-amber-200 space-y-1">
            <div className="font-semibold">Likely Pathology: Gallbladder (Cholecystitis) or Liver</div>
            <div className="text-[11px] text-amber-300/80">
              Crucial Rule: Do NOT confuse this with Cardiac Infarction. Direct immediate focus to abdominal ultrasound and biliary evaluation.
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider font-semibold mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Special Case 2: Acute Cardiac Distribution
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Left Shoulder / Arm + Chest / Neck
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Afferent fibers from the cardiac plexus enter spinal cord segments T1-T4, sharing dorsal root pathways with somatic dermatomes of the left upper limb and chest.
          </p>
          <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-800/40 text-xs text-rose-200 space-y-1">
            <div className="font-semibold">Likely Pathology: Angina Pectoris / Acute Myocardial Infarction</div>
            <div className="text-[11px] text-rose-300/80">
              Emergency Action: Requires immediate emergency medical dispatch and telemetry. Every minute of delay impacts myocardial salvage.
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Anatomy Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Zone buttons */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Select Anatomical Target
          </div>
          {Object.entries(ANATOMY_MAP).map(([key, area]) => (
            <button
              key={key}
              onClick={() => setActiveZone(key)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                activeZone === key
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shrink-0 ${
                  area.urgencyLevel === 'CRITICAL' ? 'bg-rose-500 ring-4 ring-rose-500/20' :
                  area.urgencyLevel === 'HIGH' ? 'bg-amber-500 ring-4 ring-amber-500/20' : 
                  'bg-emerald-500 ring-4 ring-emerald-500/20'
                }`} />
                <div>
                  <div className="font-bold text-white text-sm">{area.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{area.datasetFile}</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeZone === key ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>

        {/* Right column: Zone deep dive */}
        {selectedArea && (
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Zone Breakdown • {selectedArea.id}
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {selectedArea.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Linked dataset source: <code className="text-cyan-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedArea.datasetFile}</code>
                </p>
              </div>

              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
                selectedArea.urgencyLevel === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                selectedArea.urgencyLevel === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                Urgency: {selectedArea.urgencyLevel}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Cases Analyzed</div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {selectedArea.stats.datasetCases.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Average Patient Age</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                  {selectedArea.stats.avgAge} yrs
                </div>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Emergency Admission %</div>
                <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                  {selectedArea.stats.emergencyRatePercent}%
                </div>
              </div>
            </div>

            {/* Conditions vs Simple Ailments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  High-Risk / Urgent Conditions
                </div>
                <ul className="space-y-1.5">
                  {selectedArea.conditions.map((c, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Common Outpatient / Simple Ailments
                </div>
                <ul className="space-y-1.5">
                  {selectedArea.simpleAilments.map((a, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Common Medications */}
            <div>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Top Prescribed Pharmacotherapies in Dataset
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedArea.stats.commonMedications.map((med, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-cyan-200 border border-slate-700">
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
