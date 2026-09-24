import React, { useEffect, useState } from 'react';
import { Database, BarChart3, Users, Building, Pill, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DatasetStatsResponse {
  totalRecordsFound: number;
  analyzedCases: number;
  categories: Array<{
    id: string;
    name: string;
    file: string;
    urgencyLevel: string;
    stats: {
      datasetCases: number;
      avgAge: number;
      commonMedications: string[];
      emergencyRatePercent: number;
    };
    conditions: string[];
  }>;
  admissionTypes: {
    urgent: string;
    emergency: string;
    elective: string;
  };
}

export const DatasetAnalytics: React.FC = () => {
  const [statsData, setStatsData] = useState<DatasetStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dataset-stats')
      .then((res) => res.json())
      .then((data) => setStatsData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              Healthcare Dataset Analytics Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              55,605 Clinical Records Audit & Training Data
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Trained on hospital admissions data spanning physical trauma, chronic cardiology, abdominal surgery, and mental health demographics.
            </p>
          </div>
        </div>
      </div>

      {/* Top High-level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Dataset Rows</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">55,605</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cleaned & normalized in Anatomy_Data
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Patient Age</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">51.2 yrs</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Range: 18 - 85 years across cohorts
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Triage Split (Urgent / Elective)</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">66.7% / 33.3%</div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            Emergency + Urgent vs Elective
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Top Prescribed Class</span>
            <Pill className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">Cardiovascular / NSAID</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Lipitor, Aspirin, Ibuprofen, Penicillin
          </div>
        </div>
      </div>

      {/* Breakdown by Anatomical Datasets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400" />
          Anatomical Partition Slices (`Anatomy_Data/`)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData?.categories.map((cat) => (
            <div key={cat.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{cat.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {cat.file}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  Cases in partition: <strong className="text-white font-mono">{cat.stats.datasetCases.toLocaleString()}</strong>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Patient Age:</span>
                    <span className="font-mono text-cyan-300">{cat.stats.avgAge} yrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Ratio:</span>
                    <span className="font-mono text-rose-400">{cat.stats.emergencyRatePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Urgency Profile:</span>
                    <span className="font-semibold text-amber-400">{cat.urgencyLevel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1">Common Medications:</div>
                <div className="text-xs text-slate-200 font-mono">
                  {cat.stats.commonMedications.slice(0, 3).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
