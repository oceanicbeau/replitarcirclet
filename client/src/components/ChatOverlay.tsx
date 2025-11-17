import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import QuickActionChips from "./QuickActionChips";
import { ChatMessage, QuickAction } from "@shared/schema";

interface ChatOverlayProps {
  objectName: string;
  accentColor: string;
  messages: ChatMessage[];
  quickActions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  onClose: () => void;
}

export default function ChatOverlay({
  objectName,
  accentColor,
  messages,
  quickActions,
  onActionClick,
  onClose,
}: ChatOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
        isExpanded ? "h-[60vh]" : "h-24"
      }`}
      style={{
        backdropFilter: "blur(16px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
      data-testid="container-chat-overlay"
    >
      <div 
        className="absolute inset-x-0 top-0 h-12 flex items-center justify-between px-4 border-b"
        style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white hover:bg-white/20"
          data-testid="button-toggle-expand"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </Button>

        <span className="font-semibold text-white" data-testid="text-chat-title">
          {objectName} Information
        </span>

        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/20"
          data-testid="button-close-chat"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {isExpanded && (
        <>
          <ScrollArea className="h-[calc(60vh-120px)] px-4 pt-16 pb-4">
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </ScrollArea>

          <div 
            className="absolute bottom-0 left-0 right-0 p-4 border-t"
            style={{ 
              borderColor: "rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(0, 0, 0, 0.2)"
            }}
          >
            <QuickActionChips
              actions={quickActions}
              onActionClick={onActionClick}
              accentColor={accentColor}
            />
          </div>
        </>
      )}
    </div>
  );
}
