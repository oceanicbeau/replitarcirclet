import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Syringe, Dog, SprayCan, Camera } from "lucide-react";
import { Link } from "wouter";
import QRScanner from "@/components/QRScanner";
import CameraView, { CameraViewRef } from "@/components/CameraView";
import ChatOverlay from "@/components/ChatOverlay";
import SubmissionForm from "@/components/SubmissionForm";
import DetectionOverlay from "@/components/DetectionOverlay";
import { getObjectByQRCode } from "@/lib/objectData";
import { ChatMessage, ObjectData, QuickAction } from "@shared/schema";
import { useObjectDetection } from "@/hooks/useObjectDetection";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/ttt_1763355102252.png";

export default function Home() {
  const cameraRef = useRef<CameraViewRef>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();
  
  const [showScanner, setShowScanner] = useState(false);
  const [detectedObject, setDetectedObject] = useState<ObjectData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [detectionMode, setDetectionMode] = useState(false);
  
  const { detect, isDetecting, lastResult } = useObjectDetection({
    onError: (error) => {
      toast({
        title: "Detection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleScan = (qrCode: string) => {
    console.log("QR Code scanned:", qrCode);
    const object = getObjectByQRCode(qrCode);
    
    if (object) {
      setDetectedObject(object);
      setShowScanner(false);
      setShowCamera(true);
      setMessages([
        {
          id: "1",
          role: "bot",
          content: object.greeting,
          timestamp: new Date()
        }
      ]);
    } else {
      console.error("Unknown object QR code");
    }
  };

  const handleActionClick = (action: QuickAction) => {
    console.log("Quick action clicked:", action.label);
    
    // Check if this is a report action
    if (action.label.toLowerCase().includes("report")) {
      setShowSubmissionForm(true);
      return;
    }
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "bot",
        content: action.response,
        timestamp: new Date()
      }
    ]);
  };

  const handleCloseChat = () => {
    setDetectedObject(null);
    setMessages([]);
    setShowCamera(false);
  };

  const startQuickDemo = (objectType: string) => {
    const object = getObjectByQRCode(objectType);
    if (object) {
      setDetectedObject(object);
      setShowCamera(true);
      setMessages([
        {
          id: "1",
          role: "bot",
          content: object.greeting,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleStartDetection = () => {
    setDetectionMode(true);
    setShowCamera(true);
  };

  const handleCapture = async () => {
    // Get video element from CameraView
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    
    if (!videoElement) {
      toast({
        title: "Error",
        description: "Camera not ready",
        variant: "destructive"
      });
      return;
    }

    await detect(videoElement);
  };

  const handleConfirmDetection = (objectType: string) => {
    const object = getObjectByQRCode(objectType);
    
    if (object) {
      setDetectedObject(object);
      setDetectionMode(false);
      setMessages([
        {
          id: "1",
          role: "bot",
          content: object.greeting,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleCloseDetection = () => {
    setDetectionMode(false);
    setShowCamera(false);
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  if (detectionMode && showCamera) {
    return (
      <CameraView ref={cameraRef} showCamera={true}>
        <DetectionOverlay
          isDetecting={isDetecting}
          lastResult={lastResult}
          onCapture={handleCapture}
          onClose={handleCloseDetection}
          onConfirm={handleConfirmDetection}
        />
      </CameraView>
    );
  }

  if (detectedObject && showCamera) {
    return (
      <CameraView ref={cameraRef} showCamera={true}>
        <ChatOverlay
          objectName={detectedObject.name}
          accentColor={detectedObject.accentColor}
          messages={messages}
          quickActions={detectedObject.quickActions}
          onActionClick={handleActionClick}
          onClose={handleCloseChat}
        />
        {showSubmissionForm && (
          <SubmissionForm
            objectData={detectedObject}
            cameraRef={cameraRef}
            onClose={() => setShowSubmissionForm(false)}
          />
        )}
      </CameraView>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header Card */}
        <div 
          className="rounded-3xl p-8 text-center"
          style={{
            background: "#1E88E5",
            backdropFilter: "blur(20px)",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="flex justify-center mb-6">
            <img 
              src={logoUrl} 
              alt="Circle T Logo" 
              className="w-24 h-24 sm:w-32 sm:h-32"
              data-testid="img-logo"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" data-testid="text-app-title">
            Council AR Assistant
          </h1>
          <p className="text-white text-lg" data-testid="text-app-description">
            Smart Object Recognition & Guidance System
          </p>
        </div>

        {/* Detection Methods */}
        <div 
          className="rounded-3xl p-6"
          style={{
            background: "#1E88E5",
            backdropFilter: "blur(20px)",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            Start Detection
          </h2>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 font-semibold rounded-xl py-8 w-full sm:w-auto sm:min-w-[300px]"
              style={{ color: "#1E88E5" }}
              onClick={handleStartDetection}
              data-testid="button-detect-object"
            >
              <Camera className="w-6 h-6 mr-2" />
              Detect Object (AI)
            </Button>
          </div>
        </div>

        {/* Demo Grid */}
        <div 
          className="rounded-3xl p-6"
          style={{
            background: "#1E88E5",
            backdropFilter: "blur(20px)",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4 text-center" data-testid="text-demo-label">
            Quick Demo
          </h2>
          <p className="text-sm text-white mb-6 text-center">
            Test without QR codes
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Graffiti Card */}
            <button
              className="rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95 bg-white"
              onClick={() => startQuickDemo("graffiti")}
              data-testid="button-demo-graffiti"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "#1E88E5" }}>
                  <SprayCan className="w-10 h-10" style={{ color: "#1E88E5" }} />
                </div>
              </div>
              <div className="font-bold text-lg mb-2" style={{ color: "#1E88E5" }}>Graffiti</div>
              <div className="text-gray-700 text-sm">Removal & Reporting</div>
            </button>

            {/* Syringe Card */}
            <button
              className="rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95 bg-white"
              onClick={() => startQuickDemo("syringe")}
              data-testid="button-demo-syringe"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "#1E88E5" }}>
                  <Syringe className="w-10 h-10" style={{ color: "#1E88E5" }} />
                </div>
              </div>
              <div className="font-bold text-lg mb-2" style={{ color: "#1E88E5" }}>Syringe</div>
              <div className="text-gray-700 text-sm">Safe Disposal</div>
            </button>

            {/* Dog Waste Card */}
            <button
              className="rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95 bg-white"
              onClick={() => startQuickDemo("dog-poop")}
              data-testid="button-demo-dog-poop"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "#1E88E5" }}>
                  <Dog className="w-10 h-10" style={{ color: "#1E88E5" }} />
                </div>
              </div>
              <div className="font-bold text-lg mb-2" style={{ color: "#1E88E5" }}>Dog Waste</div>
              <div className="text-gray-700 text-sm">Cleanup Guide</div>
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div 
          className="rounded-3xl p-6 text-center"
          style={{
            background: "#1E88E5",
            backdropFilter: "blur(20px)",
            border: "1px solid white"
          }}
        >
          <Link href="/admin">
            <Button
              className="bg-white hover:bg-gray-100 font-semibold rounded-xl"
              style={{ color: "#1E88E5" }}
              data-testid="button-admin"
            >
              View Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
