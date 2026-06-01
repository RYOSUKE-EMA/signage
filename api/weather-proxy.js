import { locationData } from '../../src/locationData.ts';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const pathSegments = req.url.split('/');
  const location = pathSegments[pathSegments.length - 1];
  const deviceId = locationData[location].deviceId;
  const externalApiUrl = `https://soratena.weathernews.jp/api/v1/data/latest?deviceId=${deviceId}`;
  const apiKey = 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi';

  try {
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}