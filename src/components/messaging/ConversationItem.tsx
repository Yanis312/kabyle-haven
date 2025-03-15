
import { Conversation } from "@/contexts/MessagingContext";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem = ({ conversation, isActive, onClick }: ConversationItemProps) => {
  const { other_user, property, last_message, unread_count } = conversation;
  
  const formatLastMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: fr });
    } else if (isYesterday(date)) {
      return 'Hier';
    } else {
      return format(date, 'dd/MM/yyyy', { locale: fr });
    }
  };
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
        isActive 
          ? "bg-slate-100" 
          : "hover:bg-slate-50",
        unread_count && unread_count > 0
          ? "font-medium"
          : ""
      )}
      onClick={onClick}
    >
      <Avatar>
        <AvatarImage src={property?.images?.[0]} />
        <AvatarFallback className="bg-kabyle-terracotta text-white">
          {getInitials(other_user?.first_name, other_user?.last_name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm truncate">
            {other_user ? `${other_user.first_name} ${other_user.last_name}` : 'Utilisateur'}
          </h4>
          
          {last_message && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatLastMessageTime(last_message.created_at)}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">
            {property?.name || 'Logement sans nom'}
          </p>
          
          {unread_count && unread_count > 0 && (
            <Badge variant="destructive" className="rounded-full h-5 min-w-5 flex items-center justify-center">
              {unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
