import { useState } from "react";
import { X, MapPin, Clock, Camera, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObjectData } from "@shared/schema";

interface SubmissionFormProps {
  objectData: ObjectData;
  onClose: () => void;
}

export default function SubmissionForm({ objectData, onClose }: SubmissionFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const mockData = {
    address: "Garden City Playground",
    gpsCoordinates: "40.7128° N, 74.0060° W",
    timestamp: new Date().toLocaleString(),
    photoUrl: "https://via.placeholder.com/400x300/1E88E5/FFFFFF?text=Object+Photo"
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
              <p className="text-gray-900 font-medium" data-testid="text-address">
                {mockData.address}
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
              <p className="text-gray-900 font-mono text-sm" data-testid="text-gps">
                {mockData.gpsCoordinates}
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

          {/* Photo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: "#1E88E5" }} />
              <label className="font-semibold text-gray-700" data-testid="label-photo">
                Photo
              </label>
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid #e0e0e0"
              }}
            >
              <img
                src={mockData.photoUrl}
                alt="Object photo"
                className="w-full h-48 object-cover"
                data-testid="img-object-photo"
              />
            </div>
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
