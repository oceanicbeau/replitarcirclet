import { useState, useEffect } from "react";
import { X, MapPin, Clock, Camera, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectData } from "@shared/schema";
import { CameraViewRef } from "./CameraView";

interface SubmissionFormProps {
  objectData: ObjectData;
  cameraRef: React.RefObject<CameraViewRef>;
  onClose: () => void;
}

export default function SubmissionForm({ objectData, cameraRef, onClose }: SubmissionFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<string>("Fetching location...");
  const [locationName, setLocationName] = useState<string>("Fetching location...");
  const [locationError, setLocationError] = useState(false);
  const [priority, setPriority] = useState<string>("priority1");

  const isGraffiti = objectData.type === "graffiti";

  useEffect(() => {
    // Get user's GPS coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const latDir = lat >= 0 ? "N" : "S";
          const lonDir = lon >= 0 ? "E" : "W";
          setGpsCoordinates(
            `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`
          );

          // Reverse geocoding to get place name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Council-AR-Assistant'
                }
              }
            );
            const data = await response.json();
            
            // Extract a meaningful place name from the response
            const address = data.address || {};
            const placeName = 
              address.amenity ||
              address.building ||
              address.park ||
              address.road ||
              address.suburb ||
              address.neighbourhood ||
              address.village ||
              address.town ||
              address.city ||
              data.display_name?.split(',')[0] ||
              "Location";
            
            setLocationName(placeName);
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setLocationName("Location");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(true);
          setGpsCoordinates("Location unavailable");
          setLocationName("Location unavailable");
        }
      );
    } else {
      setLocationError(true);
      setGpsCoordinates("Geolocation not supported");
      setLocationName("Geolocation not supported");
    }
  }, []);

  const mockData = {
    timestamp: new Date().toLocaleString()
  };

  const handleCapturePhoto = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.capturePhoto();
      // Use captured photo if available, otherwise use placeholder
      setCapturedPhoto(photo || "https://via.placeholder.com/400x300/1E88E5/FFFFFF?text=Photo+Captured");
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="rounded-3xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300"
          style={{
            background: "#1E88E5",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
          data-testid="container-submission-success"
        >
          <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2" data-testid="text-success-title">
            Incident Logged
          </h2>
          <p className="text-white/90" data-testid="text-success-message">
            Report submitted successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        style={{
          background: "white",
          border: "1px solid white",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
        data-testid="container-submission-form"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1E88E5" }} data-testid="text-form-title">
            Submit Report
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
            style={{ color: "#1E88E5" }}
            data-testid="button-close-form"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-address">
                Location
              </label>
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e0e0e0"
              }}
            >
              <p 
                className={`font-medium ${locationError ? 'text-gray-500 italic' : 'text-gray-900'}`}
                data-testid="text-address"
              >
                {locationName}
              </p>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-gps">
                GPS Coordinates
              </label>
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e0e0e0"
              }}
            >
              <p 
                className={`font-mono text-sm ${locationError ? 'text-gray-500 italic' : 'text-gray-900'}`}
                data-testid="text-gps"
              >
                {gpsCoordinates}
              </p>
            </div>
          </div>

          {/* Object Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-object-type">
                Object Type
              </label>
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e0e0e0"
              }}
            >
              <p className="text-gray-900 font-medium" data-testid="text-object-type">
                {objectData.name}
              </p>
            </div>
          </div>

          {/* Priority (Graffiti only) */}
          {isGraffiti && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: "#1E88E5" }} />
                <label className="font-semibold text-gray-700" data-testid="label-priority">
                  Priority Level
                </label>
              </div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg p-3 text-gray-900 font-medium"
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #e0e0e0"
                }}
                data-testid="select-priority"
              >
                <option value="priority1">Priority 1 (24hrs): Offensive/hate symbols, schools, main roads</option>
                <option value="priority2">Priority 2 (48hrs): Commercial areas, parks</option>
                <option value="priority3">Priority 3 (7 days): Low-visibility areas</option>
              </select>
            </div>
          )}

          {/* Photo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-photo">
                Photo
              </label>
            </div>
            {capturedPhoto ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid #e0e0e0"
                }}
              >
                <img
                  src={capturedPhoto}
                  alt="Object photo"
                  className="w-full h-48 object-cover"
                  data-testid="img-object-photo"
                />
              </div>
            ) : (
              <Button
                onClick={handleCapturePhoto}
                className="w-full text-white font-semibold py-6 rounded-xl"
                style={{
                  background: "#1E88E5",
                  border: "1px solid #1E88E5"
                }}
                data-testid="button-capture-photo"
              >
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </Button>
            )}
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-timestamp">
                Date & Time
              </label>
            </div>
            <div
              className="rounded-lg p-3"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e0e0e0"
              }}
            >
              <p className="text-gray-900" data-testid="text-timestamp">
                {mockData.timestamp}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full mt-6 text-white font-semibold py-6 rounded-xl"
          style={{
            background: "#1E88E5",
            border: "1px solid #1E88E5"
          }}
          data-testid="button-submit-report"
        >
          Submit Report
        </Button>
      </div>
    </div>
  );
}
