import { GoogleGenAI, Type } from "@google/genai";
import { MONTHS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCalendarImage = async (prompt: string, aspectRatio: string = "4:3"): Promise<string> => {
  try {
    // Using gemini-2.5-flash-image for speed and efficiency in generating 12 images
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio as "4:3" | "1:1" | "3:4" | "16:9" | "9:16",
        },
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const constructPrompt = (theme: string, month?: string): string => {
  if (month) {
    return `A visually stunning, high-resolution artistic illustration for a calendar page representing the month of ${month}. 
    Theme: "${theme}". 
    The image should capture the essence of ${month} (e.g., season, atmosphere) while strictly adhering to the "${theme}" visual style. 
    Make it suitable for a wall calendar art section. High quality, detailed, aesthetic.`;
  }
  
  return `A visually stunning, high-resolution cover art for a wall calendar. 
  Theme: "${theme}". 
  The image should be a masterpiece representing this theme. 
  Cinematic lighting, high detail, 4k resolution style.`;
};

/**
 * Uses a text model to expand a simple theme into a detailed image generation prompt.
 */
export const enhanceTheme = async (theme: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert art director. Create a single, visually stunning, highly detailed image generation prompt for a calendar cover based on the theme: "${theme}".
      The prompt should describe the subject, lighting, artistic style (e.g. oil painting, digital art, cinematic), and mood.
      Keep it under 100 words. Return ONLY the prompt string.`,
    });
    return response.text || constructPrompt(theme);
  } catch (e) {
    console.warn("Theme enhancement failed, using fallback.", e);
    return constructPrompt(theme);
  }
};

/**
 * Generates 12 distinct prompts for the full year based on the theme.
 */
export const generateMonthlyPrompts = async (theme: string): Promise<string[]> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 12 distinct, creative, and highly detailed image generation prompts for a calendar based on the theme: "${theme}".
      There should be one prompt for each month from January to December.
      Each prompt must capture the specific mood or season of that month while strictly adhering to the visual style of "${theme}".
      Return a JSON array of 12 strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const data = JSON.parse(response.text || '[]');
    if (Array.isArray(data) && data.length === 12) {
        return data as string[];
    }
    throw new Error("Invalid prompt format returned by AI");
  } catch (e) {
    console.warn("Bulk prompt generation failed, using fallback templates.", e);
    return MONTHS.map(m => constructPrompt(theme, m));
  }
};

export const reimagineCutout = async (cutoutBase64DataUrl: string, instructions: string): Promise<string> => {
  const base64 = cutoutBase64DataUrl.includes('base64,') ? cutoutBase64DataUrl.split('base64,')[1] : cutoutBase64DataUrl;
  const prompt = instructions?.trim() || 'Reimagine this cutout subject with a creative, high quality artistic style while preserving the shape and transparent background.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64
          }
        }
      ]
    },
    config: {
      imageConfig: { aspectRatio: '1:1' }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No cutout image returned from reimagine request.');
};
