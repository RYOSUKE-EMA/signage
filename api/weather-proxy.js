export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const pathSegments = req.url.split('/');
  const location = pathSegments[pathSegments.length - 1];

  const locationData = {
    hamako: { displayName: '浜松工業高等学校', deviceId: 'ST3OJE00-000392' },
    merck:  { displayName: 'メルクエレクトロニクス', deviceId: 'ST3OJE00-000577' },
    hamazoo: { displayName: '浜松市動物園', deviceId: 'ST3OJE00-000705' },
    mikumi: { displayName: '三組倉庫', deviceId: 'ST3OJE00-000984' },
  };

  const locationInfo = locationData[location];

  if (!locationInfo || locationInfo.deviceId === 'unknown') {
    return res.status(404).json({ message: 'Location not found' });
  }

  const externalApiUrl = `https://soratena.weathernews.jp/api/v1/data/latest?deviceId=${locationInfo.deviceId}`;
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