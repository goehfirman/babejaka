"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function gradeEssayAction(
  storyText: string,
  question: string,
  studentAnswer: string,
  referenceAnswer: string
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Jika API KEY belum dipasang, kembalikan pesan error yang real
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables. Harap atur API Key terlebih dahulu.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Menggunakan gemini-2.5-flash sesuai instruksi
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

    const prompt = `Anda adalah seorang guru SD yang sangat ramah, hangat, dan selalu menyemangati murid-murid. 
Evaluasi jawaban murid berikut untuk menguji tes pemahaman membaca (reading comprehension).
    
Teks Cerita:
"${storyText}"

Pertanyaan: 
"${question}"

Jawaban Referensi (Kunci Jawaban Inti yang Diharapkan): 
"${referenceAnswer}"

Jawaban Murid: 
"${studentAnswer}"

Instruksi Penilaian:
1. Evaluasi apakah arti dari jawaban murid menunjukkan pemahaman terhadap ide pokok dari kunci jawaban (tidak harus sama persis kata-katanya). Toleransi kesalahan tata bahasa atau ejaan karena ini anak-anak.
2. Jika jawaban memiliki ide sama, berikan skor 80-100.
3. Jika anak hanya menjawab sebagian saja dengan kata kunci yang relevan, berikan skor parsial (misal 50 - 70).
4. Jika jawabannya tidak relevan sama sekali, berikan skor 0 - 30.
5. Berikan "feedback" dalam bahasa Indonesia khusus anak-anak yang memotivasi dan seru. Jangan galak. Jika salah arahkan ke teks dengan halus. Jika benar, berikan pujian layaknya guru memberi stiker bintang.
6. Anda WAJIB mengembalikan balasan HANYA dalam bentuk JSON persis seperti skema di bawah ini, tanpa awalan markdown \`\`\`json.

Skema JSON:
{
  "score": <angka_dari_0_sampai_100>,
  "feedback": "<kalimat_komentar_anda>"
}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();
    // Sanitasi markdown seandainya model mengabaikan prompt 'tanpa markdown'
    output = output.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(output);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score) || 0,
        feedback: parsed.feedback || "Terima kasih sudah menjawab!",
      };
    } catch (parseErr: any) {
       console.error("Gagal parse keluaran model berformat JSON: ", output);
       throw new Error(`Gagal memproses respons dari AI. Output tidak valid JSON: ${output.substring(0, 50)}...`);
    }
    
  } catch (error: any) {
    console.error("Error grading essay with Gemini:", error);
    return {
      score: 0,
      feedback: `Terjadi error pada sistem AI: ${error?.message || "Unknown error occurred"}.`,
    };
  }
}
