// Netlify Functionsのハンドラー関数
import { cityData, CityDataMap } from '../../src/cityData';

exports.handler = async (event, context) => {
    // クエリパラメータの取得
    
    // ST3OJE00-000577, ST3OJE00-000705 // API keyは同じ
  
    const pathSegments = event.path.split('/');
    const city = pathSegments[pathSegments.length - 1];

    const deviceId = cityData[city].deviceId;
    const externalApiUrl = `https://soratena.weathernews.jp/api/v1/data/latest?deviceId=${deviceId}`;
    const apiKey = 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi'; 
  
    try {
        const response = await fetch(externalApiUrl, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
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