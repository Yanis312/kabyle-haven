
import { useEffect } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationItem from "@/components/messaging/ConversationItem";
import ConversationView from "@/components/messaging/ConversationView";
import { ArrowLeft, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MessagingPage = () => {
  const { user, loading } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    loadingConversations 
  } = useMessaging();
  const navigate = useNavigate();
  
  // Set first conversation as current if none selected
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      setCurrentConversation(conversations[0]);
    }
  }, [conversations, currentConversation, setCurrentConversation]);
  
  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-kabyle-blue" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh] border rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="border-r">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          
          {loadingConversations ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-kabyle-blue" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
              <Inbox className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">Aucune conversation</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(70vh-60px)]">
              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={currentConversation?.id === conversation.id}
                  onClick={() => setCurrentConversation(conversation)}
                />
              ))}
            </ScrollArea>
          )}
        </div>
        
        {/* Conversation View */}
        <div className="md:col-span-2 flex flex-col">
          <ConversationView />
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
