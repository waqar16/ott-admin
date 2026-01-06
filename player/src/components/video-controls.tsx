import {
  CompassIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { formatTime } from "../lib/utils";

interface VideoControlsProps {
  showControls: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  isGyroscopeEnabled: boolean;
  isGyroscopeAvailable: boolean;
  progressRef: React.RefObject<HTMLDivElement | null>;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onGyroscopeToggle: () => void;
  onFullscreenToggle: () => void;
}

export function VideoControls({
  showControls,
  progress,
  currentTime,
  duration,
  isPlaying,
  isMuted,
  isGyroscopeEnabled,
  isGyroscopeAvailable,
  progressRef,
  onProgressClick,
  onPlayPause,
  onMuteToggle,
  onGyroscopeToggle,
  onFullscreenToggle,
}: VideoControlsProps) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
    >
      {/* Progress bar */}
      <div
        ref={progressRef}
        className="w-full h-1.5 bg-gray-600 rounded-full mb-3 cursor-pointer relative"
        onClick={onProgressClick}
        onKeyDown={(e) => {
          // Add keyboard support for accessibility
          if (e.key === "Enter" || e.key === " ") {
            onProgressClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
      >
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            type="button"
            onClick={onPlayPause}
            className="text-white bg-transparent border-none cursor-pointer p-1 hover:bg-white/10 rounded-full"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon size={28} strokeWidth={2} />
            ) : (
              <PlayIcon size={28} strokeWidth={2} />
            )}
          </button>

          {/* Mute/Unmute button */}
          <button
            type="button"
            onClick={onMuteToggle}
            className="text-white bg-transparent border-none cursor-pointer p-1 hover:bg-white/10 rounded-full"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeXIcon size={24} strokeWidth={2} />
            ) : (
              <Volume2Icon size={24} strokeWidth={2} />
            )}
          </button>

          {/* Time display */}
          <div className="text-white text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gyroscope Control Button - only show on mobile devices */}
          {isGyroscopeAvailable && (
            <button
              type="button"
              onClick={onGyroscopeToggle}
              className={`text-white bg-transparent border-none cursor-pointer p-1 hover:bg-white/10 rounded-full ${isGyroscopeEnabled ? "text-blue-400" : "text-white/50"}`}
              title={
                isGyroscopeEnabled ? "Disable gyroscope" : "Enable gyroscope"
              }
            >
              <div className={isGyroscopeEnabled ? "" : "opacity-50"}>
                <CompassIcon size={24} strokeWidth={2} />
              </div>
            </button>
          )}

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={onFullscreenToggle}
            className="text-white bg-transparent border-none cursor-pointer p-1 hover:bg-white/10 rounded-full"
            title="Toggle fullscreen"
          >
            <MaximizeIcon size={24} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
