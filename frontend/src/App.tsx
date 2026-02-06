import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home";
import CaptionGenerator from "./pages/generators/CaptionGenerator";
import LetterGenerator from "./pages/generators/LetterGenerator";

function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Unified Captions Workspace */}
        <Route path="/captions" element={<CaptionGenerator />} />

        {/* Letter Generator */}
        <Route path="/letters" element={<LetterGenerator />} />

        {/* Redirect old routes */}
        <Route path="/templates" element={<Navigate to="/captions" replace />} />
        <Route path="/generate/:type" element={<Navigate to="/captions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;