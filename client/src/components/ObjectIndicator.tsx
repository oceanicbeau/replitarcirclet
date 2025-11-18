import { Badge } from "@/components/ui/badge";

interface ObjectIndicatorProps {
  objectName: string;
  icon: string;
  accentColor: string;
}

export default function ObjectIndicator({ objectName, icon, accentColor }: ObjectIndicatorProps) {
  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top duration-300"
      data-testid="container-object-indicator"
    >
      <div
        className="rounded-2xl px-6 py-3 shadow-lg bg-white flex items-center"
        style={{
          border: "2px solid #1E88E5"
        }}
      >
        <span className="font-bold text-lg" style={{ color: "#1E88E5" }} data-testid="text-object-name">{objectName}</span>
      </div>
    </div>
  );
}
