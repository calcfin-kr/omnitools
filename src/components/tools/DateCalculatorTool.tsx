import React, { useState } from "react";
import { Calendar, Clock, Heart, Award, Sparkles } from "lucide-react";

export const DateCalculatorTool: React.FC = () => {
  const [tab, setTab] = useState<"dday" | "diff" | "age">("dday");

  // D-Day state
  const todayStr = new Date().toISOString().split("T")[0];
  const [targetDate, setTargetDate] = useState<string>("2026-12-31");
  const [eventName, setEventName] = useState<string>("올해의 마지막 날");

  // Date Diff state
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>("2026-10-01");

  // Age state
  const [birthDate, setBirthDate] = useState<string>("2000-01-01");

  // Compute D-Day
  const computeDDay = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return {
      diffDays,
      isToday: diffDays === 0,
      isFuture: diffDays > 0,
      label: diffDays === 0 ? "D-Day (오늘)" : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`,
    };
  };

  const ddayResult = computeDDay();

  // Compute Date Difference
  const computeDiff = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Business days (Mon-Fri)
    let businessDays = 0;
    const cur = new Date(Math.min(start.getTime(), end.getTime()));
    const finalDate = new Date(Math.max(start.getTime(), end.getTime()));
    while (cur <= finalDate) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDays++;
      cur.setDate(cur.getDate() + 1);
    }

    return {
      totalDays,
      weeks,
      remainingDays,
      businessDays,
      totalHours: totalDays * 24,
    };
  };

  const diffResult = computeDiff();

  // Compute Korean Age & Zodiac
  const computeAge = () => {
    const birth = new Date(birthDate);
    const today = new Date();

    // Official Korean Age (만 나이)
    let manAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      manAge--;
    }

    // Traditional year age (연 나이)
    const yearAge = today.getFullYear() - birth.getFullYear();

    // Chinese Zodiac (12간지)
    const zodiacs = ["원숭이", "닭", "개", "돼지", "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양"];
    const zodiac = zodiacs[birth.getFullYear() % 12];

    // Lived days
    const livedDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    return {
      manAge: Math.max(0, manAge),
      yearAge: Math.max(0, yearAge),
      zodiac,
      livedDays: Math.max(0, livedDays),
    };
  };

  const ageResult = computeAge();

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setTab("dday")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "dday" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>D-Day 카운트다운</span>
        </button>
        <button
          onClick={() => setTab("diff")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "diff" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>두 날짜 간격 계산</span>
        </button>
        <button
          onClick={() => setTab("age")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === "age" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>만 나이 & 띠 & 생애 일수</span>
        </button>
      </div>

      {tab === "dday" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">기념일 / 목표 이름</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="예: 수능, 시험, 여행, 결혼기념일"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">목표 날짜</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-slate-400 mb-1">{eventName || "목표일"}까지</span>
            <div className="text-4xl font-extrabold text-indigo-600 font-mono tracking-tight my-2">
              {ddayResult.label}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {ddayResult.isToday
                ? "바로 오늘입니다! 멋진 하루 보내세요!"
                : ddayResult.isFuture
                ? `남은 시간: 약 ${ddayResult.diffDays}일`
                : `지난 시간: ${Math.abs(ddayResult.diffDays)}일 경과`}
            </p>
          </div>
        </div>
      )}

      {tab === "diff" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">시작 날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">종료 날짜</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">총 일수</span>
              <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">
                {diffResult.totalDays}
                <span className="text-xs text-slate-500 ml-1 font-normal">일</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">영업일 (주말 제외)</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                {diffResult.businessDays}
                <span className="text-xs text-slate-500 ml-1 font-normal">일</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">주 + 남은 일</span>
              <div className="text-lg font-bold text-slate-800 font-mono mt-1">
                {diffResult.weeks}주 {diffResult.remainingDays}일
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">총 시간</span>
              <div className="text-lg font-bold text-slate-800 font-mono mt-1">
                {diffResult.totalHours.toLocaleString()}시간
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "age" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">생년월일 선택</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              2023년 6월 28일부터 대한민국 행정/민사 표준인 <strong>만 나이 통일법</strong> 기준 계산입니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">대한민국 표준 만 나이</span>
              <div className="text-3xl font-extrabold text-indigo-600 font-mono mt-1">
                {ageResult.manAge}
                <span className="text-sm text-slate-500 ml-1 font-normal">세</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
              <span className="text-xs text-slate-400">십이지 띠</span>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">
                {ageResult.zodiac}
                <span className="text-sm text-slate-500 ml-1 font-normal">띠</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center col-span-2">
              <span className="text-xs text-slate-400">지구에서 살아온 총 일수</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                {ageResult.livedDays.toLocaleString()}
                <span className="text-xs text-slate-500 ml-1 font-normal">일째</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
