
import { Message } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.sender_id;
  
  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: fr });
  };
  
  return (
    <div
      className={cn(
        "flex flex-col mb-4 max-w-[80%]",
        isOwnMessage ? "self-end items-end" : "self-start items-start"
      )}
    >
      <div className="flex items-end gap-2">
        <div
          className={cn(
            "rounded-lg py-2 px-3",
            isOwnMessage 
              ? "bg-kabyle-blue text-white rounded-br-none" 
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          )}
        >
          {!isOwnMessage && (
            <div className="text-xs text-gray-500 mb-1">
              {message.sender_name}
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {isOwnMessage && (
          <div className="text-gray-400">
            {message.status === 'seen' ? (
              <CheckCheck className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        {formatMessageTime(message.created_at)}
      </div>
    </div>
  );
};

export default MessageItem;
