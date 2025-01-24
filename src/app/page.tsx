"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

interface ComicPanel {
  prompt: string;
  caption: string;
  imageUrl?: string;
}

export default function Home() {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Tell a sweet love story about TNH, a medical student from Myanmar, studying in Zhejiang, China, and her journey to meet her boyfriend at MIT"
  );

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setPanels([]);

      // First, get the story and prompts from OpenAI
      const storyResponse = await fetch("/api/generate_plot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const storyData = await storyResponse.json();
      if (!storyData.success) {
        throw new Error(storyData.error || "Failed to generate story");
      }

      // Generate images for each panel
      const panelsWithImages = await Promise.all(
        storyData.comics.map(async (panel: ComicPanel) => {
          const imageResponse = await fetch("/api/generate_imgs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: panel.prompt }),
          });

          const imageData = await imageResponse.json();
          return {
            ...panel,
            imageUrl: imageData.imageUrl,
          };
        })
      );

      setPanels(panelsWithImages);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to generate comic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-white/90 text-lg font-medium">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Sundai
            </span>
          </Link>
          <Link 
            href="/history" 
            className="px-6 py-2 bg-gradient-to-r from-blue-400/10 to-purple-400/10 
                     text-white/80 text-sm font-medium rounded-full border border-white/10
                     hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            View History ✨
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-medium bg-gradient-to-r from-blue-400 to-purple-400 
                         text-transparent bg-clip-text">
              AI Image Generation
            </h1>
            <p className="mt-2 text-white/60">Transform your imagination into reality ✨</p>
          </header>

          <form onSubmit={handleGenerate} 
                className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 
                         backdrop-blur-xl shadow-lg">
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe something magical..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                         text-white/80 placeholder-white/40 focus:outline-none 
                         focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 
                         transition-all duration-300 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 
                       text-white font-medium rounded-xl hover:opacity-90 
                       transition-all duration-300 disabled:opacity-50 
                       disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {loading ? 'Creating Magic... ✨' : 'Generate Image ✨'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm">✨ Oops! {error}</p>
            </div>
          )}

          {loading && (
            <div className="mt-12 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-400/20 border-t-purple-400 
                            rounded-full animate-spin"></div>
              <p className="mt-4 text-white/60 text-sm animate-pulse">
                Creating something magical... ✨
              </p>
            </div>
          )}

          {panels.length > 0 && !loading && (
            <div className="mt-12">
              <div className="relative aspect-square rounded-xl overflow-hidden 
                            bg-white/5 border border-white/10">
                <Image
                  src={panels[0].imageUrl || ""}
                  alt={prompt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-4 text-sm text-white/60 text-center">
                ✨ Your magical creation is ready ✨
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
