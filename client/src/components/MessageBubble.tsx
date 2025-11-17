import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "bot" | "user";
  content: string;
  accentColor?: string;
}

export default function MessageBubble({ role, content, accentColor }: MessageBubbleProps) {
  const isBot = role === "bot";

  return (
    <div
      className={`flex gap-3 ${isBot ? "flex-row" : "flex-row-reverse"} mb-4`}
      data-testid={`message-${role}`}
    >
      {isBot && (
        <Avatar className="w-8 h-8 flex-shrink-0" data-testid="avatar-bot">
          <AvatarFallback
            className="text-white"
            style={{ backgroundColor: accentColor || "hsl(var(--primary))" }}
          >
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className="rounded-2xl px-4 py-3 max-w-[85%]"
        style={{
          backgroundColor: isBot ? "rgba(255, 255, 255, 0.9)" : accentColor || "rgba(255, 255, 255, 0.85)",
          color: isBot ? "#000" : "#fff",
          backdropFilter: "blur(8px)"
        }}
        data-testid={`bubble-${role}`}
      >
        <p className="text-sm leading-relaxed font-medium" data-testid="text-message-content">{content}</p>
      </div>
    </div>
  );
}
