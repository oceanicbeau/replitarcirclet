import { X } from "lucide-react";
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
  return (
    <div
      className="fixed top-32 left-4 right-4 max-w-md mx-auto z-30 animate-in slide-in-from-top duration-300"
      data-testid="container-chat-overlay"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-white text-sm" data-testid="text-chat-title">
            {objectName} Info
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
            data-testid="button-close-chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[50vh] px-4 pb-3">
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

        <div className="px-4 pb-4 pt-2">
          <QuickActionChips
            actions={quickActions}
            onActionClick={onActionClick}
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
}
