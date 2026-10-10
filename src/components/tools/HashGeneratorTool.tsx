import React, { useState, useEffect } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";

export const HashGeneratorTool: React.FC = () => {
  const [input, setInput] = useState<string>("Hello OmniTools!");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState<{ [key: string]: string }>({
    "SHA-256": "",
    "SHA-1": "",
    "SHA-512": "",
    "SHA-384": "",
    "MD5": "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pure JS MD5 implementation
  const calculateMD5 = (string: string) => {
    function md5cycle(x: any, k: any) {
      let a = x[0], b = x[1], c = x[2], d = x[3];
      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22, 1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
    }

    function cmn(q: any, a: any, b: any, x: any, s: any, t: any) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn((b & c) | (~b & d), a, b, x, s, t);
    }
    function gg(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn((b & d) | (c & ~d), a, b, x, s, t);
    }
    function hh(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function ii(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
      return cmn(c ^ (b | ~d), a, b, x, s, t);
    }
    function add32(a: any, b: any) {
      return (a + b) & 0xffffffff;
    }

    const n = string.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= string.length; i += 64) {
      md5cycle(state, md5blk(string.substring(i - 64, i)));
    }
    string = string.substring(i - 64);
    let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let j = 0;
    for (j = 0; j < string.length; j++) tail[j >> 2] |= string.charCodeAt(j) << (j % 4 << 3);
    tail[j >> 2] |= 0x80 << (j % 4 << 3);
    if (j > 55) {
      md5cycle(state, tail);
      for (let k = 0; k < 16; k++) tail[k] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);

    function md5blk(s: string) {
      let md5blks: any = [];
      for (let i = 0; i < 64; i += 4) {
        md5blks[i >> 2] =
          s.charCodeAt(i) +
          (s.charCodeAt(i + 1) << 8) +
          (s.charCodeAt(i + 2) << 16) +
          (s.charCodeAt(i + 3) << 24);
      }
      return md5blks;
    }

    const hex = (num: number) => {
      let s = "", t = "";
      for (let j = 0; j <= 3; j++) {
        t = "0" + ((num >> (j * 8)) & 255).toString(16);
        s += t.substr(t.length - 2);
      }
      return s;
    };

    return hex(state[0]) + hex(state[1]) + hex(state[2]) + hex(state[3]);
  };

  // Compute Web Crypto Hashes
  useEffect(() => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const computeSubtleHash = async (algo: string) => {
      try {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      } catch {
        return "";
      }
    };

    const run = async () => {
      const sha256 = await computeSubtleHash("SHA-256");
      const sha1 = await computeSubtleHash("SHA-1");
      const sha512 = await computeSubtleHash("SHA-512");
      const sha384 = await computeSubtleHash("SHA-384");
      const md5 = calculateMD5(input);

      setHashes({
        "SHA-256": sha256,
        "MD5": md5,
        "SHA-1": sha1,
        "SHA-512": sha512,
        "SHA-384": sha384,
      });
    };

    run();
  }, [input]);

  const copyHash = (algo: string, val: string) => {
    const textToCopy = uppercase ? val.toUpperCase() : val.toLowerCase();
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(algo);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>해시를 계산할 문자열 (텍스트)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>대문자(UPPERCASE) 출력</span>
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="해시할 텍스트를 입력하세요..."
          className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Hash Results */}
      <div className="space-y-3">
        {Object.entries(hashes).map(([algo, hashVal]) => {
          const strVal = String(hashVal);
          const displayVal = uppercase ? strVal.toUpperCase() : strVal.toLowerCase();
          return (
            <div
              key={algo}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 font-mono">{algo}</span>
                <button
                  onClick={() => copyHash(algo, strVal)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                >
                  {copiedKey === algo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-slate-800 break-all select-all border border-slate-100">
                {displayVal || "계산 중..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
