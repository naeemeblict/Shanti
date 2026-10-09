import express from 'express';
import path from 'path';
import 'dotenv/config';
import { generateClinicalSynthesis } from './src/server/gemini-handler';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', clinic: 'শান্তি হোমিও কেয়ার' });
});

// AI Clinical Synthesis endpoint (Server-Side @google/genai)
app.post('/api/ai/synthesize', async (req, res) => {
  try {
    const payload = req.body;
    const result = await generateClinicalSynthesis(payload);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('AI synthesis server error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'সার্ভারে এআই সারসংক্ষেপ তৈরিতে সমস্যা হয়েছে।',
    });
  }
});

// Serve frontend build if dist folder exists
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
