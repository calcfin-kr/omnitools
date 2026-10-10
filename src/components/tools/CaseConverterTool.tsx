import React, { useState } from "react";
import { Copy, Check, ArrowRightLeft, Sparkles, RefreshCw } from "lucide-react";

export const CaseConverterTool: React.FC = () => {
  const [input, setInput] = useState<string>("hello world example text for conversion");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Conversion helpers
  const words = input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const conversions = [
    {
      id: "camel",
      name: "camelCase",
      desc: "자바스크립트 변수, 함수명",
      value: words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join(""),
    },
    {
      id: "snake",
      name: "snake_case",
      desc: "파이썬 변수, 데이터베이스 컬럼",
      value: words.map((w) => w.toLowerCase()).join("_"),
    },
    {
      id: "kebab",
      name: "kebab-case",
      desc: "CSS 클래스명, URL 슬러그",
      value: words.map((w) => w.toLowerCase()).join("-"),
    },
    {
      id: "pascal",
      name: "PascalCase",
      desc: "클래스명, 리액트 컴포넌트",
      value: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""),
    },
    {
      id: "constant",
      name: "CONSTANT_CASE",
      desc: "상수 정의, 환경 변수",
      value: words.map((w) => w.toUpperCase()).join("_"),
    },
    {
      id: "title",
      name: "Title Case",
      desc: "도서/글 제목 스타일",
      value: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
    },
    {
      id: "upper",
      name: "UPPERCASE",
      desc: "전체 대문자",
      value: input.toUpperCase(),
    },
    {
      id: "lower",
      name: "lowercase",
      desc: "전체 소문자",
      value: input.toLowerCase(),
    },
    {
      id: "reverse",
      name: "문자열 뒤집기 (Reverse)",
      desc: "글자 순서를 역순으로 정렬",
      value: Array.from(input).reverse().join(""),
    },
  ];

  const copyToClipboard = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          변환할 원본 문자열 입력
        </label>
        <textarea
          id="case-converter-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="변환할 텍스트나 변수명을 입력하세요..."
          className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-slate-400 self-center">빠른 예시:</span>
          {["user_profile_service", "getUserDataById", "super-fast-cache", "API_AUTH_TOKEN"].map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conversions.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-indigo-200 transition-colors shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-xs font-bold text-slate-900 font-mono">{item.name}</span>
                <span className="text-[11px] text-slate-400 ml-2">{item.desc}</span>
              </div>
              <button
                id={`copy-${item.id}-btn`}
                onClick={() => copyToClipboard(item.value, item.id)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>복사</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 font-mono text-xs text-slate-800 break-all select-all">
              {item.value || <span className="text-slate-400 italic">결과 없음</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
