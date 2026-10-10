import React, { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Key, Shield, Sparkles, Hash } from "lucide-react";

export const PasswordUuidTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"password" | "uuid">("password");

  // Password Generator State
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copiedPass, setCopiedPass] = useState(false);

  // UUID Generator State
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidHyphen, setUuidHyphen] = useState(true);
  const [uuidUpper, setUuidUpper] = useState(false);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [copiedUuids, setCopiedUuids] = useState(false);

  // Password Generation logic
  const generateNewPassword = () => {
    let charset = "";
    if (useUpper) charset += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) charset += excludeAmbiguous ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += excludeAmbiguous ? "23456789" : "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      setGeneratedPassword("");
      return;
    }

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    setGeneratedPassword(result);
  };

  // Password Strength Evaluation
  const evaluateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "없음", color: "bg-slate-200", text: "text-slate-400" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 14) score += 1;
    if (pwd.length >= 20) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 20, label: "매우 취약", color: "bg-rose-500", text: "text-rose-600" };
    if (score <= 4) return { score: 45, label: "보통", color: "bg-amber-500", text: "text-amber-600" };
    if (score <= 5) return { score: 75, label: "강력함", color: "bg-emerald-500", text: "text-emerald-600" };
    return { score: 100, label: "최고 수준 (매우 안전)", color: "bg-indigo-600", text: "text-indigo-600" };
  };

  const strength = evaluateStrength(generatedPassword);

  // UUID Generation logic
  const generateNewUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u: string = crypto.randomUUID();
      if (!uuidHyphen) u = u.replace(/-/g, "");
      if (uuidUpper) u = u.toUpperCase();
      list.push(u);
    }
    setGeneratedUuids(list);
  };

  useEffect(() => {
    generateNewPassword();
    generateNewUuids();
  }, []);

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "password" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>보안 비밀번호 생성기</span>
        </button>
        <button
          onClick={() => setActiveTab("uuid")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === "uuid" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>UUID v4 생성기</span>
        </button>
      </div>

      {activeTab === "password" ? (
        <div className="space-y-4">
          {/* Result Display Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-lg font-bold text-slate-900 break-all select-all tracking-wide">
                {generatedPassword || "선택된 문자 유형이 없습니다."}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={generateNewPassword}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="새로고침"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 1500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? "복사됨" : "비밀번호 복사"}</span>
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-medium">비밀번호 보안 강도:</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>비밀번호 길이: {length}자</span>
                <span className="text-slate-400">권장: 16자 이상</span>
              </div>
              <input
                type="range"
                min={6}
                max={64}
                value={length}
                onChange={(e) => {
                  setLength(Number(e.target.value));
                  setTimeout(generateNewPassword, 0);
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useUpper}
                  onChange={(e) => {
                    setUseUpper(e.target.checked);
                    setTimeout(generateNewPassword, 0);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>대문자 포함 (A-Z)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useLower}
                  onChange={(e) => {
                    setUseLower(e.target.checked);
                    setTimeout(generateNewPassword, 0);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>소문자 포함 (a-z)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => {
                    setUseNumbers(e.target.checked);
                    setTimeout(generateNewPassword, 0);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>숫자 포함 (0-9)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => {
                    setUseSymbols(e.target.checked);
                    setTimeout(generateNewPassword, 0);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>특수문자 포함 (!@#$%^&*)</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none sm:col-span-2">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => {
                    setExcludeAmbiguous(e.target.checked);
                    setTimeout(generateNewPassword, 0);
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>혼동하기 쉬운 문자 제외 (1, l, I, 0, O)</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* UUID Generator */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span>생성 개수:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => {
                    setUuidCount(Number(e.target.value));
                    setTimeout(generateNewUuids, 0);
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md focus:outline-none font-semibold text-indigo-600"
                >
                  <option value={1}>1개</option>
                  <option value={5}>5개</option>
                  <option value={10}>10개</option>
                  <option value={20}>20개</option>
                  <option value={50}>50개</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidHyphen}
                  onChange={(e) => {
                    setUuidHyphen(e.target.checked);
                    setTimeout(generateNewUuids, 0);
                  }}
                  className="rounded text-indigo-600"
                />
                <span>하이픈(-) 포함</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUpper}
                  onChange={(e) => {
                    setUuidUpper(e.target.checked);
                    setTimeout(generateNewUuids, 0);
                  }}
                  className="rounded text-indigo-600"
                />
                <span>대문자</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generateNewUuids}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="다시 생성"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedUuids.join("\n"));
                  setCopiedUuids(true);
                  setTimeout(() => setCopiedUuids(false), 1500);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedUuids ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUuids ? "복사됨" : "전체 복사"}</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs max-h-96 overflow-y-auto">
            {generatedUuids.map((uuid, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <span className="font-mono text-xs text-slate-800 font-semibold">{uuid}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(uuid);
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-50"
                  title="이 UUID만 복사"
                >
                  복사
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
