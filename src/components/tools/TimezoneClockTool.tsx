import React, { useState, useEffect } from "react";
import { Globe2, Clock, Sun, Moon } from "lucide-react";

interface CityTimezone {
  name: string;
  country: string;
  tz: string;
  flag: string;
}

export const TimezoneClockTool: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0); // 0 = current time

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cities: CityTimezone[] = [
    { name: "서울 (Seoul)", country: "대한민국", tz: "Asia/Seoul", flag: "🇰🇷" },
    { name: "도쿄 (Tokyo)", country: "일본", tz: "Asia/Tokyo", flag: "🇯🇵" },
    { name: "뉴욕 (New York)", country: "미국 (동부)", tz: "America/New_York", flag: "🇺🇸" },
    { name: "샌프란시스코 (SF)", country: "미국 (서부)", tz: "America/Los_Angeles", flag: "🇺🇸" },
    { name: "런던 (London)", country: "영국", tz: "Europe/London", flag: "🇬🇧" },
    { name: "파리 (Paris)", country: "프랑스", tz: "Europe/Paris", flag: "🇫🇷" },
    { name: "시드니 (Sydney)", country: "호주", tz: "Australia/Sydney", flag: "🇦🇺" },
    { name: "싱가포르 (Singapore)", country: "싱가포르", tz: "Asia/Singapore", flag: "🇸🇬" },
  ];

  const simulatedDate = new Date(now.getTime() + selectedHourOffset * 3600 * 1000);

  const formatCityTime = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: selectedHourOffset === 0 ? "2-digit" : undefined,
        hour12: true,
      });
      const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: tz,
        month: "long",
        day: "numeric",
        weekday: "short",
      });
      const hour24 = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hour: "numeric",
          hour12: false,
        }).format(simulatedDate)
      );

      const isDaytime = hour24 >= 6 && hour24 < 18;

      return {
        time: formatter.format(simulatedDate),
        date: dateFormatter.format(simulatedDate),
        isDaytime,
      };
    } catch {
      return { time: "--:--", date: "", isDaytime: true };
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Shift Slider for Meeting Scheduling */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>시간 시뮬레이터 (국제 회의/협업 시차 비교)</span>
          </div>
          {selectedHourOffset !== 0 ? (
            <button
              onClick={() => setSelectedHourOffset(0)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              실시간 현재 시각으로 리셋
            </button>
          ) : (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              실시간 동기화 중
            </span>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>-12시간</span>
            <span className="font-semibold text-slate-800 font-mono">
              {selectedHourOffset === 0 ? "현재 시각 기준" : `${selectedHourOffset > 0 ? "+" : ""}${selectedHourOffset}시간 이동`}
            </span>
            <span>+12시간</span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={selectedHourOffset}
            onChange={(e) => setSelectedHourOffset(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Grid of Cities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cities.map((city) => {
          const info = formatCityTime(city.tz);
          return (
            <div
              key={city.tz}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{city.flag}</span>
                  <span className="text-xs font-bold text-slate-800 truncate">{city.name}</span>
                </div>
                {info.isDaytime ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
              </div>

              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {info.time}
              </div>

              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{info.date}</span>
                <span>{city.country}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
