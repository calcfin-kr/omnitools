import React, { useState } from "react";
import { Sparkles, Copy, Check, Regex, Play, RefreshCw, AlertCircle } from "lucide-react";

export const AiRegexTool: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("유효한 이메일 주소 형식인지 확인하는 정규표현식");
  const [pattern, setPattern] = useState<string>("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [flags, setFlags] = useState<string>("gm");
  const [testText, setTestText] = useState<string>(
    "user@example.com\ninvalid-email@\ntest.account@company.co.kr\nnot an email"
  );
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Common Presets
  const presets = [
    { name: "이메일", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", flags: "gm" },
    { name: "한국 휴대폰 번호", pattern: "^01[016789]-?\\d{3,4}-?\\d{4}$", flags: "gm" },
    { name: "날짜 (YYYY-MM-DD)", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", flags: "gm" },
    { name: "URL 주소", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "gi" },
    { name: "영문+숫자 8자 이상", pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$", flags: "gm" },
  ];

  const handleAiGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setAiExplanation("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regex",
          regexDesc: prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "정규식 생성 실패");

      setAiExplanation(data.result || "");

      // Try extract pattern from AI response
      const match = data.result.match(/\/([^/]+)\/([a-z]*)/);
      if (match) {
        setPattern(match[1]);
        if (match[2]) setFlags(match[2]);
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Evaluate matching
  const testResults = () => {
    try {
      const regex = new RegExp(pattern, flags);
      const lines = testText.split("\n");
      return lines.map((line) => {
        const isMatch = regex.test(line);
        return { line, isMatch };
      });
    } catch (err: any) {
      return null;
    }
  };

  const results = testResults();

  return (
    <div className="space-y-6">
      {/* AI Prompt Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI 자연어 정규식(Regex) 생성기</span>
          </label>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 8자 이상, 대문자와 특수문자가 최소 1개 포함된 비밀번호 패턴"
            className="flex-1 p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            onClick={handleAiGenerate}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>AI 생성</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1 items-center">
          <span className="text-[11px] text-slate-400">자주 쓰는 패턴:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
              }}
              className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Pattern Editor & Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Pattern & Test Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 block">정규표현식 패턴</span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400 font-bold text-base">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 p-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none"
              />
              <span className="text-slate-400 font-bold text-base">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-16 p-2 text-xs font-mono border border-slate-200 rounded-lg text-center"
                placeholder="flags"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-700 block">테스트 문자열 (줄 단위 검증)</span>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              rows={6}
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none"
              placeholder="매칭 테스트할 문자열을 여러 줄로 입력하세요..."
            />
          </div>
        </div>

        {/* Right: Live Matches & AI Explanation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-700 block mb-2">실시간 매칭 결과</span>

            {results === null ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600">
                올바르지 않은 정규식 구문입니다.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between border ${
                      r.isMatch
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 font-semibold"
                        : "bg-slate-50 border-slate-100 text-slate-400 line-through"
                    }`}
                  >
                    <span className="truncate pr-2">{r.line || "(빈 줄)"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 ${
                        r.isMatch ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {r.isMatch ? "일치 (Match)" : "불일치"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {aiExplanation && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-700 block mb-2">AI 정규식 상세 해설</span>
              <div className="text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-lg">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
