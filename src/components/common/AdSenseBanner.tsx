import React, { useEffect, useRef } from "react";
import { Sparkles, Info, ShieldCheck } from "lucide-react";

interface AdSenseBannerProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle" | "banner";
  className?: string;
  label?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId = "1234567890",
  format = "horizontal",
  className = "",
  label = "스폰서 광고",
}) => {
  const adRef = useRef<HTMLDivElement | null>(null);
  const adsenseClientId =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_ADSENSE_CLIENT_ID || "";
  const isAdSenseConfigured = Boolean(adsenseClientId && adsenseClientId.startsWith("ca-pub-"));

  useEffect(() => {
    if (isAdSenseConfigured && window) {
      try {
        // Load AdSense script dynamically if not yet added
        const scriptId = "google-adsense-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
          document.head.appendChild(script);
        }

        // Push ad call
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.warn("AdSense push initialization error:", err);
      }
    }
  }, [isAdSenseConfigured, adsenseClientId]);

  return (
    <div className={`w-full my-6 select-none ${className}`}>
      {/* Top Header Badge required by Google AdSense policy */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1 text-slate-400">
          <Info className="w-2.5 h-2.5" />
          <span>{label}</span>
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
          <ShieldCheck className="w-2.5 h-2.5 text-slate-400" />
          <span>Google AdSense</span>
        </span>
      </div>

      {isAdSenseConfigured ? (
        /* Real Google AdSense Unit */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 min-h-[90px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={adsenseClientId}
            data-ad-slot={slotId}
            data-ad-format={format === "horizontal" ? "horizontal" : "auto"}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        /* Professional AdSense Integration Preview Box (Complies with layout flow) */
        <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 p-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto py-1">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Google AdSense 광고 영역</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded bg-indigo-100 text-indigo-700 font-mono font-medium">
                    {format.toUpperCase()}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  VITE_ADSENSE_CLIENT_ID (ca-pub-XXXXX) 환경변수 설정 시 실제 타깃 광고가 게재됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                반응형 광고 규격 대응
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
