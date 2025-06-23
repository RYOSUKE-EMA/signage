// netlify/functions/weather-proxy.js
// Netlify FunctionsはデフォルトでNode.jsランタイムなので、CommonJS構文を使用します
// ES Modulesを使いたい場合は、package.jsonで "type": "module" を設定するか、
// ファイル名を .mjs に変更する必要があります。ここではCommonJSで記述します。

import fetch from 'node-fetch'; // Netlify Functionsのランタイムにはnode-fetchが組み込まれていますが、
                                    // 必要に応じてpackage.jsonに依存関係を追加することもできます。

// Netlify Functionsのハンドラー関数
exports.handler = async (event, context) => {
    // クエリパラメータの取得
    const deviceId = 'ST3OJE00-000392';
    const externalApiUrl = `https://soratena.weathernews.jp/api/v1/data/latest?deviceId=${deviceId}`;

    // ★重要: APIキーは環境変数としてNetlifyに設定することをお勧めします★
    // Netlify UI (Site settings -> Build & deploy -> Environment variables) で設定
    const apiKey = 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi'; 

    try {
        console.log(`Calling external API: ${externalApiUrl}`);
        const response = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
                // Refererヘッダーが必要な場合は、ここに追加
                // 'Referer': 'https://soratena.weathernews.jp/' 
            },
        });

        // 外部APIからのHTTPステータスコードをそのまま返す
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`External API error: ${response.status} - ${errorText}`);
            return {
                statusCode: response.status,
                body: errorText,
                headers: {
                    'Content-Type': 'text/plain', // エラー時はプレーンテキストとして返す
                    'Access-Control-Allow-Origin': '*' // フロントエンドからのアクセスを許可
                }
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // ★CORSポリシーをここで設定★
                                                   // 本番ドメインが決まっていれば、具体的なドメインを設定
                                                   // 例: 'Access-Control-Allow-Origin': 'https://your-app.netlify.app'
            },
        };
    } catch (error) {
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};