// server.js (Node.jsのバックエンドファイル)
import express from 'express'; // require -> import
import fetch from 'node-fetch'; // require -> import
import cors from 'cors';       // require -> import


const app = express();
const PORT = 3001; // バックエンドサーバーのポート番号

// CORSを有効にする（フロントエンドからのリクエストを許可）
// これにより、http://localhost:5173 からのアクセスが可能になります
// app.use(cors({
//   origin: 'http://localhost:5173' // あなたのViteアプリのオリジン
// }));

app.use(express.json()); // JSONボディをパースするために必要

// 気象データAPIにアクセスするエンドポイント
app.get('/api/weather-data', async (req, res) => {
  const deviceId = 'ST3OJE00-000392';
  const externalApiUrl = `https://soratena.weathernews.jp/api/v1/data/latest?deviceId=${deviceId}`;
  const apiKey = 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi'; // バックエンドでAPIキーを使用

  try {
    console.log(`Calling external API: ${externalApiUrl}`);
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey, // APIキーをヘッダーに追加
        // ここではContent-Typeは必須ではないが、APIによって必要となる場合がある
      },
    });

    if (!response.ok) {
      // 外部APIからのエラーレスポンスをそのまま返す
      const errorText = await response.text();
      console.error(`External API error: ${response.status} - ${errorText}`);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data); // 取得したデータをフロントエンドに返す
  } catch (error) {
    console.error('Error fetching data from external API:', error);
    res.status(500).json({ message: 'Failed to fetch data from external API', error: error.message });
  }
});

// バックエンドサーバーを起動
app.listen(PORT, () => {
  console.log(`Backend server listening at http://localhost:${PORT}`);
});