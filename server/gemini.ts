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

export interface DetectedObjectInfo {
  name: string;
  confidence: number;
}

export interface DetectionResult {
  objectType: "graffiti" | "syringe" | "dog-poop" | "water-bottle" | "circle-t-logo" | "pen" | "unknown";
  confidence: number;
  explanation: string;
  otherObjects: DetectedObjectInfo[];
}

export async function detectObject(imageBase64: string): Promise<DetectionResult> {
  try {
    const prompt = `Analyze this image carefully.

PRIMARY TASK: Check if it contains any of these municipal objects:
1. Graffiti (spray paint, vandalism on walls/surfaces)
2. Syringe (needle, medical waste)
3. Dog waste (dog poop, feces)
4. Water bottle or drink bottle (plastic bottles, beverage containers)
5. Circle T Logo (a circular logo with the letter T, blue branding, council logo)
6. Pen (ballpoint pen, writing pen, any type of pen)

SECONDARY TASK: ALWAYS identify ALL other objects you see in the scene (cups, phones, computers, desks, walls, trees, roads, buildings, people, vehicles, signs, furniture, etc.)

Respond with ONLY a JSON object in this exact format:
{
  "objectType": "graffiti" | "syringe" | "dog-poop" | "water-bottle" | "circle-t-logo" | "pen" | "unknown",
  "confidence": 0-100,
  "explanation": "brief explanation of what you see",
  "otherObjects": [
    {"name": "object name", "confidence": 0-100}
  ]
}

CRITICAL: ALWAYS populate "otherObjects" with 5-10 items you see, regardless of whether municipal objects are found or not.

If municipal object found: Set objectType to the found object.
If NO municipal object found: 
  - Set objectType to "unknown"
  - Set confidence to 95 (you're confident no municipal objects exist)
  - In explanation, mention what you DO see
  - MUST populate otherObjects with everything visible in scene`;

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
    if (!result.objectType || result.confidence === undefined) {
      throw new Error("Invalid response format from Gemini");
    }
    
    // Ensure confidence is in valid range
    result.confidence = Math.max(0, Math.min(100, result.confidence));
    
    // Ensure otherObjects exists and validate each item
    if (!result.otherObjects) {
      result.otherObjects = [];
    } else {
      result.otherObjects = result.otherObjects.map(obj => ({
        name: obj.name,
        confidence: Math.max(0, Math.min(100, obj.confidence))
      }));
    }
    
    return result;
  } catch (error) {
    console.error("[Gemini] Detection error:", error);
    
    // Return unknown with low confidence on error
    return {
      objectType: "unknown",
      confidence: 0,
      explanation: "Error analyzing image: " + (error instanceof Error ? error.message : "Unknown error"),
      otherObjects: []
    };
  }
}
