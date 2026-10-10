import React, { useState } from "react";
import { Copy, Check, Trash2, CheckCircle2, AlertCircle, FileCode, Minimize2, Maximize2, ArrowDownAZ } from "lucide-react";

export const JsonFormatterTool: React.FC = () => {
  const sampleJson = JSON.stringify(
    {
      appName: "OmniTools",
      version: "2.5.0",
      features: ["text-counter", "json-formatter", "qr-studio", "color-picker"],
      settings: {
        theme: "system",
        notifications: true,
        maxHistory: 50,
      },
      stats: {
        activeUsers: 14200,
        rating: 4.95,
      },
    },
    null,
    2
  );

  const [input, setInput] = useState<string>(sampleJson);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validateAndFormat = (indent: number | string = 2, sortKeys = false) => {
    try {
      if (!input.trim()) {
        setError(null);
        return;
      }
      let parsed = JSON.parse(input);

      if (sortKeys && typeof parsed === "object" && parsed !== null) {
        parsed = sortObjectKeys(parsed);
      }

      const formatted = indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      setInput(formatted);
      setError(null);
    } catch (err: any) {
      setError(err.message || "유효하지 않은 JSON 형식입니다.");
    }
  };

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        }, {});
    }
    return obj;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getStats = () => {
    try {
      const parsed = JSON.parse(input);
      const isArr = Array.isArray(parsed);
      const keys = isArr ? parsed.length : Object.keys(parsed || {}).length;
      const byteSize = new Blob([input]).size;
      return { valid: true, count: keys, isArray: isArr, bytes: byteSize };
    } catch {
      return { valid: false, count: 0, isArray: false, bytes: 0 };
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => validateAndFormat(2)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>포맷팅 (2칸)</span>
          </button>
          <button
            onClick={() => validateAndFormat(4)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            포맷팅 (4칸)
          </button>
          <button
            onClick={() => validateAndFormat(0)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>압축 (Minify)</span>
          </button>
          <button
            onClick={() => validateAndFormat(2, true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-blue-600" />
            <span>키 알파벳 정렬</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-json-btn"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "복사됨" : "전체 복사"}</span>
          </button>
          <button
            onClick={() => {
              setInput("");
              setError(null);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            title="비우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation status bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          {error ? (
            <div className="flex items-center gap-1.5 text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          ) : stats.valid ? (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>유효한 JSON 문서입니다 ({stats.isArray ? "배열 요소" : "최상위 키"} {stats.count}개)</span>
            </div>
          ) : (
            <span className="text-slate-400">JSON을 입력하세요</span>
          )}
        </div>
        {stats.valid && (
          <span className="text-slate-500 font-mono text-[11px]">{stats.bytes.toLocaleString()} 바이트</span>
        )}
      </div>

      {/* Text Area */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
        <div className="px-4 py-2 bg-slate-950 text-slate-400 text-xs font-mono flex items-center justify-between">
          <span>JSON Editor</span>
          <button
            onClick={() => {
              setInput(sampleJson);
              setError(null);
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
          >
            샘플 JSON 불러오기
          </button>
        </div>
        <textarea
          id="json-editor-textarea"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              if (e.target.value.trim()) JSON.parse(e.target.value);
              setError(null);
            } catch (err: any) {
              setError(err.message);
            }
          }}
          rows={16}
          className="w-full p-4 font-mono text-xs text-emerald-400 bg-slate-900 focus:outline-none resize-y leading-relaxed"
          placeholder="JSON 코드를 입력하세요..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};
