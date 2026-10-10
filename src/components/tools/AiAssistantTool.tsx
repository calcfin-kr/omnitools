import React, { useState } from "react";
import { Sparkles, Copy, Check, Send, AlertCircle, RefreshCw, Languages, FileCheck, AlignLeft, Wand2 } from "lucide-react";

export const AiAssistantTool: React.FC = () => {
  const [action, setAction] = useState<"proofread" | "summarize" | "translate" | "tone">("proofread");
  const [text, setText] = useState<string>(
    "안녕하세요 담당자님. 보네주신 견적서 검토하엿으며 몇가지 수정사항 잇어 전달드립니다. 확인부탁드림니다."
  );
  const [targetLang, setTargetLang] = useState("영어 (English)");
  const [toneType, setToneType] = useState("정중하고 격식 있는 비즈니스 공문서체");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text,
          targetLang,
          toneType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI 요청에 실패했습니다.");
      }
      setResult(data.result || "결과를 생성할 수 없습니다.");
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Action Sub-nav */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "proofread", label: "맞춤법 & 문장 교정", icon: FileCheck },
          { id: "summarize", label: "핵심 요약하기", icon: AlignLeft },
          { id: "translate", label: "자연스러운 AI 번역", icon: Languages },
          { id: "tone", label: "문체/어조 변환", icon: Wand2 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setAction(item.id as any);
                setResult("");
                setError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                action === item.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">입력 텍스트</span>
            <span className="text-[11px] text-slate-400 font-mono">{text.length}자</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="AI로 처리할 문장이나 단락을 입력하세요..."
            className="w-full p-3 font-sans text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />

          {/* Conditional Options */}
          {action === "translate" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">번역 목표 언어:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium"
              >
                <option value="영어 (English)">영어 (English)</option>
                <option value="한국어 (Korean)">한국어 (Korean)</option>
                <option value="일본어 (Japanese)">일본어 (Japanese)</option>
                <option value="중국어 간체 (Chinese)">중국어 간체 (Chinese)</option>
                <option value="스페인어 (Spanish)">스페인어 (Spanish)</option>
              </select>
            </div>
          )}

          {action === "tone" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">목표 문체/어조:</span>
              <select
                value={toneType}
                onChange={(e) => setToneType(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-medium"
              >
                <option value="정중하고 격식 있는 비즈니스 공문서체">정중한 비즈니스 공문서체</option>
                <option value="친근하고 다정한 고객 안내체">친근한 고객 응대체</option>
                <option value="핵심만 간결하게 정리한 개조식 불릿포인트">간결한 개조식 불릿포인트</option>
                <option value="논리적이고 학술적인 보고서 어조">논리적인 학술/보고서 어조</option>
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI가 답변을 생성하는 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 실행하기</span>
              </>
            )}
          </button>
        </div>

        {/* Output Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI 분석 및 변환 결과</span>
              </span>
              {result && (
                <button
                  onClick={handleCopy}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "복사됨" : "결과 복사"}</span>
                </button>
              )}
            </div>

            {error ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>요청 실패</span>
                </div>
                <p className="leading-relaxed">{error}</p>
              </div>
            ) : result ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {result}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-400">
                왼쪽 텍스트를 확인하고 'AI 실행하기'를 누르면 Gemini AI의 분석 결과가 나타납니다.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by Gemini 3.8 Flash</span>
            <span className="text-indigo-600 font-medium">안전한 서버 사이드 처리</span>
          </div>
        </div>
      </div>
    </div>
  );
};
