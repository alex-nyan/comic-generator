import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

const SYSTEM_PROMPT = `
Create a 3-panel comic story about a girl's medical journey to meet her boyfriend at MIT. For each panel, provide:
1. An image generation prompt that includes 'TNH, a Chinese-Burmese girl studying medicine in Zhejiang, China' and ends with 'always cute Chibi style '
2. A caption that refers to the person as 'TNH'

Format the output as JSON with this structure:
{
    "comics": [
        {
            "prompt": "Image generation prompt here",
            "caption": "Caption text here"
        }
    ]
}
`;

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token is not configured');
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid request body" 
      }, { status: 400 });
    }

    const { prompt } = body;
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: "Prompt is required" 
      }, { status: 400 });
    }

    console.log("Sending prompt to OpenAI:", prompt);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("OpenAI response:", completion);

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: "No content generated" 
      }, { status: 500 });
    }

    try {
      const result = JSON.parse(content);
      return NextResponse.json({ 
        success: true, 
        comics: result.comics 
      });
    } catch (error) {
      // Properly type the error
      const parseError = error as Error;
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json({ 
        success: false, 
        error: "Invalid JSON response from OpenAI",
        details: parseError.message,  // Now TypeScript knows this is a string
        rawResponse: content
      }, { status: 500 });
    }

  } catch (error) {
    const serverError = error as Error;
    console.error('Error generating story:', serverError);
    return NextResponse.json({ 
      success: false, 
      error: serverError.message || "Failed to generate story",
      details: serverError.toString()
    }, { status: 500 });
  }
} 