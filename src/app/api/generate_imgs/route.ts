import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Running the model...");
    const output = await replicate.run(
      "sundai-club/girl_generation:aa01251fbdeef86f73d85141805c40c1bcbe4c8d48ab102ba3116a5b887b6471",
      {
        input: {
          prompt: prompt,
          num_inference_steps: 4,
          model: "schnell"
        }
      }
    );

    const img_url = String(output);

    // Save the image and prompt to the Python backend
    try {
      const backendUrl = `https://sundai-backend-1005351512003.us-east4.run.app/save`;  // Use the full URL
      console.log('Attempting to save to:', backendUrl);
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          image_url: img_url
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Backend responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Save response:', data);
    } catch (saveError) {
      console.error('Error saving image to history:', saveError);
      // Continue with the response even if saving fails
    }

    return NextResponse.json({ imageUrl: img_url });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
} 