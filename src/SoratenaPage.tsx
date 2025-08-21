import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

export const SoratenaPage = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // URLのパスパラメータを取得
  const { paramId } = useParams();

  // paramIdは、パスが /items/123 の場合にあ '123' になります
  console.log(paramId);
  
  const fetchWeatherData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

// 1. ベースURLを定義
     const url = '/.netlify/functions/weather-proxy';
    
    const response = await fetch(url, {
       method: 'GET',
       headers: {
         'X-API-Key': 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi',
         'Content-Type': 'application/json',
       }
     });


      // // 開発環境でのみAPI-Keyを追加
      // if (!isProduction) {
      //   headers['X-API-Key'] = 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi';
      // }
     

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      const responseData = await response.json();
      
      // レスポンス構造を確認してデータを取得
      const data = responseData.data || responseData;
      
      console.log('Received data:', data); // デバッグ用

      // データの構造に応じて適切にマッピング
      const mappedData: WeatherData = {
        averageWindSpeed: typeof data.v === 'number' ? data.v : 0,
        averageWindSpeed10min: typeof data.v10m === 'number' ? data.v10m : 0,
        rainIntensity10min: typeof data.rf10m === 'number' ? data.rf10m : 0,
        temperature: typeof data.t === 'number' ? data.t : 0,
        heatIndex: typeof data.wbgt === 'number' ? data.wbgt : 0,
        heatIndex10min: typeof data.wbgt10m === 'number' ? data.wbgt10m : 0
      };

      setWeatherData(mappedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('データ取得エラー:', error);
      setIsError(true);
      
      // エラー時は既存のデータを保持（初回エラーの場合はnullのまま）
      if (!weatherData) {
        // 初回取得でエラーの場合のみデモデータを表示
        setWeatherData({
          averageWindSpeed: 2.5,
          averageWindSpeed10min: 2.3,
          rainIntensity10min: 0,
          temperature: 25.2,
          heatIndex: 24.8,
          heatIndex10min: 24.9
        });
      }
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初回データ取得
    fetchWeatherData();

    // 60秒間隔でデータを更新
    const interval = setInterval(fetchWeatherData, 60000);

    return () => clearInterval(interval);
  }, [fetchWeatherData]);

const WeatherDisplay = () => {
  <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-gray-800 mb-4">
            気象データ
          </h1>
          <p className="text-gray-600 text-3xl">
            60秒間隔で自動更新
          </p>
        </div>

        {/* ステータス表示 */}
        <div className="flex justify-center mb-12">
          <StatusIndicator 
            isLoading={isLoading}
            isError={isError}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* データカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {weatherCards.map((card, index) => (
            <WeatherCard
              key={index}
              title={card.title}
              value={card.value}
              unit={card.unit}
              icon={card.icon}
              colorClass={card.colorClass}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
              alert={card.alert}
            />
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">
            データ提供: Weathernews Inc.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Chromium Version 69対応
          </p>
        </div>
      </div>
    </div>
  }

  const weatherCards = [
    {
      title: '平均風速',
      value: weatherData?.averageWindSpeed || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: '平均風速（10分）',
      value: weatherData?.averageWindSpeed10min || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    {
      title: '雨量強度（10分）',
      value: weatherData?.rainIntensity10min || null,
      unit: 'mm/h',
      icon: <CloudRain className="h-10 w-10" />,
      colorClass: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: '気温',
      value: weatherData?.temperature || null,
      unit: '°C',
      icon: <Thermometer className="h-10 w-10" />,
      colorClass: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: '暑さ指数',
      value: weatherData?.heatIndex || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      alert: weatherData?.heatIndex ? getHeatIndexAlert(weatherData.heatIndex) : undefined
    },
    {
      title: '暑さ指数（10分平均）',
      value: weatherData?.heatIndex10min || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      alert: weatherData?.heatIndex10min ? getHeatIndexAlert(weatherData.heatIndex10min) : undefined
    }
  ];

    return (
    // ✅ ここに表示したいHTMLを返します
    <div className="min-h-screen bg-white p-8">
      {/*... 元のコードの表示部分をペースト ...*/}
      <StatusIndicator 
        isLoading={isLoading} // これでエラーはなくなります
        isError={isError}
        lastUpdated={lastUpdated}
      />
      {/* ... */}
    </div>
  );
};