import StreamingAvatar, {
  ConnectionQuality,
  StreamingTalkingMessageEvent,
  UserTalkingMessageEvent,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import React, { useRef, useState } from "react";
import { getGeminiResponse } from "@/app/lib/gemini";

export enum StreamingAvatarSessionState {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

export enum MessageSender {
  CLIENT = "CLIENT",
  AVATAR = "AVATAR",
}

export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
}

type StreamingAvatarContextProps = {
  avatarRef: React.MutableRefObject<StreamingAvatar | null>;
  basePath?: string;

  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  isVoiceChatLoading: boolean;
  setIsVoiceChatLoading: (isVoiceChatLoading: boolean) => void;
  isVoiceChatActive: boolean;
  setIsVoiceChatActive: (isVoiceChatActive: boolean) => void;

  sessionState: StreamingAvatarSessionState;
  setSessionState: (sessionState: StreamingAvatarSessionState) => void;
  stream: MediaStream | null;
  setStream: (stream: MediaStream | null) => void;

  messages: Message[];
  clearMessages: () => void;
  handleUserTalkingMessage: ({
    detail,
  }: {
    detail: UserTalkingMessageEvent;
  }) => void;
  handleStreamingTalkingMessage: ({
    detail,
  }: {
    detail: StreamingTalkingMessageEvent;
  }) => void;
  handleEndMessage: () => void;

  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  isUserTalking: boolean;
  setIsUserTalking: (isUserTalking: boolean) => void;
  isAvatarTalking: boolean;
  setIsAvatarTalking: (isAvatarTalking: boolean) => void;

  connectionQuality: ConnectionQuality;
  setConnectionQuality: (connectionQuality: ConnectionQuality) => void;
};

const StreamingAvatarContext = React.createContext<StreamingAvatarContextProps>(
  {
    avatarRef: { current: null },
    isMuted: true,
    setIsMuted: () => {},
    isVoiceChatLoading: false,
    setIsVoiceChatLoading: () => {},
    sessionState: StreamingAvatarSessionState.INACTIVE,
    setSessionState: () => {},
    isVoiceChatActive: false,
    setIsVoiceChatActive: () => {},
    stream: null,
    setStream: () => {},
    messages: [],
    clearMessages: () => {},
    handleUserTalkingMessage: () => {},
    handleStreamingTalkingMessage: () => {},
    handleEndMessage: () => {},
    isListening: false,
    setIsListening: () => {},
    isUserTalking: false,
    setIsUserTalking: () => {},
    isAvatarTalking: false,
    setIsAvatarTalking: () => {},
    connectionQuality: ConnectionQuality.UNKNOWN,
    setConnectionQuality: () => {},
  },
);

const useStreamingAvatarSessionState = () => {
  const [sessionState, setSessionState] = useState(
    StreamingAvatarSessionState.INACTIVE,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);

  return {
    sessionState,
    setSessionState,
    stream,
    setStream,
  };
};

const useStreamingAvatarVoiceChatState = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);

  return {
    isMuted,
    setIsMuted,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
    isVoiceChatActive,
    setIsVoiceChatActive,
  };
};

const useStreamingAvatarMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentSenderRef = useRef<MessageSender | null>(null);
  const messageAvatarRef = useRef<StreamingAvatar | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUserTalkingMessage = async ({
    detail,
  }: {
    detail: UserTalkingMessageEvent;
  }) => {
    console.log('[CONTEXT] Received user message chunk:', detail.message);
    if (currentSenderRef.current === MessageSender.CLIENT) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, detail.message].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.CLIENT;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.CLIENT,
          content: detail.message,
        },
      ]);
    }
  };

  const handleStreamingTalkingMessage = ({
    detail,
  }: {
    detail: StreamingTalkingMessageEvent;
  }) => {
    if (currentSenderRef.current === MessageSender.AVATAR) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content: [prev[prev.length - 1].content, detail.message].join(""),
        },
      ]);
    } else {
      currentSenderRef.current = MessageSender.AVATAR;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.AVATAR,
          content: detail.message,
        },
      ]);
    }
  };

  const handleEndMessage = async () => {
    console.log('[CONTEXT] User finished speaking. Current sender:', currentSenderRef.current);
    if (currentSenderRef.current === MessageSender.CLIENT && !isProcessing) {
      setIsProcessing(true);
      console.log('[CONTEXT] Entering processing block for Gemini.');
      try {
        const lastMessage = messages[messages.length - 1];
        
        console.log('[CONTEXT] Inside try. messages array length:', messages.length);
        if (messages.length > 0) {
          console.log('[CONTEXT] lastMessage object (raw):', lastMessage);
          console.log('[CONTEXT] lastMessage.content:', lastMessage ? lastMessage.content : 'undefined');
          console.log('[CONTEXT] lastMessage.sender:', lastMessage ? lastMessage.sender : 'undefined');
        } else {
          console.log('[CONTEXT] messages array is empty inside try block.');
        }

        if (lastMessage && lastMessage.sender === MessageSender.CLIENT) {
          console.log('[CONTEXT] CONDITION MET: lastMessage.sender is CLIENT. Will call Gemini.');
          console.log('[CONTEXT] Last user message for Gemini:', lastMessage.content);
          const response = await getGeminiResponse(lastMessage.content);
          console.log('[CONTEXT] Gemini raw response:', response);
          if (messageAvatarRef.current && response) {
            console.log('[CONTEXT] Making avatar speak Gemini response:', response);
            messageAvatarRef.current.speak({
              text: response,
              taskType: TaskType.TALK,
              taskMode: TaskMode.ASYNC,
            });
          } else {
            if (!messageAvatarRef.current) console.log('[CONTEXT] messageAvatarRef is null, cannot speak.');
            if (!response) console.log('[CONTEXT] Gemini response is empty, cannot speak.');
          }
        } else {
          console.log('[CONTEXT] CRITICAL FAILURE: Condition (lastMessage && lastMessage.sender === MessageSender.CLIENT) was FALSE.');
          if (!lastMessage) console.log('[CONTEXT] Reason: lastMessage is null or undefined.');
          if (lastMessage && lastMessage.sender !== MessageSender.CLIENT) console.log('[CONTEXT] Reason: lastMessage.sender is NOT CLIENT. Actual sender:', lastMessage.sender);
        }
      } catch (error) {
        console.error('[CONTEXT] Error processing message with Gemini:', error);
      } finally {
        console.log('[CONTEXT] Exiting processing block. Resetting isProcessing.');
        setIsProcessing(false);
      }
    }
    currentSenderRef.current = null;
    console.log('[CONTEXT] handleEndMessage complete. currentSenderRef reset.');
  };

  return {
    messages,
    clearMessages: () => {
      setMessages([]);
      currentSenderRef.current = null;
    },
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    messageAvatarRef,
  };
};

const useStreamingAvatarListeningState = () => {
  const [isListening, setIsListening] = useState(false);

  return { isListening, setIsListening };
};

const useStreamingAvatarTalkingState = () => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  return {
    isUserTalking,
    setIsUserTalking,
    isAvatarTalking,
    setIsAvatarTalking,
  };
};

const useStreamingAvatarConnectionQualityState = () => {
  const [connectionQuality, setConnectionQuality] = useState(
    ConnectionQuality.UNKNOWN,
  );

  return { connectionQuality, setConnectionQuality };
};

export const StreamingAvatarProvider = ({
  children,
  basePath,
}: {
  children: React.ReactNode;
  basePath?: string;
}) => {
  const avatarRef = React.useRef<StreamingAvatar>(null);
  const voiceChatState = useStreamingAvatarVoiceChatState();
  const sessionState = useStreamingAvatarSessionState();
  const messageState = useStreamingAvatarMessageState();
  const listeningState = useStreamingAvatarListeningState();
  const talkingState = useStreamingAvatarTalkingState();
  const connectionQualityState = useStreamingAvatarConnectionQualityState();

  // Update messageAvatarRef when avatarRef changes
  React.useEffect(() => {
    if (messageState.messageAvatarRef) {
      messageState.messageAvatarRef.current = avatarRef.current;
    }
  }, [avatarRef.current, messageState.messageAvatarRef]);

  return (
    <StreamingAvatarContext.Provider
      value={{
        avatarRef,
        basePath,
        ...voiceChatState,
        ...sessionState,
        ...messageState,
        ...listeningState,
        ...talkingState,
        ...connectionQualityState,
      }}
    >
      {children}
    </StreamingAvatarContext.Provider>
  );
};

export const useStreamingAvatarContext = () => {
  return React.useContext(StreamingAvatarContext);
};
