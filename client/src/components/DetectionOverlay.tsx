import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Check } from "lucide-react";
import { DetectionResult } from "@/hooks/useObjectDetection";

interface DetectionOverlayProps {
  isDetecting: boolean;
  lastResult: DetectionResult | null;
  onCapture: () => void;
  onClose: () => void;
  onConfirm?: (objectType: string) => void;
}

export default function DetectionOverlay({
  isDetecting,
  lastResult,
  onCapture,
  onClose,
  onConfirm
}: DetectionOverlayProps) {
  const showConfirmation = lastResult && lastResult.objectType !== "unknown" && lastResult.confidence >= 60;

  return (
    <div className="absolute inset-0 flex flex-col" data-testid="container-detection-overlay">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <span className="text-white font-semibold text-lg" data-testid="text-detection-mode">
          Object Detection
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={onClose}
          data-testid="button-close-detection"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Detection Status Overlay */}
      <div className="flex-1 flex items-end justify-center pb-32">
        <div
          className="rounded-2xl p-6 max-w-md mx-4 text-center"
          style={{
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          {isDetecting ? (
            <div data-testid="container-detecting">
              <Loader2 className="w-12 h-12 text-white mx-auto mb-3 animate-spin" />
              <p className="text-white font-semibold text-lg">
                Analyzing image...
              </p>
              <p className="text-white/70 text-sm mt-1">
                Please wait
              </p>
            </div>
          ) : showConfirmation ? (
            <div data-testid="container-confirmation">
              <div className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-xl mb-2">
                {lastResult.objectType === "graffiti" && "Graffiti Detected"}
                {lastResult.objectType === "syringe" && "Syringe Detected"}
                {lastResult.objectType === "dog-poop" && "Dog Waste Detected"}
              </p>
              <p className="text-white/80 text-sm mb-4">
                Confidence: {lastResult.confidence}%
              </p>
              <p className="text-white/70 text-sm mb-6">
                Is this correct?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  data-testid="button-cancel-detection"
                >
                  No, try again
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onConfirm && onConfirm(lastResult.objectType)}
                  data-testid="button-confirm-detection"
                >
                  Yes, continue
                </Button>
              </div>
            </div>
          ) : (
            <div data-testid="container-instructions">
              <Camera className="w-12 h-12 text-white mx-auto mb-3" />
              <p className="text-white font-semibold text-lg mb-2">
                Point camera at object
              </p>
              <p className="text-white/70 text-sm mb-6">
                Supports: Graffiti, Syringes, Dog Waste
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={onCapture}
                disabled={isDetecting}
                data-testid="button-capture"
              >
                <Camera className="w-5 h-5 mr-2" />
                Capture & Detect
              </Button>
            </div>
          )}

          {/* Show last result if detection failed or low confidence */}
          {lastResult && lastResult.objectType === "unknown" && !isDetecting && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30" data-testid="container-error">
              <p className="text-red-200 text-sm">
                Could not detect a known object
              </p>
              <p className="text-red-200/70 text-xs mt-1">
                {lastResult.explanation}
              </p>
            </div>
          )}
          
          {lastResult && lastResult.objectType !== "unknown" && lastResult.confidence < 60 && !isDetecting && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30" data-testid="container-low-confidence">
              <p className="text-yellow-200 text-sm">
                Low confidence detection ({lastResult.confidence}%)
              </p>
              <p className="text-yellow-200/70 text-xs mt-1">
                Try capturing again for better results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
