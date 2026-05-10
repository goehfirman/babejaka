import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audioBase64, mimeType } = await request.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'Data audio tidak ditemukan' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Konfigurasi GOOGLE_API_KEY tidak ditemukan di server.' }, { status: 500 });
    }

    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

    const requestPayload = {
      config: {
        languageCode: 'id-ID',
      },
      audio: {
        content: audioBase64,
      },
    };

    console.log("Mengirim permintaan ke Google Cloud Speech (REST API)...");
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      throw new Error(data.error?.message || 'Terjadi kesalahan dari Google Speech API');
    }

    const transcription = data.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .join(' ');

    console.log("Hasil Transkrip:", transcription);

    return NextResponse.json({ transcript: transcription || '' });
  } catch (error: any) {
    console.error('Speech-to-Text Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

