"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState("Twitter Thread");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text) return alert("Please paste your text content first!");
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: text, platform }),
      });
      const data = await response.json();
      setResult(data.output || "Error: Failed to process text.");
    } catch (error) {
      setResult("Could not connect to the AI engine.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 antialiased">
      {/* Background ambient glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs font-medium text-cyan-400 mb-4 tracking-wide uppercase">
            🚀 Powered by Gemini AI
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            ViralScale AI
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Transform heavy articles and boring text documents into high-converting social media posts instantly.
          </p>
        </div>

        {/* Input Box */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Source Material</label>
          <textarea
            className="w-full h-44 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all duration-200 resize-none text-sm leading-relaxed"
            placeholder="Paste your blog article, transcript, or ideas here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Configurations Box */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-col flex-1 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Target Engine</label>
            <select
              className="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500 transition-all cursor-pointer text-sm font-medium"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option>Twitter Thread</option>
              <option>LinkedIn Post</option>
            </select>
          </div>

          <div className="flex flex-col justify-end flex-[1.5]">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-[46px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Engineering Content...
                </span>
              ) : (
                "Generate Campaign"
              )}
            </button>
          </div>
        </div>

        {/* Output Area */}
        {result && (
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-6 mt-6 relative animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Engineered Copy</h3>
              <button 
                onClick={() => { navigator.clipboard.writeText(result); alert("Copied to clipboard!"); }}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all active:scale-95"
              >
                Copy Text
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </main>
  );
}

    