import React, { useState } from "react";
import { Copy, Check, Trash2, ArrowDownAZ, ArrowUpZA, ListOrdered, Sparkles, Filter } from "lucide-react";

export const TextCleanSortTool: React.FC = () => {
  const [text, setText] = useState<string>(
`바나나
사과
포도
딸기
바나나
수박

오렌지
사과
키위`
  );
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [copied, setCopied] = useState(false);

  const getLines = () => text.split(/\r\n|\r|\n/);

  const handleRemoveDuplicates = () => {
    const lines = getLines();
    const unique = Array.from(new Set(lines));
    setText(unique.join("\n"));
  };

  const handleRemoveEmpty = () => {
    const lines = getLines().filter((l) => l.trim().length > 0);
    setText(lines.join("\n"));
  };

  const handleTrim = () => {
    const lines = getLines().map((l) => l.trim());
    setText(lines.join("\n"));
  };

  const handleSortAsc = () => {
    const lines = getLines().sort((a, b) => a.localeCompare(b, "ko-KR"));
    setText(lines.join("\n"));
  };

  const handleSortDesc = () => {
    const lines = getLines().sort((a, b) => b.localeCompare(a, "ko-KR"));
    setText(lines.join("\n"));
  };

  const handleSortLength = () => {
    const lines = getLines().sort((a, b) => a.length - b.length);
    setText(lines.join("\n"));
  };

  const handleReverse = () => {
    const lines = getLines().reverse();
    setText(lines.join("\n"));
  };

  const handleAddNumbering = () => {
    const lines = getLines().map((l, idx) => `${idx + 1}. ${l}`);
    setText(lines.join("\n"));
  };

  const handleApplyAffix = () => {
    const lines = getLines().map((l) => `${prefix}${l}${suffix}`);
    setText(lines.join("\n"));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Quick Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <span className="text-xs font-semibold text-slate-700 block">원클릭 정리 & 정렬 도구</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRemoveDuplicates}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>중복 행 제거</span>
          </button>
          <button
            onClick={handleRemoveEmpty}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            빈 줄(공백행) 제거
          </button>
          <button
            onClick={handleTrim}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            앞뒤 공백 트림(Trim)
          </button>
          <button
            onClick={handleSortAsc}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-blue-600" />
            <span>가나다/A-Z 오름차순</span>
          </button>
          <button
            onClick={handleSortDesc}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowUpZA className="w-3.5 h-3.5 text-blue-600" />
            <span>내림차순 정렬</span>
          </button>
          <button
            onClick={handleSortLength}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            글자 길이순
          </button>
          <button
            onClick={handleReverse}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
          >
            행 순서 뒤집기
          </button>
          <button
            onClick={handleAddNumbering}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ListOrdered className="w-3.5 h-3.5 text-purple-600" />
            <span>줄 번호(1. 2. 3.) 매기기</span>
          </button>
        </div>

        {/* Prefix / Suffix */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">일괄 추가:</span>
          <input
            type="text"
            placeholder="접두사 (예: - 또는 [ )"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
          />
          <input
            type="text"
            placeholder="접미사 (예: , 또는 ] )"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
          />
          <button
            onClick={handleApplyAffix}
            className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-600">
            결과 텍스트 (총 {getLines().length}행)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "복사됨" : "전체 복사"}</span>
            </button>
            <button
              onClick={() => setText("")}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="비우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <textarea
          id="text-clean-sort-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full p-4 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none resize-y"
          placeholder="텍스트를 줄 단위로 입력하세요..."
        />
      </div>
    </div>
  );
};
