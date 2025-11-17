import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Syringe, Dog } from "lucide-react";
import QRScanner from "@/components/QRScanner";
import CameraView from "@/components/CameraView";
import ObjectIndicator from "@/components/ObjectIndicator";
import ChatOverlay from "@/components/ChatOverlay";
import { getObjectByQRCode } from "@/lib/objectData";
import { ChatMessage, ObjectData, QuickAction } from "@shared/schema";

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [detectedObject, setDetectedObject] = useState<ObjectData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCamera, setShowCamera] = useState(false);

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

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  if (detectedObject && showCamera) {
    return (
      <CameraView showCamera={true}>
        <ObjectIndicator
          objectName={detectedObject.name}
          icon={detectedObject.icon}
          accentColor={detectedObject.accentColor}
        />
        <ChatOverlay
          objectName={detectedObject.name}
          accentColor={detectedObject.accentColor}
          messages={messages}
          quickActions={detectedObject.quickActions}
          onActionClick={handleActionClick}
          onClose={handleCloseChat}
        />
      </CameraView>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-app-title">
            Council AR Assistant
          </h1>
          <p className="text-muted-foreground" data-testid="text-app-description">
            Scan objects to get instant guidance and safety information
          </p>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-lg"
          onClick={() => setShowScanner(true)}
          data-testid="button-scan-qr"
        >
          <QrCode className="w-6 h-6 mr-2" />
          Scan QR Code
        </Button>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center" data-testid="text-demo-label">
            Quick Demo (No QR code needed)
          </p>
          
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12 hover-elevate active-elevate-2"
              onClick={() => startQuickDemo("graffiti")}
              data-testid="button-demo-graffiti"
            >
              <span className="text-xl mr-3">🎨</span>
              <span>Graffiti Demo</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12 hover-elevate active-elevate-2"
              onClick={() => startQuickDemo("syringe")}
              data-testid="button-demo-syringe"
            >
              <Syringe className="w-5 h-5 mr-3" style={{ color: "hsl(24, 80%, 50%)" }} />
              <span>Syringe Demo</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12 hover-elevate active-elevate-2"
              onClick={() => startQuickDemo("dog-poop")}
              data-testid="button-demo-dog-poop"
            >
              <Dog className="w-5 h-5 mr-3" style={{ color: "hsl(30, 60%, 45%)" }} />
              <span>Dog Waste Demo</span>
            </Button>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center" data-testid="text-instructions">
            For full demo: Print QR codes with text "graffiti", "syringe", or "dog-poop"
          </p>
        </div>
      </div>
    </div>
  );
}
