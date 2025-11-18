import { useState, useCallback, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { ObjectType } from "@shared/schema";

export interface DetectionResult {
  objectType: ObjectType | "unknown";
  confidence: number;
  explanation: string;
}

export interface UseObjectDetectionOptions {
  onDetection?: (result: DetectionResult) => void;
  onError?: (error: Error) => void;
  minConfidence?: number;
}

export function useObjectDetection(options: UseObjectDetectionOptions = {}) {
  const { onDetection, onError, minConfidence = 60 } = options;
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const captureFrame = useCallback((videoElement: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      
      ctx.drawImage(videoElement, 0, 0);
      
      // Convert to base64 JPEG (smaller than PNG)
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("[Detection] Failed to capture frame:", error);
      return null;
    }
  }, []);

  const detect = useCallback(async (videoElement: HTMLVideoElement): Promise<DetectionResult | null> => {
    // Cancel any pending detection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsDetecting(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const imageData = captureFrame(videoElement);
      
      if (!imageData) {
        throw new Error("Failed to capture video frame");
      }

      const response = await apiRequest("POST", "/api/detect", {
        imageData,
      });

      if (abortController.signal.aborted) {
        return null;
      }

      const result = await response.json() as DetectionResult;
      
      setLastResult(result);

      // Only call onDetection if confidence meets minimum threshold
      if (result.confidence >= minConfidence && onDetection) {
        onDetection(result);
      }

      return result;
    } catch (error) {
      if (abortController.signal.aborted) {
        return null;
      }

      const err = error instanceof Error ? error : new Error("Detection failed");
      console.error("[Detection] Error:", err);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      if (!abortController.signal.aborted) {
        setIsDetecting(false);
        abortControllerRef.current = null;
      }
    }
  }, [captureFrame, onDetection, onError, minConfidence]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDetecting(false);
  }, []);

  return {
    detect,
    cancel,
    isDetecting,
    lastResult,
  };
}
