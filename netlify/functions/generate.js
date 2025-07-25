// Mengimpor 'node-fetch' untuk melakukan panggilan API di lingkungan Node.js
const fetch = require('node-fetch');

// Fungsi utama yang akan dijalankan oleh Netlify
exports.handler = async function(event, context) {
  // Hanya izinkan permintaan dengan metode POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Hanya metode POST yang diizinkan.' }),
    };
  }

  try {
    // Mengurai data yang dikirim dari frontend
    const { prompt, apiKey } = JSON.parse(event.body);

    // Validasi input: pastikan prompt dan apiKey ada
    if (!prompt || !apiKey) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ error: 'Prompt atau apiKey tidak ditemukan.' }),
      };
    }
    
    // Menggunakan kunci API yang diberikan oleh pengguna dari frontend
    const GOOGLE_API_KEY = apiKey;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_API_KEY}`;

    // Mempersiapkan payload untuk dikirim ke Google AI
    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    // Melakukan panggilan ke API Google AI
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    // Jika respons dari Google tidak berhasil, kirimkan kembali errornya
    if (!response.ok) {
        console.error('Google AI API Error:', responseData);
         return {
            statusCode: response.status,
            body: JSON.stringify({ error: responseData?.error?.message || 'Gagal mengambil data dari Google AI API' }),
        };
    }

    // Jika berhasil, kirimkan kembali data dari Google ke frontend
    return {
      statusCode: 200, // OK
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    // Tangani error tak terduga
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ error: 'Terjadi kesalahan internal pada server.' }),
    };
  }
};
