import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Syringe, Camera } from "lucide-react";
import { Link } from "wouter";
import QRScanner from "@/components/QRScanner";
import CameraView, { CameraViewRef } from "@/components/CameraView";
import ChatOverlay from "@/components/ChatOverlay";
import SubmissionForm from "@/components/SubmissionForm";
import ContactForm from "@/components/ContactForm";
import DetectionOverlay from "@/components/DetectionOverlay";
import IframeChatbot from "@/components/IframeChatbot";
import { getObjectByQRCode } from "@/lib/objectData";
import { ChatMessage, ObjectData, QuickAction } from "@shared/schema";
import { useObjectDetection } from "@/hooks/useObjectDetection";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/ttt_1763355102252.png";

export default function Home() {
  const cameraRef = useRef<CameraViewRef>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const [showScanner, setShowScanner] = useState(false);
  const [detectedObject, setDetectedObject] = useState<ObjectData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [detectionMode, setDetectionMode] = useState(false);
  const [showCircleTChatbot, setShowCircleTChatbot] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const { detect, isDetecting, lastResult, isActive, startContinuous, stopContinuous, reset } = useObjectDetection({
    continuous: true,
    interval: 3000, // Detect every 3 seconds
    onError: (error) => {
      console.error("[Home] Detection error:", error);
      // Don't show error toast for continuous mode - errors are expected
    }
  });

  // Start continuous detection when camera opens in detection mode
  useEffect(() => {
    if (detectionMode && showCamera && !isPaused) {
      let mounted = true;
      let attempts = 0;
      const maxAttempts = 20; // Try for up to 2 seconds
      
      // Wait for video element to be ready with polling
      const checkVideo = () => {
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        
        if (!mounted) {
          return;
        }
        
        if (videoElement && videoElement.readyState >= 2) {
          console.log("[Home] Video ready, starting continuous detection");
          startContinuous(videoElement);
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`[Home] Waiting for video... attempt ${attempts}/${maxAttempts}`);
          setTimeout(checkVideo, 100);
        } else {
          console.error("[Home] Video element not ready after max attempts");
        }
      };
      
      // Start checking after a short delay
      const timer = setTimeout(checkVideo, 200);
      
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectionMode, showCamera, isPaused]); // Added isPaused to dependencies

  // Monitor detection results and pause for 30 seconds when object detected
  useEffect(() => {
    if (lastResult && lastResult.objectType !== "unknown" && lastResult.confidence >= 60 && isActive) {
      console.log("[Home] Object detected, pausing scanning for 30 seconds");
      
      // Stop continuous detection
      stopContinuous();
      setIsPaused(true);
      
      // Clear any existing pause timer
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      
      // Resume after 30 seconds
      pauseTimerRef.current = setTimeout(() => {
        console.log("[Home] Resuming scanning after 30 second pause");
        setIsPaused(false);
        pauseTimerRef.current = null;
      }, 30000);
    }
    
    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
    };
  }, [lastResult, isActive, stopContinuous]);

  const handleScan = (qrCode: string) => {
    console.log("QR Code scanned:", qrCode);
    const object = getObjectByQRCode(qrCode);
    
    if (object) {
      setDetectedObject(object);
      setShowScanner(false);
      setShowCamera(true);
      
      const initialMessages = [
        {
          id: "1",
          role: "bot" as const,
          content: object.greeting,
          timestamp: new Date()
        }
      ];
      
      // Add extra messages for Circle T logo
      if (object.type === "circle-t-logo") {
        initialMessages.push(
          {
            id: "2",
            role: "bot" as const,
            content: "Visit Circle T at www.circlet.com.au",
            timestamp: new Date()
          },
          {
            id: "3",
            role: "bot" as const,
            content: "We deliver business outcomes to digitally transform the global workplace.",
            timestamp: new Date()
          }
        );
      }
      
      setMessages(initialMessages);
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
    
    // Check if this is the Circle T Connect button
    if (action.id === "contact" || action.label.toLowerCase() === "connect") {
      setShowContactForm(true);
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

  const handleCloseCircleTChatbot = () => {
    setShowCircleTChatbot(false);
    setDetectedObject(null);
    setShowCamera(false); // Ensure camera stays off
  };

  const startQuickDemo = (objectType: string) => {
    const object = getObjectByQRCode(objectType);
    if (object) {
      setDetectedObject(object);
      setShowCamera(true);
      
      const initialMessages = [
        {
          id: "1",
          role: "bot" as const,
          content: object.greeting,
          timestamp: new Date()
        }
      ];
      
      if (object.type === "circle-t-logo") {
        initialMessages.push(
          {
            id: "2",
            role: "bot" as const,
            content: "Visit Circle T at www.circlet.com.au",
            timestamp: new Date()
          },
          {
            id: "3",
            role: "bot" as const,
            content: "We deliver business outcomes to digitally transform the global workplace.",
            timestamp: new Date()
          },
          {
            id: "4",
            role: "bot" as const,
            content: "Chat with Circle T Smart Assistant: https://www.circlet.com.au/showcase/Smart-QnA/",
            timestamp: new Date()
          }
        );
      }
      
      setMessages(initialMessages);
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
    console.log("[Home] Confirming detection:", objectType);
    stopContinuous();
    setDetectionMode(false); // Turn off detection mode FIRST
    
    const object = getObjectByQRCode(objectType);
    
    if (object) {
      setDetectedObject(object);
      
      const initialMessages = [
        {
          id: "1",
          role: "bot" as const,
          content: object.greeting,
          timestamp: new Date()
        }
      ];
      
      // Add extra messages for Circle T logo
      if (object.type === "circle-t-logo") {
        initialMessages.push(
          {
            id: "2",
            role: "bot" as const,
            content: "Visit Circle T at www.circlet.com.au",
            timestamp: new Date()
          },
          {
            id: "3",
            role: "bot" as const,
            content: "We deliver business outcomes to digitally transform the global workplace.",
            timestamp: new Date()
          }
        );
      }
      
      setMessages(initialMessages);
    }
  };

  const handleCloseDetection = () => {
    console.log("[Home] Closing detection");
    
    // Clear pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    
    // Reset pause state
    setIsPaused(false);
    
    // Reset detection state (clears lastResult and stops continuous detection)
    reset();
    
    setDetectionMode(false);
    setShowCamera(false);
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  if (showCircleTChatbot) {
    return (
      <IframeChatbot
        url="https://www.circlet.com.au/showcase/Smart-QnA/?msg=tell+me+about+circle+t+solutions"
        title="Circle T Smart Assistant"
        onClose={handleCloseCircleTChatbot}
      />
    );
  }

  if (detectionMode && showCamera) {
    return (
      <CameraView ref={cameraRef} showCamera={true}>
        <DetectionOverlay
          isDetecting={isDetecting}
          lastResult={lastResult}
          onClose={handleCloseDetection}
          onConfirm={handleConfirmDetection}
          continuousMode={true}
          isActive={isActive}
          isPaused={isPaused}
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
          isCircleT={detectedObject.type === "circle-t-logo"}
        />
        {showSubmissionForm && (
          <SubmissionForm
            objectData={detectedObject}
            cameraRef={cameraRef}
            onClose={() => setShowSubmissionForm(false)}
          />
        )}
        {showContactForm && (
          <ContactForm
            onClose={() => setShowContactForm(false)}
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
            AR Assistant
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
            Test without detection
          </p>
          
          <div className="flex justify-center">
            {/* Syringe Card */}
            <button
              className="rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95 bg-white w-full sm:w-auto sm:min-w-[300px]"
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
