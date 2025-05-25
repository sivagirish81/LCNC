'use client';

import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  UserTalkingMessageEvent,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";
import dynamic from 'next/dynamic';

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { useStreamingAvatarContext } from "./logic/context";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

const FaceRecognition = dynamic(() => import('./FaceRecognition'), {
  ssr: false,
});

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "Katya_Black_Suit_public",
  knowledgeId: "6d17dbd4ae3347c3bed2677e2893db58",
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.LIVEKIT,
  sttSettings: {
    provider: STTProvider.DEEPGRAM
  }
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { handleUserTalkingMessage, handleEndMessage } = useStreamingAvatarContext();
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const mediaStream = useRef<HTMLVideoElement>(null);

  const handleFaceRecognition = (isRecognized: boolean) => {
    if (isRecognized) {
      setIsFaceDetected(true);
      setConfig({
        ...DEFAULT_CONFIG,
        knowledgeId: "6d17dbd4ae3347c3bed2677e2893db58"
      });
      // Automatically start voice chat when face is detected
      startSessionV2(true);
    }
  };

  // Reference images array
  const referenceImages = [
    '/reference-images/Image1.jpeg',
    '/reference-images/Image2.jpeg',
    '/reference-images/Image3.jpeg',
    '/reference-images/Image4.jpeg'
  ];

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        event.stopPropagation?.();
        handleUserTalkingMessage(event);
      });

      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        event.stopPropagation?.();
        handleEndMessage();
      });

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      {!isFaceDetected ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4 text-white">Face Recognition Required</h1>
          <FaceRecognition 
            onRecognitionResult={handleFaceRecognition}
            referenceImages={referenceImages}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
            <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
              {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                <AvatarVideo ref={mediaStream} />
              ) : (
                <AvatarConfig config={DEFAULT_CONFIG} onConfigChange={() => {}} />
              )}
            </div>
            <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarControls />
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <div className="flex flex-row gap-4">
                  <LoadingIcon />
                  <span className="text-white">Starting voice chat...</span>
                </div>
              ) : (
                <LoadingIcon />
              )}
            </div>
          </div>
          {sessionState === StreamingAvatarSessionState.CONNECTED && (
            <MessageHistory />
          )}
        </>
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
