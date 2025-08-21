// App.tsx 20250820

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

import { 
  Wind, 
  CloudRain, 
  Thermometer, 
  Sun, 
  RefreshCw, 
  AlertCircle,
  Clock,
  AlertTriangle,
  Shield,
  Zap
} from 'lucide-react';

interface WeatherData {
  averageWindSpeed: number;
  averageWindSpeed10min: number;
  rainIntensity10min: number;
  temperature: number;
  heatIndex: number;
  heatIndex10min: number;
}

interface AlertInfo {
  level: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

interface WeatherCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
  bgColor: string;
  borderColor: string;
  alert?: AlertInfo;
}

const getHeatIndexAlert = (temperature: number): AlertInfo => {
  if (temperature < 21) {
    return {
      level: 'ほぼ安全',
      message: 'ほぼ安全',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: <Shield className="h-8 w-8" />
    };
  } else if (temperature < 25) {
    return {
      level: '注意',
      message: '注意',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: <AlertCircle className="h-8 w-8" />
    };
  } else if (temperature < 28) {
    return {
      level: '警戒',
      message: '警戒',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: <AlertTriangle className="h-8 w-8" />
    };
  } else if (temperature < 31) {
    return {
      level: '厳重警戒',
      message: '厳重警戒',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      icon: <AlertTriangle className="h-8 w-8" />
    };
  } else {
    return {
      level: '危険',
      message: '危険',
      color: 'text-red-900',
      bgColor: 'bg-red-200',
      borderColor: 'border-red-500',
      icon: <Zap className="h-8 w-8" />
    };
  }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  colorClass, 
  bgColor,
  borderColor,
  alert
}) => (
  <div className={`relative overflow-hidden rounded-xl ${bgColor} ${borderColor} border-2 p-10 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-8">
      <div className={`p-6 rounded-full ${colorClass} bg-white shadow-md`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-8xl font-bold text-gray-800">
          {value !== null ? value.toFixed(1) : '--'}
        </div>
        <div className="text-3xl text-gray-600 font-medium mt-3">{unit}</div>
      </div>
    </div>
    <h3 className="text-5xl font-bold text-gray-700 mb-3 leading-tight">
      {title.includes('（10分') ? (
        <>
          {title.split('（')[0]}
          <br />
          <span className="text-4xl">（{title.split('（')[1]}</span>
        </>
      ) : (
        title
      )}
    </h3>
    
    {/* アラート表示 */}
    {alert && (
      <div className={`mt-6 p-6 rounded-lg ${alert.bgColor} ${alert.borderColor} border-2`}>
        <div className="flex items-center space-x-4">
          <div className={alert.color}>
            {alert.icon}
          </div>
          <span className={`text-4xl font-bold ${alert.color}`}>
            {alert.message}
          </span>
        </div>
      </div>
    )}
    
    <div className="absolute -bottom-2 -right-2 opacity-5">
      <div className="transform scale-150 text-gray-400">
        {icon}
      </div>
    </div>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const StatusIndicator: React.FC<{ 
  isLoading: boolean; 
  isError: boolean; 
  lastUpdated: Date | null 
}> = ({ isLoading, isError, lastUpdated }) => (
  <div className="flex items-center space-x-6 bg-white rounded-lg px-8 py-4 shadow-md border border-gray-200">
    <div className="flex items-center space-x-3">
      {isLoading ? (
        <RefreshCw className="h-7 w-7 text-blue-500 animate-spin" />
      ) : isError ? (
        <AlertCircle className="h-7 w-7 text-red-500" />
      ) : (
        <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
      )}
      <span className="text-lg font-medium text-gray-700">
        {isLoading ? '更新中...' : isError ? 'エラー' : 'オンライン'}
      </span>
    </div>
    {lastUpdated && (
      <div className="flex items-center space-x-2 text-lg text-gray-500">
        <Clock className="h-6 w-6" />
        <span>
          最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
        </span>
      </div>
    )}
  </div>
);

const WeatherDisplay = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // URLのパスパラメータを取得
  const { paramId } = useParams();

  // paramIdは、パスが /items/123 の場合にあ '123' になります
  console.log("paramI22d", paramId);
  
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

const App = () => {
  
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
    // ① アプリケーション全体を <BrowserRouter> で囲む
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WeatherDisplay />}/>
        <Route path="/:paramId" element={<WeatherDisplay />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;