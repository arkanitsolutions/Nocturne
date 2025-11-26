import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 NocturneLux UI - App Starting...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element found, rendering app...");
  createRoot(rootElement).render(<App />);
}
