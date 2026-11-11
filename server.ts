import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback counseling response generator in Indonesian
function generateFallbackCounseling(message: string, screening: any): string {
  const msgLower = message.toLowerCase();
  const depLevel = screening?.depression?.severity || 'Normal';
  const anxLevel = screening?.anxiety?.severity || 'Normal';
  const strLevel = screening?.stress?.severity || 'Normal';

  if (msgLower.includes('tugas') || msgLower.includes('skripsi') || msgLower.includes('kuliah') || msgLower.includes('dosen')) {
    return `Halo, terima kasih sudah berbagi. Beban akademik seperti tugas kuliah dan skripsi memang menjadi salah satu sumber stres terbesar bagi mahasiswa. Berdasarkan hasil skrining bulananmu (Tingkat Stres: ${strLevel}, Kecemasan: ${anxLevel}), ada beberapa langkah yang bisa kamu coba:
1. **Metode Pomodoro Berkelanjutan**: Pecah target tugas menjadi sesi kecil 25 menit fokus, lalu 5 menit istirahat penuh tanpa layar.
2. **Prioritaskan dengan Kuadran Eisenhower**: Pilah mana yang mendesak-penting dan jangan ragu berdiskusi dengan Dosen PA jika butuh penyesuaian deadline.
3. Luangkan 10 menit untuk teknik pernapasan 4-7-8 di menu Self-Care untuk meredakan ketegangan fisik.`;
  }

  if (msgLower.includes('tidur') || msgLower.includes('insomnia') || msgLower.includes('begadang')) {
    return `Tidur adalah fondasi vital bagi regulasi emosi. Berdasarkan data pemantauanmu, kualitas tidur sangat mempengaruhi kestabilan suasana hati:
- Matikan layar gadget 45 menit sebelum tidur (blue light menghambat melatonin).
- Lakukan relaksasi otot progresif jika pikiranmu masih berputar-putar memikirkan hari esok.
- Hindari konsumsi kafein berlebih di atas jam 15.00 sore.`;
  }

  if (msgLower.includes('cemas') || msgLower.includes('panik') || msgLower.includes('takut') || anxLevel.includes('Tinggi') || anxLevel.includes('Berat')) {
    return `Wajar jika kamu merasa cemas saat ini. Mari kita ambil napas perlahan bersama:
Tarik napas 4 detik, tahan 4 detik, dan hembuskan perlahan 6 detik.
Ingatlah bahwa kecemasan adalah sinyal tubuh, bukan cerminan kegagalanmu. Data skriningmu menunjukkan tingkat kecemasan berada pada kategori **${anxLevel}**. Sangat disarankan untuk memanfaatkan sesi konsultasi dengan konselor kampus melalui menu *Jadwal Konseling* agar kamu mendapat pendampingan profesional yang aman dan rahasia.`;
  }

  return `Terima kasih telah terbuka dan peduli dengan kondisi mentalmu. Mengingat catatan skrining berkala terakhirmu (Depresi: ${depLevel}, Kecemasan: ${anxLevel}, Stres: ${strLevel}), proses pemulihan emosional bukanlah garis lurus melainkan langkah bertahap.
- Akui dan validasi setiap perasaan yang hadir tanpa menghakimi diri sendiri.
- Jaga ritme makan teratur, hidrasi, dan istirahat yang cukup di tengah kesibukan kampus.
- Bila membutuhkan tempat bercerita yang lebih mendalam, kamu dapat memesan sesi konseling dengan psikolog kampus kami kapan saja.`;
}

