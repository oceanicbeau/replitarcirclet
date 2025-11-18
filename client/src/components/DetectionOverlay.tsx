import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Check, ScanLine } from "lucide-react";
import { DetectionResult } from "@/hooks/useObjectDetection";

interface DetectionOverlayProps {
  isDetecting: boolean;
  lastResult: DetectionResult | null;
  onCapture?: () => void;
  onClose: () => void;
  onConfirm?: (objectType: string) => void;
  continuousMode?: boolean;
  isActive?: boolean;
}

export default function DetectionOverlay({
  isDetecting,
  lastResult,
  onCapture,
  onClose,
  onConfirm,
  continuousMode = false,
  isActive = false
}: DetectionOverlayProps) {
  const showConfirmation = lastResult && lastResult.objectType !== "unknown" && lastResult.confidence >= 60;
  
  const getObjectLabel = (objectType: string) => {
    switch(objectType) {
      case "graffiti": return "Graffiti";
      case "syringe": return "Syringe";
      case "dog-poop": return "Dog Waste";
      default: return "Unknown";
    }
  };

  if (continuousMode) {
    // Continuous Real-time Detection Mode
    return (
      <div className="absolute inset-0 flex flex-col" data-testid="container-detection-overlay">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <span className="text-white font-semibold text-lg" data-testid="text-detection-mode">
            Real-time Detection
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

        {/* Center - Real-time Detection Overlay */}
        <div className="flex-1 flex items-center justify-center">
          {isDetecting ? (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(0,0,0,0.4)",
                border: "2px solid rgba(255,255,255,0.3)"
              }}
              data-testid="container-scanning"
            >
              <ScanLine className="w-16 h-16 text-white mx-auto mb-3 animate-pulse" />
              <p className="text-white font-bold text-xl">
                Scanning...
              </p>
            </div>
          ) : lastResult && showConfirmation ? (
            <div
              className="rounded-3xl p-8 text-center max-w-sm mx-4"
              style={{
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(30, 136, 229, 0.9)",
                border: "2px solid white",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
              }}
              data-testid="container-detected"
            >
              <div className="w-20 h-20 rounded-full bg-white mx-auto mb-4 flex items-center justify-center">
                <Check className="w-10 h-10" style={{ color: "#1E88E5" }} />
              </div>
              <p className="text-white font-bold text-3xl mb-2">
                {getObjectLabel(lastResult.objectType)}
              </p>
              <p className="text-white text-lg mb-6">
                {lastResult.confidence}% confident
              </p>
              <Button
                size="lg"
                className="w-full bg-white hover:bg-gray-100 text-lg font-bold py-6"
                style={{ color: "#1E88E5" }}
                onClick={() => onConfirm && onConfirm(lastResult.objectType)}
                data-testid="button-select-object"
              >
                Select This Object
              </Button>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(0,0,0,0.4)",
                border: "2px solid rgba(255,255,255,0.3)"
              }}
              data-testid="container-instructions"
            >
              <Camera className="w-16 h-16 text-white mx-auto mb-3" />
              <p className="text-white font-bold text-xl mb-2">
                Point at Object
              </p>
              <p className="text-white/80 text-sm">
                Graffiti • Syringes • Dog Waste
              </p>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div
          className="p-4 text-center"
          style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          {lastResult && lastResult.objectType === "unknown" && !isDetecting && (
            <p className="text-yellow-300 text-sm" data-testid="text-unknown-object">
              Unknown object - move camera to try again
            </p>
          )}
          {lastResult && lastResult.objectType !== "unknown" && lastResult.confidence < 60 && !isDetecting && (
            <p className="text-yellow-300 text-sm" data-testid="text-low-confidence">
              Low confidence - move closer or try different angle
            </p>
          )}
          {isActive && !isDetecting && !lastResult && (
            <p className="text-white/70 text-sm">
              Move camera around to detect objects
            </p>
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
