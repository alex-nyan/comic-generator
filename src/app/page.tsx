"use client";
import Image from "next/image";
import { useState } from "react";

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
    "Tell a sweet love story about TNH, a medical student in Myanmar, and her journey to meet her boyfriend at MIT"
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <main className="flex flex-col items-center gap-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              TNH & MIT: A Love Story Comic
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generate a cute comic about their long-distance love journey
            </p>
          </div>

          {/* Input Section */}
          <div className="w-full max-w-2xl space-y-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-pink-200 dark:border-pink-800 
                       bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                       focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700
                       resize-none shadow-sm"
              placeholder="Enter your story prompt here..."
              rows={3}
            />

            {/* Story Guidelines */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold mb-4 text-pink-600 dark:text-pink-400">Story Guidelines</h2>
              <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">♥</span>
                  Features TNH, a dedicated medical student in Myanmar
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">♥</span>
                  Illustrations in adorable Chibi style
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500">♥</span>
                  Chronicles her love story with her MIT boyfriend
                </li>
              </ol>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 
                       text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:transform-none"
            >
              {loading ? "Creating Your Love Story..." : "Generate Love Story Comic"}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg p-4 w-full max-w-2xl">
              Error: {error}
            </div>
          )}

          {loading && (
            <div className="text-purple-600 dark:text-purple-400 animate-pulse text-center">
              Crafting your romantic comic story...
            </div>
          )}

          {/* Comic Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl mt-8">
            {panels.map((panel, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-4 bg-white/80 dark:bg-gray-800/80 
                         backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl 
                         transition-shadow duration-200"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                  {panel.imageUrl && (
                    <Image
                      src={panel.imageUrl}
                      alt={`Panel ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => {
                        setError(`Failed to load image for panel ${index + 1}`);
                      }}
                    />
                  )}
                </div>
                <p className="text-center text-sm italic text-gray-600 dark:text-gray-300">
                  {panel.caption}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Creating love stories, one panel at a time 💕</p>
        </footer>
      </div>
    </div>
  );
}
