import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useGeminiChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    try {
      setIsLoading(true);
      
      // Add user message to history
      const userMessage: ChatMessage = { role: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);

      // Send to backend
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: chatHistory,
        }),
      });

      const data = await response.json();

      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory]);

  return {
    chatHistory,
    sendMessage,
    isLoading,
  };
}; 