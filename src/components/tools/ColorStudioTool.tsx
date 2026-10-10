import React, { useState } from "react";
import { Copy, Check, Pipette, Sparkles, RefreshCw } from "lucide-react";

export const ColorStudioTool: React.FC = () => {
  const [hex, setHex] = useState("#6366f1");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // HEX to RGB
  const hexToRgb = (h: string) => {
    let clean = h.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 99, g: 102, b: 241 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(hex);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Harmonies
  const getComplementaryHex = () => {
    const compH = (hsl.h + 180) % 360;
    return `hsl(${compH}, ${hsl.s}%, ${hsl.l}%)`;
  };

  const getAnalogousHex = () => {
    const h1 = (hsl.h + 30) % 360;
    const h2 = (hsl.h + 330) % 360;
    return [
      `hsl(${h2}, ${hsl.s}%, ${hsl.l}%)`,
      `hsl(${h1}, ${hsl.s}%, ${hsl.l}%)`,
    ];
  };

  const getTriadicHex = () => {
    const h1 = (hsl.h + 120) % 360;
    const h2 = (hsl.h + 240) % 360;
    return [
      `hsl(${h1}, ${hsl.s}%, ${hsl.l}%)`,
      `hsl(${h2}, ${hsl.s}%, ${hsl.l}%)`,
    ];
  };

  const copyVal = (val: string, formatId: string) => {
    navigator.clipboard.writeText(val);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  const pickWithEyeDropper = async () => {
    if ((window as any).EyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setHex(result.sRGBHex);
        }
      } catch {
        // user canceled
      }
    } else {
      alert("현재 브라우저는 화면 스포이트 API를 지원하지 않습니다. Chrome/Edge 최신 버전을 권장합니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Color Preview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div
          className="w-32 h-32 rounded-2xl shadow-inner border border-slate-200/80 shrink-0 transition-colors"
          style={{ backgroundColor: hex }}
        />

        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">색상 선택기</span>
            <button
              onClick={pickWithEyeDropper}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Pipette className="w-3.5 h-3.5 text-indigo-600" />
              <span>화면 스포이트로 색상 추출</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="p-2 text-sm font-mono font-bold uppercase text-slate-800 border border-slate-200 rounded-lg w-32 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#0f172a"].map(
              (color) => (
                <button
                  key={color}
                  onClick={() => setHex(color)}
                  className="w-6 h-6 rounded-md border border-slate-200/80 shadow-2xs hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Code Formats Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 font-mono">HEX</span>
            <button
              onClick={() => copyVal(hex.toUpperCase(), "hex")}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              {copiedFormat === "hex" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>복사</span>
            </button>
          </div>
          <div className="font-mono text-sm font-bold text-slate-800">{hex.toUpperCase()}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 font-mono">RGB</span>
            <button
              onClick={() => copyVal(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              {copiedFormat === "rgb" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>복사</span>
            </button>
          </div>
          <div className="font-mono text-sm font-bold text-slate-800">
            rgb({rgb.r}, {rgb.g}, {rgb.b})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 font-mono">HSL</span>
            <button
              onClick={() => copyVal(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "hsl")}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              {copiedFormat === "hsl" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>복사</span>
            </button>
          </div>
          <div className="font-mono text-sm font-bold text-slate-800">
            hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
          </div>
        </div>
      </div>

      {/* Color Harmonies */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <span className="text-xs font-bold text-slate-800 block">색상 조화 팔레트 (Harmonies)</span>

        <div className="space-y-3">
          <div>
            <span className="text-xs text-slate-500 mb-1.5 block">보색 (Complementary)</span>
            <div className="flex gap-2">
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: hex }}
              />
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: getComplementaryHex() }}
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 mb-1.5 block">유사색 (Analogous)</span>
            <div className="flex gap-2">
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: getAnalogousHex()[0] }}
              />
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: hex }}
              />
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: getAnalogousHex()[1] }}
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 mb-1.5 block">3색조 (Triadic)</span>
            <div className="flex gap-2">
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: hex }}
              />
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: getTriadicHex()[0] }}
              />
              <div
                className="h-10 flex-1 rounded-lg border border-slate-200 shadow-xs"
                style={{ backgroundColor: getTriadicHex()[1] }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
