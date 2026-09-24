import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  MapPin, 
  Database, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  AlertCircle
} from 'lucide-react';
import { TriageDiagnostic } from './components/TriageDiagnostic';
import { AnatomyAtlas } from './components/AnatomyAtlas';
import { DatasetAnalytics } from './components/DatasetAnalytics';
import { ConsultationHistory } from './components/ConsultationHistory';

type Tab = 'diagnostic' | 'anatomy' | 'dataset' | 'logs';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('diagnostic');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                    Medical Recommendation System
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                    v3.0 Final
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Anatomical Routing • 55k Healthcare Dataset • Referred Pain Intelligence
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
              <button
                onClick={() => setCurrentTab('diagnostic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'diagnostic'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Triage Diagnostic</span>
              </button>

              <button
                onClick={() => setCurrentTab('anatomy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'anatomy'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Anatomy & Referred Pain</span>
              </button>

              <button
                onClick={() => setCurrentTab('dataset')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'dataset'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>55k Records DB</span>
              </button>

              <button
                onClick={() => setCurrentTab('logs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === 'logs'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'diagnostic' && <TriageDiagnostic />}
        {currentTab === 'anatomy' && <AnatomyAtlas />}
        {currentTab === 'dataset' && <DatasetAnalytics />}
        {currentTab === 'logs' && <ConsultationHistory />}
      </main>

      {/* Clinical Disclaimer & Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500/80 shrink-0" />
            <span>
              <strong>Clinical Advisory Notice:</strong> For informational and triage demonstration purposes only. Not a substitute for professional medical emergency care. If experiencing severe chest pain, stroke signs, or trauma, dial 911 immediately.
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-600 shrink-0">
            Medical Recommendation System • Port 3000
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
