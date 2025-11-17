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
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30 animate-in slide-in-from-bottom duration-300"
      data-testid="container-chat-overlay"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-end px-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            data-testid="button-close-chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-2 px-2">
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

        <div className="px-2">
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
