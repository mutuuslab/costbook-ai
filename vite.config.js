import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 서버 포트: 9001 (포트 8000 사용 금지 규칙 준수)
// base "./" : 루트 도메인(Netlify/Vercel)·서브경로(GitHub Pages)·로컬 어디서든 동작
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 9001, open: true, host: true },
});