// API Endpoint for Real-Time Personalized Counseling Chat
app.post('/api/counseling/chat', async (req, res) => {
  try {
    const { message, screeningData, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Pesan pengguna diperlukan.' });
    }

    const currentScreeningContext = screeningData ? `
DATA SKRINING KESEHATAN MENTAL BULANAN PENGGUNA TERAKHIR:
- Bulan Evaluasi: ${screeningData.month || 'Bulan Terakhir'}
- Skor Depresi: ${screeningData.depression?.score ?? 'N/A'} (Kategori: ${screeningData.depression?.severity ?? 'Normal'})
- Skor Kecemasan: ${screeningData.anxiety?.score ?? 'N/A'} (Kategori: ${screeningData.anxiety?.severity ?? 'Normal'})
- Skor Stres: ${screeningData.stress?.score ?? 'N/A'} (Kategori: ${screeningData.stress?.severity ?? 'Normal'})
- Indeks Kesejahteraan Emosional: ${screeningData.wellbeingIndex ?? 'N/A'}%
- Catatan Gejala Dominan: ${screeningData.dominantIssues?.join(', ') || 'Keletihan perkuliahan'}
- Tren Bulan Sebelumnya: ${screeningData.trend || 'Stabil'}
` : 'Belum ada data skrining lengkap tersimpan.';

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const systemPrompt = `Anda adalah "Sahabat MindCare", konselor psikologis dan pendamping kesehatan mental virtual resmi untuk mahasiswa perguruan tinggi.
Tugas Anda adalah memberikan dukungan konseling berbasis data secara personal, empatik, berbasis bukti psikologis (CBT/mindfulness), dan real-time.

PANDUAN RESPON:
1. Nada bicara: Ramah, hangat, validatif, tidak menggurui, dan peka terhadap realitas kehidupan mahasiswa Indonesia (beban SKS, skripsi, organisasi, finansial, ekspektasi keluarga, pertemanan).
2. Manfaatkan data skrining bulanan pengguna secara kontekstual untuk memberikan saran yang terpersonalisasi.
3. Selalu tawarkan 2-3 langkah praktis yang bisa segera dipraktekkan hari ini.
4. Jika skor menunjukkan Depresi Berat / Sangat Berat atau pengguna mengekspresikan pikiran menyakiti diri, tunjukkan empati mendalam dan arahkan segera ke kontak darurat (Layanan Hotline Sejiwa 112 atau Hotline Konselor Kampus UPK BK: (0274) 587402).
5. Format respon menggunakan Markdown yang rapi (bolding, bullet points) agar mudah dibaca di layar perangkat.`;

        // Format history for context if available
        let promptWithContext = `${currentScreeningContext}\n\nPertanyaan/Curahan hati mahasiswa:\n"${message}"\n\nBerikan tanggapan konseling yang personal, menenangkan, dan solutif.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptWithContext,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        const reply = response.text || generateFallbackCounseling(message, screeningData);
        return res.json({ reply, source: 'gemini' });
      } catch (geminiError) {
        console.warn('Gemini API call error, falling back to local guidance:', geminiError);
        const fallbackReply = generateFallbackCounseling(message, screeningData);
        return res.json({ reply: fallbackReply, source: 'fallback' });
      }
    } else {
      const fallbackReply = generateFallbackCounseling(message, screeningData);
      return res.json({ reply: fallbackReply, source: 'fallback' });
    }
  } catch (error) {
    console.error('Counseling chat error:', error);
    return res.status(500).json({ error: 'Terjadi kendala pada server konseling.' });
  }
});

// API Endpoint for Deep Psychological Insights based on Screening
app.post('/api/counseling/analysis', async (req, res) => {
  try {
    const { screeningData } = req.body;
    if (!screeningData) {
      return res.status(400).json({ error: 'Data skrining diperlukan.' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analisis hasil skrining kesehatan mental bulanan mahasiswa berikut:
- Depresi: ${screeningData.depression?.score} (${screeningData.depression?.severity})
- Kecemasan: ${screeningData.anxiety?.score} (${screeningData.anxiety?.severity})
- Stres: ${screeningData.stress?.score} (${screeningData.stress?.severity})
- Kesejahteraan: ${screeningData.wellbeingIndex}%

Berikan analisis singkat dalam 3 bagian terstruktur:
1. **Ringkasan Kondisi Emosional Saat Ini**: Intisari kondisi emosional dalam 2 kalimat.
2. **Pemicu Potensial di Kehidupan Kampus**: Dugaan faktor pemicu (akademik, pola tidur, beban sosial).
3. **Rencana Aksi Personal 30 Hari**: 3 langkah konkrit dan terukur untuk bulan depan.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({ analysis: response.text });
      } catch (e) {
        console.warn('Failed AI analysis, returning structured template:', e);
      }
    }

    // Default structured template
    const analysis = `### Ringkasan Kondisi Emosional
Berdasarkan skrining bulan ini, skor depresi Anda berada pada tingkat **${screeningData.depression?.severity || 'Normal'}**, kecemasan pada **${screeningData.anxiety?.severity || 'Normal'}**, dan stres pada tingkat **${screeningData.stress?.severity || 'Normal'}** dengan Indeks Kesejahteraan **${screeningData.wellbeingIndex || 75}%**.

### Pemicu Potensial di Kehidupan Kampus
- Tekanan target akademik dan tenggat waktu tugas mingguan yang menumpuk.
- Ketidakteraturan jam tidur akibat pengerjaan tugas larut malam.
- Kurangnya ruang jeda istirahat berkualitas di luar rutinitas kuliah.

### Rencana Aksi Personal 30 Hari
1. **Atur Jadwal Digital Detox**: Sediakan waktu 30 menit sebelum tidur tanpa gadget untuk memulihkan ritme sirkadian.
2. **Latihan Pernapasan Terpandu**: Lakukan teknik relaksasi 4-7-8 setiap kali merasakan lonjakan stres perkuliahan.
3. **Konsultasi Terbuka**: Jadwalkan sesi diskusi suportif bersama konselor UPT Bimbingan Konseling kampus bila gejala menetap lebih dari 2 minggu.`;

    return res.json({ analysis });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: 'Gagal menganalisis data skrining.' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Vite Middleware for Development or Static serving for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindCampus server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
