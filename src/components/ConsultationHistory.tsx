import React, { useEffect, useState } from 'react';
import { FileText, ShieldAlert, CheckCircle2, Clock, Trash2, RefreshCw, Download } from 'lucide-react';

interface ConsultationLog {
  id: string;
  timestamp: string;
  status: 'URGENT' | 'SIMPLE';
  detail: string;
  symptoms: string;
  targetAnatomy: string;
  organ: string;
  confidence: number;
}

export const ConsultationHistory: React.FC = () => {
  const [logs, setLogs] = useState<ConsultationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/consultation-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `consultation_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              Clinical Consultation & Audit Logs
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Triage Audit History (`logs/consultations.txt`)
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Persistent clinical interaction records with ML triage classification, anatomical targeting, confidence probabilities, and patient complaint details.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportAsJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Export Records
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            Loading consultation records...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No consultation records recorded yet. Run a triage diagnostic to generate one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                      log.status === 'URGENT'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {log.status === 'URGENT' ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {log.status}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {log.targetAnatomy}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {log.organ}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {log.timestamp}
                  </div>
                </div>

                <div className="text-sm font-semibold text-white mb-1">
                  Symptoms: "{log.symptoms}"
                </div>

                <div className="text-xs text-slate-400 font-sans">
                  {log.detail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
