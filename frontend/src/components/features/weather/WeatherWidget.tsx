import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
} from "lucide-react";

export const WeatherWidget = () => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(
    {
      latitude: -34.6037, // Default: Buenos Aires
      longitude: -58.3816,
    },
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });
        },
        (e: any) => {
          console.log("Geolocalización fallida", e);
        },
      );
    }
  }, []);

  const backgroundCodes: { [key: number]: string } = {
    0: "https://i.pinimg.com/1200x/fe/3e/2a/fe3e2a732108469ecf7fabd9b9dc69c3.jpg", // Despejado día
    1: "https://i.pinimg.com/736x/a2/8a/16/a28a16584b3bdc606ae6cd7c959dba4f.jpg", // Despejado noche
    2: "https://i.pinimg.com/1200x/93/12/79/931279e77480a9dee2c362808fa3e1d2.jpg", // Parcialmente nublado
    3: "https://i.pinimg.com/1200x/85/e4/e1/85e4e100758ada1ea5da7ef67396e34c.jpg", // Niebla
    4: "https://i.pinimg.com/1200x/2c/32/26/2c3226c57346ed58bf5313aa6cd4203a.jpg", // Lluvia
    5: "https://i.pinimg.com/736x/e0/9b/48/e09b48f2f4df9dc658f4a60187475c63.jpg", // Nieve
    6: "https://i.pinimg.com/736x/6f/2f/96/6f2f96530d1efdb3a82679643cca77c6.jpg", // Tormenta
  };

  const weatherConfig = [
    {
      condition: (code: number) => code === 0,
      label: "Despejado",
      backgrounds: { day: backgroundCodes[0], night: backgroundCodes[1] },
      icons: {
        day: <Sun size={20} className="text-white" />,
        night: <Moon size={16} className="text-white" />,
      },
    },
    {
      condition: (code: number) => code <= 3,
      label: "Parcialmente nublado",
      backgrounds: { day: backgroundCodes[2], night: backgroundCodes[2] },
      icons: {
        day: <CloudSun size={20} className="text-white" />,
        night: <CloudMoon size={20} className="text-white" />,
      },
    },
    {
      condition: (code: number) => code <= 48,
      label: "Niebla",
      backgrounds: { day: backgroundCodes[3], night: backgroundCodes[3] },
      icons: {
        day: <Cloud size={20} className="text-white" />,
        night: <CloudMoon size={20} className="text-white" />,
      },
    },
    {
      condition: (code: number) => code <= 67,
      label: "Lluvia",
      backgrounds: { day: backgroundCodes[4], night: backgroundCodes[4] },
      icons: {
        day: <CloudDrizzle size={20} className="text-white" />,
        night: <CloudRain size={20} className="text-white" />,
      },
    },
    {
      condition: (code: number) => code <= 77,
      label: "Nieve",
      backgrounds: { day: backgroundCodes[5], night: backgroundCodes[5] },
      icons: {
        day: <Snowflake size={20} className="text-white" />,
        night: <Snowflake size={20} className="text-white" />,
      },
    },
    {
      condition: (code: number) => code <= 99,
      label: "Tormenta",
      backgrounds: { day: backgroundCodes[6], night: backgroundCodes[6] },
      icons: {
        day: <CloudLightning size={20} className="text-white" />,
        night: <CloudLightning size={20} className="text-white" />,
      },
    },
  ];

  function getWeatherInfo(code: number) {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;

    const config = weatherConfig.find((c) => c.condition(code));

    if (!config) {
      return {
        label: "Clima desconocido",
        background: backgroundCodes[0],
        icon: null,
      };
    }
    return {
      label: config.label,
      background: isNight ? config.backgrounds.night : config.backgrounds.day,
      icon: isNight ? config.icons.night : config.icons.day,
    };
  }

  const { data: weather } = useQuery({
    queryKey: ["weather", coords.latitude, coords.longitude],
    queryFn: async () => {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`,
      );
      const json = response.data;
      return {
        temperature: json.current_weather.temperature,
        weatherCode: json.current_weather.weathercode,
      };
    },
    enabled: true,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  if (!weather) return null;

  const { label, background, icon } = getWeatherInfo(weather.weatherCode);

  return (
    <div
      className={`relative w-full flex flex-col justify-center overflow-hidden border border-gray-300 py-2`}
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Content */}
      <div className="relative z-10 px-5 gap-y-3  flex flex-row justify-between h-full">
        <div className="flex flex-row items-center gap-x-2">
          {icon}
          <span className="font-bold text-white text-sm">{label}</span>
        </div>

        <span className="text-white font-extrabold text-3xl leading-none">
          {weather.temperature}°
        </span>
      </div>
    </div>
  );
};

export default WeatherWidget;
