
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PropertyMessageFormProps {
  ownerId: string;
  propertyId: string;
  propertyName: string;
}

const PropertyMessageForm = ({ ownerId, propertyId, propertyName }: PropertyMessageFormProps) => {
  const { user, loading } = useAuth();
  const { startConversation } = useMessaging();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un message");
      navigate("/auth");
      return;
    }
    
    if (!message.trim()) {
      toast.error("Veuillez saisir un message");
      return;
    }
    
    try {
      setSending(true);
      const success = await startConversation(ownerId, propertyId, message);
      
      if (success) {
        setMessage("");
        toast.success("Message envoyé avec succès!");
        navigate("/messaging");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };
  
  if (user?.id === ownerId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border text-center">
        <p>Vous êtes le propriétaire de ce logement</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-lg mb-2">Contacter le propriétaire</h3>
      <p className="text-sm text-gray-500 mb-4">
        Envoyez un message au propriétaire concernant {propertyName}
      </p>
      
      <form onSubmit={handleSendMessage}>
        <Textarea
          placeholder="Bonjour, je suis intéressé(e) par votre logement..."
          className="mb-4 min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending || loading || !user}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={sending || loading || !user || !message.trim()}
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Envoyer un message
            </>
          )}
        </Button>
        
        {!user && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Vous devez être connecté pour envoyer un message
          </p>
        )}
      </form>
    </div>
  );
};

export default PropertyMessageForm;
