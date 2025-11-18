import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client using Replit AI Integrations
// This uses the blueprint from javascript_gemini_ai_integrations
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
  },
});

export interface DetectionResult {
  objectType: "graffiti" | "syringe" | "dog-poop" | "unknown";
  confidence: number;
  explanation: string;
}

export async function detectObject(imageBase64: string): Promise<DetectionResult> {
  try {
    const prompt = `Analyze this image and determine if it contains any of the following municipal objects:
1. Graffiti (spray paint, vandalism on walls/surfaces)
2. Syringe (needle, medical waste)
3. Dog waste (dog poop, feces)

Respond with ONLY a JSON object in this exact format:
{
  "objectType": "graffiti" | "syringe" | "dog-poop" | "unknown",
  "confidence": 0-100,
  "explanation": "brief explanation"
}

If the image contains multiple objects, choose the most prominent one.
If none of these objects are present, use "unknown" with low confidence.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { 
            inlineData: { 
              mimeType: "image/jpeg", 
              data: imageBase64 
            } 
          }
        ]
      }]
    });

    const text = response.text || "";
    
    // Extract JSON from response (Gemini might wrap it in markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const result = JSON.parse(jsonText) as DetectionResult;
    
    // Validate the response
    if (!result.objectType || !result.confidence) {
      throw new Error("Invalid response format from Gemini");
    }
    
    // Ensure confidence is in valid range
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    
    return result;
  } catch (error) {
    console.error("[Gemini] Detection error:", error);
    
    // Return unknown with low confidence on error
    return {
      objectType: "unknown",
      confidence: 0,
      explanation: "Error analyzing image: " + (error instanceof Error ? error.message : "Unknown error")
    };
  }
}
