import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI 기능을 사용하려면 API 키가 필요합니다.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant endpoint
  app.post("/api/ai", async (req, res) => {
    try {
      const { action, text, targetLang, toneType, regexDesc } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI 도구는 API 키 입력 후 활성화됩니다.",
        });
      }

      const ai = getAIClient();
      let prompt = "";

      if (action === "proofread") {
        prompt = `다음 텍스트의 오탈자, 띄어쓰기, 어색한 문맥을 자연스럽고 정확하게 교정해주세요.
교정된 완성 문장과 주요 수정 사항에 대한 짧은 요약을 반환해주세요.

[원본 텍스트]:
${text}

반환 형식:
[교정 결과]
(교정된 텍스트)

[수정 포인트]
- (수정된 핵심 사항 요약)`;
      } else if (action === "summarize") {
        prompt = `다음 텍스트의 핵심 내용을 가독성 높은 불릿 포인트(3~5개)와 1줄 한줄평으로 깔끔하게 요약해주세요.

[원본 텍스트]:
${text}`;
      } else if (action === "translate") {
        prompt = `다음 텍스트를 가장 자연스럽고 문맥에 맞는 ${targetLang || "영어"}(으)로 번역해주세요. 번역문만 명확하게 출력하세요.

[원본 텍스트]:
${text}`;
      } else if (action === "tone") {
        prompt = `다음 텍스트를 '${toneType || "격식 있는 비즈니스 어조"}' 스타일로 다시 작성해주세요. 원래의 핵심 의미와 의도를 완벽히 보존하면서 어조와 문체를 알맞게 변경해주세요.

[원본 텍스트]:
${text}`;
      } else if (action === "regex") {
        prompt = `다음 요구사항을 충족하는 정규표현식(Regex)을 생성해주세요.
요구사항: "${regexDesc || text}"

반환 형식:
1. 정규식 패턴: /패턴/플래그
2. 정규식 동작 설명 (각 파트별 상세 설명)
3. 매칭 성공 예시 3개
4. 매칭 실패 예시 2개`;
      } else {
        return res.status(400).json({ error: "지원하지 않는 AI 작업입니다." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        result: response.text,
      });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({
        error: error.message || "AI 요청 처리 중 오류가 발생했습니다.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
