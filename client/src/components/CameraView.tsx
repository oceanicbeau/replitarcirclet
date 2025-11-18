import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Info } from "lucide-react";

interface CameraViewProps {
  showCamera: boolean;
  children?: React.ReactNode;
}

export interface CameraViewRef {
  capturePhoto: () => string | null;
}

const CameraView = forwardRef<CameraViewRef, CameraViewProps>(({ showCamera, children }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      if (!videoRef.current) return null;
      
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
  }));

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setError("Unable to access camera");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera]);

  if (!showCamera) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black" data-testid="container-camera-view">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-6">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground" data-testid="text-camera-error">{error}</p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="video-camera-feed"
        />
      )}

      <div
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
        style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <span className="text-white font-semibold text-lg" data-testid="text-app-title">
          Council AR Assistant
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/20"
          data-testid="button-info"
        >
          <Info className="w-5 h-5" />
        </Button>
      </div>

      {children}
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;
