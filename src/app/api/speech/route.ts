import { NextResponse } from 'next/server';
import speech from '@google-cloud/speech';

// Initialize the client. We'll only pass credentials if they exist, 
// so it doesn't crash during build or local dev if env vars are missing.
const client = new speech.SpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_CLIENT_EMAIL?.split('@')[1]?.split('.')[0],
});

export async function POST(request: Request) {
  try {
    const { audioBase64, mimeType } = await request.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'Data audio tidak ditemukan' }, { status: 400 });
    }

    const audio = {
      content: audioBase64,
    };
    
    // Konfigurasi ini krusial. Karena kita menerima file dari web browser (MediaRecorder),
    // kita set WEBM_OPUS untuk Android/Chrome, atau biarkan Google mendeteksi dari header.
    // Untuk amannya, kita pass languageCode saja dan biarkan Google mendeteksi format.
    // Jika gagal, kita akan melakukan penyesuaian khusus WEBM_OPUS.
    const config = {
      languageCode: 'id-ID',
      // Jika diperlukan WEBM_OPUS di masa depan:
      // encoding: mimeType.includes('webm') ? 'WEBM_OPUS' : undefined,
    };

    const requestPayload = {
      audio: audio,
      config: config,
    };

    console.log("Mengirim permintaan ke Google Cloud Speech...");
    const [response] = await client.recognize(requestPayload);
    
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join(' ');

    console.log("Hasil Transkrip:", transcription);

    return NextResponse.json({ transcript: transcription || '' });
  } catch (error: any) {
    console.error('Speech-to-Text Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
