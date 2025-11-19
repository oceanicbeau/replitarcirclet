import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Check, ScanLine } from "lucide-react";
import { DetectionResult } from "@/hooks/useObjectDetection";
import syringeImage from "@assets/Syringe.H03.2k_1763447760772.png";
import penImage from "@assets/generated_images/3D_blue_ballpoint_pen_4f1e1f3e.png";
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
      <div className="absolute inset-0 flex flex-col z-20" data-testid="container-detection-overlay">
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

        {/* Spacer to push bottom UI down */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Photo Copier Scanning Animation - Shows during detection */}
          {(isActive && !isPaused && !showConfirmation) && (
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              data-testid="overlay-scanning-animation"
            >
              <div 
                className="absolute left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(30, 136, 229, 0.8), rgba(30, 136, 229, 1), rgba(30, 136, 229, 0.8), transparent)',
                  boxShadow: '0 0 20px rgba(30, 136, 229, 0.8), 0 0 40px rgba(30, 136, 229, 0.4)',
                  height: '4px',
                  animation: 'scanDown 4s ease-in-out infinite'
                }}
              />
            </div>
          )}
          
          {/* 3D Syringe Model Overlay - Shows when syringe detected */}
          {lastResult && lastResult.objectType === "syringe" && showConfirmation && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                animation: "fadeIn 0.5s ease-in-out"
              }}
              data-testid="overlay-syringe-3d"
            >
              <img 
                src={syringeImage} 
                alt="Syringe 3D Model"
                className="w-64 h-64 object-contain drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
                  animation: "pulse 2s ease-in-out infinite"
                }}
              />
            </div>
          )}
          
          {/* 3D Pen Model Overlay - Shows when pen detected */}
          {lastResult && lastResult.objectType === "pen" && showConfirmation && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                animation: "fadeIn 0.5s ease-in-out"
              }}
              data-testid="overlay-pen-3d"
            >
              <img 
                src={penImage} 
                alt="Pen 3D Model"
                className="w-64 h-64 object-contain drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
                  animation: "pulse 2s ease-in-out infinite"
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom Detection UI - Full Width, Fixed Height */}
        <div
          className="w-full flex items-center justify-center px-4 py-4 min-h-[15vh]"
          style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          {isPaused && !showConfirmation ? (
            <div className="flex items-center gap-4" data-testid="container-paused">
              <div className="w-8 h-8 rounded-full border-4 border-white/30" />
            </div>
          ) : isDetecting ? (
            <div className="flex items-center gap-4" data-testid="container-scanning">
              <ScanLine className="w-8 h-8 text-white animate-pulse" />
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
    <div className="absolute inset-0 flex flex-col z-20" data-testid="container-detection-overlay">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-end"
        style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
      >
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
              <Loader2 className="w-12 h-12 text-white mx-auto animate-spin" />
            </div>
          ) : showConfirmation ? (
            <div data-testid="container-confirmation">
              <div className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-xl mb-2">
                {getObjectLabel(lastResult.objectType)}
              </p>
              <p className="text-white/80 text-sm mb-6">
                {lastResult.confidence}% confident
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  data-testid="button-cancel-detection"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onConfirm && onConfirm(lastResult.objectType)}
                  data-testid="button-confirm-detection"
                >
                  <Check className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}
