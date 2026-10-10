import React, { useState, useMemo } from "react";
import { Copy, Check, Trash2, FileText, Sparkles, BookOpen } from "lucide-react";

export const TextCounterTool: React.FC = () => {
  const [text, setText] = useState<string>(
    "안녕하세요! OmniTools에 오신 것을 환영합니다.\n이 도구는 자기소개서, 블로그 글, 문서 작성 시 필요한 글자 수와 바이트, 원고지 분량을 실시간으로 분석합니다."
  );
  const [copied, setCopied] = useState(false);

  // Metrics computation
  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, "").length;
    
    // Words
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    
    // Lines
    const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;

    // Hangul syllables
    const hangul = (text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g) || []).length;
    
    // Alphabets
    const alphabets = (text.match(/[a-zA-Z]/g) || []).length;
    
    // Numbers
    const numbers = (text.match(/[0-9]/g) || []).length;
    
    // Spaces
    const spaces = (text.match(/\s/g) || []).length;

    // Bytes UTF-8
    let utf8Bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code <= 0x7f) utf8Bytes += 1;
      else if (code <= 0x7ff) utf8Bytes += 2;
      else if (code >= 0xd800 && code <= 0xdbff) {
        utf8Bytes += 4;
        i++; // Surrogate pair
      } else utf8Bytes += 3;
    }

    // Bytes EUC-KR (Common in Korean corporate portals like Saramin, JobKorea, Incruit)
    let euckrBytes = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code <= 0x7f) euckrBytes += 1;
      else euckrBytes += 2; // Korean characters treated as 2 bytes
    }

    // 200-character manuscript paper sheets (200자 원고지)
    const manuscriptSheets = Math.ceil(charsWithSpaces / 200) || 0;

    // Reading time: avg 350 chars/min silent, 250 chars/min speaking
    const readingTimeSec = Math.round((charsWithoutSpaces / 350) * 60);
    const speakingTimeSec = Math.round((charsWithoutSpaces / 250) * 60);

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      words,
      lines,
      hangul,
      alphabets,
      numbers,
      spaces,
      utf8Bytes,
      euckrBytes,
      manuscriptSheets,
      readingTimeSec,
      speakingTimeSec,
    };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => setText("");

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">공백 포함 글자수</span>
          <div className="mt-1 text-2xl font-bold text-indigo-600 font-mono">
            {stats.charsWithSpaces.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">자</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">공백 제외 글자수</span>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono">
            {stats.charsWithoutSpaces.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">자</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">바이트 (EUC-KR 기준)</span>
          <div className="mt-1 text-2xl font-bold text-amber-600 font-mono">
            {stats.euckrBytes.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">Byte</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">자소서/포털 사이트 표준</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">바이트 (UTF-8 기준)</span>
          <div className="mt-1 text-2xl font-bold text-emerald-600 font-mono">
            {stats.utf8Bytes.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">Byte</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">웹/데이터베이스 표준</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>분석할 텍스트 입력</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="copy-text-counter-btn"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "복사됨" : "전체 복사"}</span>
            </button>
            <button
              id="clear-text-counter-btn"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>지우기</span>
            </button>
          </div>
        </div>

        <textarea
          id="text-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 텍스트를 입력하거나 붙여넣으세요..."
          className="w-full h-64 p-4 text-slate-800 text-sm leading-relaxed focus:outline-none resize-y font-sans"
        />
      </div>

      {/* Detailed statistics breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">단어 수</div>
          <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{stats.words}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">줄(행) 수</div>
          <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{stats.lines}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">한글 문자수</div>
          <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{stats.hangul}</div>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">영문자 / 숫자</div>
          <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">
            {stats.alphabets} / {stats.numbers}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">원고지 (200자)</div>
          <div className="text-lg font-bold text-indigo-600 font-mono mt-0.5">
            {stats.manuscriptSheets}
            <span className="text-xs font-normal text-slate-500 ml-0.5">매</span>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500">예상 소요 시간</div>
          <div className="text-xs font-medium text-slate-700 mt-1">
            읽기: 약 {Math.max(1, Math.round(stats.readingTimeSec / 60))}분
          </div>
        </div>
      </div>
    </div>
  );
};
