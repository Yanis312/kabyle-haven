
import { useRef, useEffect } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import MessageItem from "./MessageItem";
import { useState } from "react";

const ConversationView = () => {
  const { currentConversation, messages, sendMessage, loadingMessages } = useMessaging();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage("");
  };
  
  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Aucune conversation sélectionnée</h3>
        <p className="text-gray-500">
          Sélectionnez une conversation dans la liste ou commencez-en une nouvelle
        </p>
      </div>
    );
  }
  
  const otherUser = currentConversation.other_user;
  const property = currentConversation.property;
  
  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="border-b p-4">
        <h3 className="font-semibold">
          {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Utilisateur'}
        </h3>
        {property && (
          <p className="text-sm text-gray-500">{property.name}</p>
        )}
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-center text-gray-500">
            <p>Aucun message dans cette conversation.<br />Envoyez-en un pour commencer.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map(message => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationView;
