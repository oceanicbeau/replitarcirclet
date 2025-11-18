import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Check, ScanLine } from "lucide-react";
import { DetectionResult } from "@/hooks/useObjectDetection";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface DetectionOverlayProps {
  isDetecting: boolean;
  lastResult: DetectionResult | null;
  onCapture?: () => void;
  onClose: () => void;
  onConfirm?: (objectType: string) => void;
  continuousMode?: boolean;
  isActive?: boolean;
  isPaused?: boolean;
}

export default function DetectionOverlay({
  isDetecting,
  lastResult,
  onCapture,
  onClose,
  onConfirm,
  continuousMode = false,
  isActive = false,
  isPaused = false
}: DetectionOverlayProps) {
  const showConfirmation = lastResult && lastResult.objectType !== "unknown" && lastResult.confidence >= 60;
  
  const getObjectLabel = (objectType: string) => {
    switch(objectType) {
      case "graffiti": return "Graffiti";
      case "syringe": return "Syringe";
      case "dog-poop": return "Dog Waste";
      case "water-bottle": return "Water Bottle";
      case "circle-t-logo": return "Circle T";
      case "pen": return "Pen";
      default: return "Unknown";
    }
  };

  // Trigger confetti when Circle T logo is detected
  useEffect(() => {
    if (lastResult && lastResult.objectType === "circle-t-logo" && showConfirmation) {
      // Multi-burst confetti celebration!
      const duration = 3000; // 3 seconds
      const end = Date.now() + duration;

      const colors = ['#1E88E5', '#4FC3F7', '#81D4FA', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [lastResult, showConfirmation]);

  // No auto-transition for Circle T - keep detection UI visible

  if (continuousMode) {
    // Continuous Real-time Detection Mode
    return (
      <div className="absolute inset-0 flex flex-col" data-testid="container-detection-overlay">
        {/* Close Button - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
            data-testid="button-close-detection"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom Detection UI - Full Width, 15% Height */}
        <div
          className="w-full h-[15vh] flex items-center justify-center px-4"
          style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          {isPaused && !showConfirmation ? (
            <div className="flex items-center gap-4" data-testid="container-paused">
              <div className="w-8 h-8 rounded-full border-4 border-white/30" />
              <p className="text-white font-bold text-lg">
                Scanning paused (30s)
              </p>
            </div>
          ) : isDetecting ? (
            <div className="flex items-center gap-4" data-testid="container-scanning">
              <ScanLine className="w-8 h-8 text-white animate-pulse" />
              <p className="text-white font-bold text-lg">
                Scanning...
              </p>
            </div>
          ) : lastResult && showConfirmation ? (
            <div className="w-full flex items-center justify-between gap-4" data-testid="container-detected">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: lastResult.objectType === "syringe" ? "#EF4444" : "#1E88E5" 
                  }}
                >
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xl truncate">
                    {getObjectLabel(lastResult.objectType)}
                  </p>
                  <p className="text-white/80 text-sm">
                    {lastResult.confidence}% confident
                  </p>
                  {lastResult.otherObjects && lastResult.otherObjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lastResult.otherObjects.slice(0, 3).map((obj, idx) => (
                        <span
                          key={idx}
                          className="text-white/60 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.15)"
                          }}
                          data-testid={`tag-other-object-${idx}`}
                        >
                          {obj.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 font-bold flex-shrink-0"
                style={{ 
                  color: lastResult.objectType === "syringe" ? "#EF4444" : "#1E88E5" 
                }}
                onClick={() => onConfirm && onConfirm(lastResult.objectType)}
                data-testid="button-select-object"
              >
                Select
              </Button>
            </div>
          ) : lastResult && lastResult.objectType === "unknown" && !isDetecting ? (
            <p className="text-yellow-300 text-sm" data-testid="text-unknown-object">
              Unknown object - move camera to try again
            </p>
          ) : lastResult && lastResult.objectType !== "unknown" && lastResult.confidence < 60 && !isDetecting ? (
            <p className="text-yellow-300 text-sm" data-testid="text-low-confidence">
              Low confidence - move closer or try different angle
            </p>
          ) : (
            <div className="flex items-center gap-4" data-testid="container-instructions">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original Manual Capture Mode
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
                {getObjectLabel(lastResult.objectType)} Detected
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
              <Camera className="w-12 h-12 text-white mx-auto mb-6" />
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
