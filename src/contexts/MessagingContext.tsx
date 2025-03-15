
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: MessageStatus;
  created_at: string;
  sender_name?: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  owner_id: string;
  property_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message?: Message;
  unread_count?: number;
  other_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  property?: {
    id: string;
    name: string;
    images?: string[];
  };
}

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  setCurrentConversation: (conversation: Conversation | null) => void;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  startConversation: (ownerId: string, propertyId: string, initialMessage: string) => Promise<boolean>;
  unreadCount: number;
  markMessagesAsSeen: (conversationId: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user's conversations
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            messages!messages_conversation_id_fkey (
              id,
              sender_id,
              content,
              status,
              created_at
            )
          `)
          .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });
        
        if (error) throw error;
        
        // Process conversations to add last message and other user details
        const conversationsWithDetails = await Promise.all(data.map(async (conv) => {
          // Determine the other user ID
          const otherUserId = conv.client_id === user.id ? conv.owner_id : conv.client_id;
          
          // Get the other user's details
          const { data: otherUserData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('id', otherUserId)
            .single();
            
          // Get property details if property_id exists
          let propertyData = null;
          if (conv.property_id) {
            const { data: property } = await supabase
              .from('guesthouses')
              .select('id, name, images')
              .eq('id', conv.property_id)
              .single();
            
            propertyData = property;
          }
          
          // Get last message
          const lastMessage = conv.messages && conv.messages.length > 0 
            ? conv.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null;
            
          // Count unread messages for the current user
          const unreadMessages = conv.messages 
            ? conv.messages.filter(m => m.sender_id !== user.id && m.status !== 'seen').length
            : 0;
            
          return {
            ...conv,
            last_message: lastMessage,
            unread_count: unreadMessages,
            other_user: otherUserData,
            property: propertyData,
            messages: undefined // Remove the messages array to avoid duplication
          };
        }));
        
        setConversations(conversationsWithDetails);
        
        // Calculate total unread count
        const totalUnread = conversationsWithDetails.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors du chargement des conversations");
      } finally {
        setLoadingConversations(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to real-time changes in the conversations table
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `client_id=eq.${user.id},owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Conversation change received:', payload);
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);
  
  // Fetch messages for current conversation
  useEffect(() => {
    if (!currentConversation || !user) return;
    
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:sender_id (
              first_name,
              last_name
            )
          `)
          .eq('conversation_id', currentConversation.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Process messages with sender info
        const processedMessages = data.map(msg => ({
          ...msg,
          sender_name: msg.profiles ? `${msg.profiles.first_name} ${msg.profiles.last_name}` : 'Unknown',
          profiles: undefined // Remove the profiles object to avoid duplication
        }));
        
        setMessages(processedMessages);
        
        // Mark messages as seen
        if (processedMessages.some(m => m.sender_id !== user.id && m.status !== 'seen')) {
          markMessagesAsSeen(currentConversation.id);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Erreur lors du chargement des messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to real-time changes in the messages table for the current conversation
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`
        },
        (payload) => {
          console.log('Message change received:', payload);
          fetchMessages();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [currentConversation, user]);
  
  // Send a message to the current conversation
  const sendMessage = async (content: string) => {
    if (!user || !currentConversation || !content.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          sender_id: user.id,
          content: content.trim(),
          status: 'sent'
        })
        .select();
        
      if (error) throw error;
      
      // Update local state optimistically
      const newMessage: Message = {
        ...data[0],
        sender_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'You'
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };
  
  // Start a new conversation with a property owner
  const startConversation = async (ownerId: string, propertyId: string, initialMessage: string) => {
    if (!user || !initialMessage.trim()) return false;
    
    try {
      // Check if a conversation already exists with this owner for this property
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .eq('owner_id', ownerId)
        .eq('property_id', propertyId)
        .maybeSingle();
      
      if (convError) throw convError;
      
      let conversationId;
      
      if (existingConv) {
        // Use existing conversation
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: user.id,
            owner_id: ownerId,
            property_id: propertyId
          })
          .select()
          .single();
          
        if (createError) throw createError;
        conversationId = newConv.id;
      }
      
      // Send initial message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: initialMessage.trim(),
          status: 'sent'
        });
        
      if (msgError) throw msgError;
      
      toast.success("Message envoyé avec succès!");
      return true;
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erreur lors de l'envoi du message");
      return false;
    }
  };
  
  // Mark messages in a conversation as seen
  const markMessagesAsSeen = async (conversationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'seen' })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .neq('status', 'seen');
        
      if (error) throw error;
      
      // Update unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
      
      // Recalculate total unread count
      setUnreadCount(prev => {
        const convUnreadCount = conversations.find(c => c.id === conversationId)?.unread_count || 0;
        return Math.max(0, prev - convUnreadCount);
      });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };
  
  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        messages,
        loadingConversations,
        loadingMessages,
        sendMessage,
        startConversation,
        unreadCount,
        markMessagesAsSeen
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};
