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
      className="fixed bottom-0 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-300"
      style={{ height: "33vh", maxHeight: "33vh" }}
      data-testid="container-chat-overlay"
    >
      <div className="h-full flex flex-col px-4 pb-4 pt-2">
        <div className="flex items-center justify-end mb-2">
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

        <ScrollArea className="flex-1 mb-3">
          <div className="space-y-2 pr-2">
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

        <div className="flex-shrink-0">
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
