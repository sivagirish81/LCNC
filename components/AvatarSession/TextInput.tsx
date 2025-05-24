import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useTextChat } from "../logic/useTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";
import { getGeminiResponse } from "@/app/lib/gemini";

interface ChatMessage {
  role: string;
  content: string;
}

export const TextInput: React.FC = () => {
  const { sendMessage } = useTextChat();
  const { startListening, stopListening } = useConversationState();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleSend = useCallback(async () => {
    if (message.trim() === "" || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Add user message to history
      const userMessage = { role: 'user', content: message };
      setChatHistory(prev => [...prev, userMessage]);

      // Get response from Gemini
      const geminiResponse = await getGeminiResponse(message, chatHistory);
      
      // Add assistant response to history
      const assistantMessage = { role: 'assistant', content: geminiResponse };
      setChatHistory(prev => [...prev, assistantMessage]);
      
      // Send the response to the avatar to speak
      await sendMessage(geminiResponse);
      
      setMessage("");
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsLoading(false);
    }
  }, [message, sendMessage, chatHistory, isLoading]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-row gap-2 items-end w-full">
      <Input
        className="min-w-[500px]"
        placeholder="Type something..."
        value={message}
        onChange={setMessage}
      />
      <Button 
        className="!p-2" 
        onClick={handleSend}
        disabled={isLoading}
      >
        <SendIcon size={20} />
      </Button>
    </div>
  );
};
