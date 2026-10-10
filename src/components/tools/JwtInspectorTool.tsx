import React, { useState, useMemo } from "react";
import { Copy, Check, ShieldCheck, AlertTriangle, KeyRound, Clock, UserCheck } from "lucide-react";

export const JwtInspectorTool: React.FC = () => {
  // Sample JWT
  const sampleJwt =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Iuq5gOyynOyImCIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDk4NTYwMDAsImV4cCI6MjAwMDAwMDAwMH0." +
    "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

  const [token, setToken] = useState<string>(sampleJwt);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Decode JWT parts
  const decoded = useMemo(() => {
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        return { error: "JWT는 점(.)으로 구분된 3개 파트(Header, Payload, Signature)로 구성되어야 합니다." };
      }

      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const headerJson = JSON.parse(decodeBase64Url(parts[0]));
      const payloadJson = JSON.parse(decodeBase64Url(parts[1]));
      const signature = parts[2];

      let expDate: Date | null = null;
      let isExpired = false;
      let iatDate: Date | null = null;

      if (payloadJson.exp) {
        expDate = new Date(payloadJson.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
      }

      if (payloadJson.iat) {
        iatDate = new Date(payloadJson.iat * 1000);
      }

      return {
        header: headerJson,
        payload: payloadJson,
        signature,
        expDate,
        isExpired,
        iatDate,
        error: null,
      };
    } catch (err: any) {
      return { error: "JWT 파싱 실패: 형식이 올바르지 않거나 Base64 디코딩에 실패했습니다." };
    }
  }, [token]);

  return (
    <div className="space-y-5">
      {/* Input area */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <span>분석할 JWT 토큰 (JSON Web Token)</span>
          </label>
          <button
            onClick={() => setToken(sampleJwt)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            샘플 토큰 불러오기
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 break-all"
        />
      </div>

      {/* Token status */}
      {decoded.error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{decoded.error}</span>
        </div>
      ) : (
        <>
          {/* Validity Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium">토큰 유효 상태</span>
              <div className="mt-1 flex items-center gap-1.5">
                {decoded.expDate ? (
                  decoded.isExpired ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                      만료됨 (Expired)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      유효함 (Active)
                    </span>
                  )
                ) : (
                  <span className="text-xs text-slate-500">만료 시간(exp) 미설정</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium">발급 일시 (iat)</span>
              <div className="mt-1 text-xs font-mono font-semibold text-slate-800">
                {decoded.iatDate ? decoded.iatDate.toLocaleString("ko-KR") : "없음"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-400 font-medium">만료 일시 (exp)</span>
              <div className="mt-1 text-xs font-mono font-semibold text-slate-800">
                {decoded.expDate ? decoded.expDate.toLocaleString("ko-KR") : "무기한 / 없음"}
              </div>
            </div>
          </div>

          {/* Decoded parts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">헤더 (HEADER: Algorithm & Type)</span>
                <span className="text-[11px] font-mono text-rose-500 font-medium">
                  {decoded.header?.alg || "알 수 없음"}
                </span>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700">페이로드 (PAYLOAD: Claims Data)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 1500);
                  }}
                  className="text-xs text-purple-700 hover:underline flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? "복사됨" : "JSON 복사"}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-800 bg-slate-900 text-cyan-300 overflow-x-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
