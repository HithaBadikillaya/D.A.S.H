import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import "./index.css";

import App from "./App";
import Home from "./pages/Home";
import Templates from "./pages/TemplatePage";
import PromptBuilder from "./pages/PromptBuilder";

const CaptionGenerator = lazy(() => import("./pages/CaptionGenerator"));

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home / Dashboard */}
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />

        {/* Template Management */}
        <Route path="/templates" element={<Templates />} />

        {/* Prompt Builder */}
        <Route path="/prompt-builder" element={<PromptBuilder />} />

        {/* Caption Generator */}
        <Route
          path="/captions"
          element={
            <Suspense fallback={<div className="p-10 text-center">Loading Generator...</div>}>
              <CaptionGenerator />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;
