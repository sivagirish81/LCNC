import React from "react";
import { StartAvatarRequest } from "@heygen/streaming-avatar";

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
      <h1 className="text-2xl font-bold text-white">Interactive Avatar Demo</h1>
      <p className="text-zinc-400 text-center">Click one of the buttons below to start chatting with the avatar</p>
    </div>
  );
};
