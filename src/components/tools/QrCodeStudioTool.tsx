import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, Copy, Check, QrCode, Wifi, Link, AlignLeft, RefreshCw } from "lucide-react";

export const QrCodeStudioTool: React.FC = () => {
  const [mode, setMode] = useState<"url" | "wifi" | "text">("url");
  const [url, setUrl] = useState("https://ai.studio/build");
  const [text, setText] = useState("안녕하세요! OmniTools QR코드입니다.");
  
  // Wi-Fi details
  const [wifiSsid, setWifiSsid] = useState("MyHome_5G");
  const [wifiPass, setWifiPass] = useState("password1234");
  const [wifiType, setWifiType] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // Styling options
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [margin, setMargin] = useState<number>(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute QR string payload based on mode
  const getQrPayload = () => {
    if (mode === "url") return url;
    if (mode === "wifi") {
      return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
    }
    return text;
  };

  const payload = getQrPayload();

  useEffect(() => {
    if (canvasRef.current && payload) {
      QRCode.toCanvas(
        canvasRef.current,
        payload,
        {
          width: 320,
          margin: margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: errorLevel,
        },
        (error) => {
          if (error) console.error("QR Code Error:", error);
        }
      );
    }
  }, [payload, darkColor, lightColor, errorLevel, margin]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const downloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(payload, {
        type: "svg",
        margin: margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: errorLevel,
      });
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "qrcode.svg";
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const copyCanvasImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } catch (err) {
      // Fallback copy text
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setMode("url")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            mode === "url" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Link className="w-4 h-4" />
          <span>웹사이트 링크 (URL)</span>
        </button>
        <button
          onClick={() => setMode("wifi")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            mode === "wifi" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>와이파이(Wi-Fi) 자동 연결</span>
        </button>
        <button
          onClick={() => setMode("text")}
          className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            mode === "text" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlignLeft className="w-4 h-4" />
          <span>일반 텍스트</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input & Customization Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            {mode === "url" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">웹사이트 URL 주소</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>
            )}

            {mode === "wifi" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">와이파이 이름 (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="SSID 이름"
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">비밀번호</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="Wi-Fi Password"
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">보안 암호화</label>
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">비밀번호 없음 (개방형)</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>숨김 SSID</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {mode === "text" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">문자열 내용</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="QR 코드로 생성할 텍스트를 자유롭게 입력하세요..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Color & Format options */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <span className="text-xs font-semibold text-slate-700 block">스타일 및 복원율 설정</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">QR 색상 (전경)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono">{darkColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">배경 색상</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono">{lightColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">오류 복원 레벨</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="L">L (낮음 - 7%)</option>
                  <option value="M">M (표준 - 15%)</option>
                  <option value="Q">Q (높음 - 25%)</option>
                  <option value="H">H (최고 - 30%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">여백 (Margin)</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value={1}>1 (최소)</option>
                  <option value={2}>2 (권장)</option>
                  <option value={4}>4 (넓게)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR Preview & Download */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 inline-block shadow-inner">
            <canvas ref={canvasRef} className="rounded max-w-full h-auto" />
          </div>

          <p className="text-xs text-slate-400 mt-3 max-w-xs truncate">
            {payload}
          </p>

          <div className="flex flex-wrap gap-2 justify-center mt-5 w-full">
            <button
              onClick={downloadPng}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG 다운로드</span>
            </button>
            <button
              onClick={downloadSvg}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG (벡터)</span>
            </button>
            <button
              onClick={copyCanvasImage}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "복사됨" : "이미지 복사"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
