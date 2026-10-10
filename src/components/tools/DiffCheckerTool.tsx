import React, { useState, useMemo } from "react";
import { GitCompare, Columns, AlignJustify, Trash2 } from "lucide-react";

export const DiffCheckerTool: React.FC = () => {
  const [original, setOriginal] = useState<string>(
`// 원본 코드 예시
function calculateTotal(price, quantity) {
  const subtotal = price * quantity;
  return subtotal;
}`
  );

  const [modified, setModified] = useState<string>(
`// 수정본 코드 예시
function calculateTotal(price, quantity, taxRate = 0.1) {
  const subtotal = price * quantity;
  const tax = subtotal * taxRate;
  return subtotal + tax;
}`
  );

  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  // Simple LCS-based line diff algorithm
  const diffLines = useMemo(() => {
    const origLines = original.split("\n");
    const modLines = modified.split("\n");

    const maxLen = Math.max(origLines.length, modLines.length);
    const result: {
      type: "same" | "add" | "del" | "change";
      leftText?: string;
      rightText?: string;
      leftNum?: number;
      rightNum?: number;
    }[] = [];

    // Simple line diff matcher
    let i = 0, j = 0;
    while (i < origLines.length || j < modLines.length) {
      if (i < origLines.length && j < modLines.length) {
        if (origLines[i] === modLines[j]) {
          result.push({
            type: "same",
            leftText: origLines[i],
            rightText: modLines[j],
            leftNum: i + 1,
            rightNum: j + 1,
          });
          i++;
          j++;
        } else {
          // Check if mod line exists further down in orig
          const nextInOrig = origLines.indexOf(modLines[j], i);
          const nextInMod = modLines.indexOf(origLines[i], j);

          if (nextInOrig !== -1 && (nextInMod === -1 || nextInOrig - i < nextInMod - j)) {
            // Deleted lines in original
            result.push({
              type: "del",
              leftText: origLines[i],
              rightText: "",
              leftNum: i + 1,
            });
            i++;
          } else if (nextInMod !== -1) {
            // Added lines in modified
            result.push({
              type: "add",
              leftText: "",
              rightText: modLines[j],
              rightNum: j + 1,
            });
            j++;
          } else {
            // Modified
            result.push({
              type: "change",
              leftText: origLines[i],
              rightText: modLines[j],
              leftNum: i + 1,
              rightNum: j + 1,
            });
            i++;
            j++;
          }
        }
      } else if (i < origLines.length) {
        result.push({
          type: "del",
          leftText: origLines[i],
          rightText: "",
          leftNum: i + 1,
        });
        i++;
      } else {
        result.push({
          type: "add",
          leftText: "",
          rightText: modLines[j],
          rightNum: j + 1,
        });
        j++;
      }
    }

    return result;
  }, [original, modified]);

  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let changes = 0;
    diffLines.forEach((l) => {
      if (l.type === "add") additions++;
      else if (l.type === "del") deletions++;
      else if (l.type === "change") changes++;
    });
    return { additions, deletions, changes };
  }, [diffLines]);

  return (
    <div className="space-y-5">
      {/* Controls & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">차이점 통계:</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            +{stats.additions} 추가
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            -{stats.deletions} 삭제
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            ~{stats.changes} 변경
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                viewMode === "split" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>좌우 분할</span>
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                viewMode === "unified" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>통합 뷰</span>
            </button>
          </div>
          <button
            onClick={() => {
              setOriginal("");
              setModified("");
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="모두 비우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-1">
            <span>원본 텍스트 (Original)</span>
            <span className="font-mono text-[11px] text-slate-400">{original.split("\n").length}줄</span>
          </div>
          <textarea
            id="diff-original-input"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={7}
            className="w-full p-3 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
            placeholder="비교할 원본 텍스트를 입력하세요..."
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-1">
            <span>수정본 텍스트 (Modified)</span>
            <span className="font-mono text-[11px] text-slate-400">{modified.split("\n").length}줄</span>
          </div>
          <textarea
            id="diff-modified-input"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={7}
            className="w-full p-3 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
            placeholder="수정된 텍스트를 입력하세요..."
          />
        </div>
      </div>

      {/* Diff Result Display */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>비교 결과 미리보기</span>
          </div>
          <span className="text-[11px] text-slate-400">총 {diffLines.length}개 라인</span>
        </div>

        <div className="overflow-x-auto max-h-96 font-mono text-xs">
          {viewMode === "split" ? (
            <div className="grid grid-cols-2 divide-x divide-slate-200 min-w-[600px]">
              {/* Left column */}
              <div className="divide-y divide-slate-100">
                {diffLines.map((line, idx) => (
                  <div
                    key={`left-${idx}`}
                    className={`flex items-start py-0.5 px-2 ${
                      line.type === "del" || line.type === "change"
                        ? "bg-rose-50/80 text-rose-900"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="w-8 select-none text-right pr-2 text-slate-400 text-[10px]">
                      {line.leftNum || ""}
                    </span>
                    <span className="w-4 select-none font-bold text-slate-400">
                      {line.type === "del" ? "-" : line.type === "change" ? "~" : " "}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">{line.leftText}</span>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="divide-y divide-slate-100">
                {diffLines.map((line, idx) => (
                  <div
                    key={`right-${idx}`}
                    className={`flex items-start py-0.5 px-2 ${
                      line.type === "add" || line.type === "change"
                        ? "bg-emerald-50/80 text-emerald-900"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="w-8 select-none text-right pr-2 text-slate-400 text-[10px]">
                      {line.rightNum || ""}
                    </span>
                    <span className="w-4 select-none font-bold text-slate-400">
                      {line.type === "add" ? "+" : line.type === "change" ? "~" : " "}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">{line.rightText}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 min-w-[500px]">
              {diffLines.map((line, idx) => {
                if (line.type === "same") {
                  return (
                    <div key={idx} className="flex items-start py-0.5 px-3 text-slate-700 hover:bg-slate-50">
                      <span className="w-10 text-right pr-2 text-slate-400 select-none text-[10px]">
                        {line.leftNum}
                      </span>
                      <span className="w-5 select-none text-slate-400"> </span>
                      <span className="flex-1 whitespace-pre-wrap break-all">{line.leftText}</span>
                    </div>
                  );
                }
                return (
                  <React.Fragment key={idx}>
                    {line.leftText !== undefined && line.leftText !== "" && (
                      <div className="flex items-start py-0.5 px-3 bg-rose-50 text-rose-900">
                        <span className="w-10 text-right pr-2 text-rose-400 select-none text-[10px]">
                          {line.leftNum}
                        </span>
                        <span className="w-5 select-none font-bold text-rose-600">-</span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line.leftText}</span>
                      </div>
                    )}
                    {line.rightText !== undefined && line.rightText !== "" && (
                      <div className="flex items-start py-0.5 px-3 bg-emerald-50 text-emerald-900">
                        <span className="w-10 text-right pr-2 text-emerald-400 select-none text-[10px]">
                          {line.rightNum}
                        </span>
                        <span className="w-5 select-none font-bold text-emerald-600">+</span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line.rightText}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
