"use client";
import { useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!theme) return;
    setLoading(true);
    setImage(null);

    const prompt = `A visually stunning, high-resolution calendar cover illustration.
Theme: "${theme}"
Cinematic lighting, ultra-detailed, premium wall calendar art.`;

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (data.image) {
      setImage(`data:image/png;base64,${data.image}`);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        <div className="bg-zinc-900 p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-2">Casayo Calendar AI</h1>
          <p className="text-zinc-400 mb-6">
            Generate premium calendar artwork using Gemini AI.
          </p>

          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Nature, Cyberpunk, Minimal..."
            className="w-full mb-4 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold"
          >
            {loading ? "Generating..." : "Generate Artwork"}
          </button>
        </div>

        <div className="bg-zinc-900 rounded-2xl flex items-center justify-center p-6">
          {!image && !loading && (
            <p className="text-zinc-500">Your image will appear here</p>
          )}
          {loading && <p className="animate-pulse">Creating masterpiece…</p>}
          {image && <img src={image} className="rounded-xl max-h-[420px]" />}
        </div>
      </div>
    </main>
  );
}
