import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { evaluateClinicalTriage, TriageResult } from './src/services/triageEngine.js';
import { ANATOMY_MAP } from './src/data/clinicalKnowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory consultation logs initialized with existing records
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

const consultationLogs: ConsultationLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-02-14 14:28:00',
    status: 'SIMPLE',
    detail: 'General consultation: mild tension headache and eye strain after monitor work',
    symptoms: 'Mild tension headache, tired eyes',
    targetAnatomy: 'HEAD/BRAIN',
    organ: 'Tension Headache',
    confidence: 0.75
  },
  {
    id: 'log-2',
    timestamp: '2026-02-14 14:47:50',
    status: 'URGENT',
    detail: 'ML Analysis (Confidence: 0.61): Patient with acute chest heaviness radiating to left shoulder',
    symptoms: 'Acute chest heaviness radiating to left shoulder, breathlessness',
    targetAnatomy: 'CHEST/HEART',
    organ: 'Heart Attack (Myocardial Infarction)',
    confidence: 0.88
  }
];

// 1. Triage evaluation endpoint
app.post('/api/triage', (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Symptoms description is required.' });
    }

    const result = evaluateClinicalTriage(symptoms);
    return res.json(result);
  } catch (err: any) {
    console.error('Triage error:', err);
    return res.status(500).json({ error: 'Failed to process triage evaluation.' });
  }
});

// 2. Advanced Clinical AI Synthesis endpoint (Replacing Ollama Meditron/Llama 3 with Gemini server-side)
app.post('/api/recommend', async (req: Request, res: Response) => {
  try {
    const { symptoms, triageResult }: { symptoms: string; triageResult: TriageResult } = req.body;
    if (!symptoms || !triageResult) {
      return res.status(400).json({ error: 'Missing symptoms or triageResult.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful clinical fallback using local knowledge base
      return res.json({
        source: 'local_engine',
        status: triageResult.status,
        clinicalReport: `[LOCAL CLINICAL ENGINE]\nSTATUS: ${triageResult.status}\nANALYSIS: ${triageResult.clinicalAnalysis.pathophysiologySummary}\nCAUSE/ORGAN: ${triageResult.clinicalAnalysis.likelyOrgan}\nACTION: ${triageResult.actionPlan.action}\nSTEPS:\n${triageResult.actionPlan.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nPRECAUTION: ${triageResult.actionPlan.precaution}`,
        steps: triageResult.actionPlan.steps,
        precaution: triageResult.actionPlan.precaution
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a clinical recommendation engine reproducing the Meditron / Llama 3 medical triage model.
CRITICAL KNOWLEDGE ENFORCEMENT:
1. REFERRED PAIN: Pain in the RIGHT shoulder/arm + RIGHT abdomen usually indicates Gallbladder (Cholecystitis) or Liver issues. Do not confuse Right-sided pain with Heart Attacks.
2. CARDIAC PAIN: Pain in the LEFT shoulder/arm + CHEST indicates Heart (Angina/MI).

Patient Symptoms: "${symptoms}"
Evaluated Triage Status: ${triageResult.status} (Confidence: ${(triageResult.confidence * 100).toFixed(0)}%)
Anatomical Focus: ${triageResult.targetAnatomy}
Healthcare Dataset Context: ${triageResult.datasetContext}
${triageResult.referredPainNotice ? `Detected Referred Pain: ${triageResult.referredPainNotice.title} - ${triageResult.referredPainNotice.description}` : ''}

Provide a structured, professional clinical recommendation response containing:
1. STATUS: (URGENT/EMERGENCY or SIMPLE/ELECTIVE)
2. ANALYSIS: (Explain symptoms, mentioning referred pain from an organ if applicable)
3. CAUSE / LIKELY PATHOLOGY: (Identify likely affected organ or condition)
4. IMMEDIATE ACTION PLAN & REMEDIES: (3-4 concise, practical steps)
5. MAJOR CLINICAL PRECAUTION: (1 vital precaution / warning)

Keep the tone concise, medically sound, and safe.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({
      source: 'gemini_ai',
      status: triageResult.status,
      clinicalReport: response.text,
      steps: triageResult.actionPlan.steps,
      precaution: triageResult.actionPlan.precaution
    });
  } catch (err: any) {
    console.warn('AI recommendation error, falling back to local clinical engine:', err.message);
    const { triageResult } = req.body;
    return res.json({
      source: 'local_fallback',
      status: triageResult?.status || 'UNKNOWN',
      clinicalReport: triageResult ? `[LOCAL CLINICAL ENGINE]\nSTATUS: ${triageResult.status}\nANALYSIS: ${triageResult.clinicalAnalysis.pathophysiologySummary}\nCAUSE: ${triageResult.clinicalAnalysis.likelyOrgan}\nACTION: ${triageResult.actionPlan.action}` : 'Evaluation completed with local safety fallback.',
      steps: triageResult?.actionPlan?.steps || [],
      precaution: triageResult?.actionPlan?.precaution || 'Consult a healthcare provider.'
    });
  }
});

// 3. Healthcare dataset analytics
app.get('/api/dataset-stats', (_req: Request, res: Response) => {
  const categories = Object.entries(ANATOMY_MAP).map(([key, item]) => ({
    id: key,
    name: item.name,
    file: item.datasetFile,
    urgencyLevel: item.urgencyLevel,
    stats: item.stats,
    conditions: item.conditions,
    simpleAilments: item.simpleAilments
  }));

  const totalCases = categories.reduce((sum, c) => sum + c.stats.datasetCases, 0);

  return res.json({
    totalRecordsFound: 55605,
    analyzedCases: totalCases,
    categories,
    admissionTypes: {
      urgent: '33.4%',
      emergency: '33.3%',
      elective: '33.3%'
    }
  });
});

// 4. Consultation logs
app.get('/api/consultation-logs', (_req: Request, res: Response) => {
  return res.json(consultationLogs);
});

app.post('/api/consultation-logs', (req: Request, res: Response) => {
  const { status, detail, symptoms, targetAnatomy, organ, confidence } = req.body;
  const newLog: ConsultationLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    status: status || 'SIMPLE',
    detail: detail || 'Patient Consultation',
    symptoms: symptoms || 'Unspecified symptoms',
    targetAnatomy: targetAnatomy || 'GENERAL',
    organ: organ || 'General Clinical Observation',
    confidence: confidence || 0.7
  };
  consultationLogs.unshift(newLog);
  // Keep last 100 logs
  if (consultationLogs.length > 100) consultationLogs.pop();
  return res.status(201).json(newLog);
});

// Server bootstrap with Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medical Recommendation System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
