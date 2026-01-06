/** biome-ignore-all lint/a11y/noStaticElementInteractions: allow for now */
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoSphere } from "./video-sphere";
import { useDeviceOrientationContext } from "./device-orientation-provider";
import { VideoControls } from "./video-controls";

export interface PlayerProps {
  /**
   * The source URL for the 360° video
   */
  videoSrc: string;

  /**
   * Whether to show the debug information panel
   * @default false
   */
  showDebug?: boolean;
}

export function Player({ videoSrc, showDebug = false }: PlayerProps) {
  // Reference variables
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // State variables for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Media state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted, fall back to muted if autoplay fails

  // Get device orientation state from the provider context
  const {
    orientation,
    isSupported: isGyroscopeAvailable,
    isListening,
    startListening,
    stopListening,
    hasConsented,
  } = useDeviceOrientationContext();

  // Toggle gyroscope function using the provider
  const toggleGyroscope = useCallback(() => {
    if (isListening) {
      // Disable gyroscope
      stopListening();
    } else {
      // Enable gyroscope - consent is handled by the provider
      startListening();
    }
  }, [startListening, stopListening, isListening]);

  // Debug info
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Update debug info periodically
  useEffect(() => {
    if (!videoEl) return;

    const updateDebugInfo = () => {
      if (!videoEl) return;

      const info = {
        videoMuted: videoEl.muted,
        videoVolume: videoEl.volume,
        videoPlaying: !videoEl.paused,
        videoDuration: videoEl.duration,
        videoCurrentTime: videoEl.currentTime,
        isMutedState: isMuted,
        isPlayingState: isPlaying,
        gyroscopeListening: isListening,
        hasConsented: hasConsented,
        orientationData: orientation
          ? {
              alpha: orientation.alpha,
              beta: orientation.beta,
              gamma: orientation.gamma,
              absolute: orientation.absolute,
            }
          : null,
      };

      setDebugInfo(JSON.stringify(info, null, 2));
    };

    const debugInterval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(debugInterval);
  }, [videoEl, isMuted, isPlaying, isListening, hasConsented, orientation]);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    if (!videoEl) {
      console.log("Toggle mute clicked but video element is null");
      return;
    }

    console.log("Toggle mute clicked. Current muted state:", videoEl.muted);

    // Toggle the muted state
    const newMutedState = !videoEl.muted;
    videoEl.muted = newMutedState;

    // Log for debugging
    console.log("Mute state after toggle:", {
      muted: videoEl.muted,
      volume: videoEl.volume,
    });

    // Update React state
    setIsMuted(newMutedState);
  }, [videoEl]);

  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    if (!videoEl) {
      console.log("Toggle play/pause clicked but video element is null");
      return;
    }

    console.log(
      "Toggle play/pause clicked. Current state:",
      videoEl.paused ? "paused" : "playing",
    );

    if (videoEl.paused) {
      videoEl.play().catch((err) => {
        console.error("Error playing video:", err);

        // If playback fails and not muted, try with muted audio
        if (!videoEl.muted) {
          console.log("Trying playback with muted audio");
          videoEl.muted = true;
          setIsMuted(true);

          videoEl.play().catch((err2) => {
            console.error("Failed to play even with muted audio:", err2);
            setVideoError("Couldn't play video. Please try again.");
          });
        }
      });
    } else {
      videoEl.pause();
    }
  }, [videoEl]);

  // Handle initial play button click
  const handlePlayClick = useCallback(() => {
    if (!videoEl) {
      console.log("Play button clicked but video element is null");
      return;
    }

    console.log("Play button clicked. Attempting playback with audio.");

    // Try to play unmuted first
    videoEl.muted = false;
    setIsMuted(false);

    videoEl
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log("Video playback started successfully with audio");
      })
      .catch((err: Error) => {
        console.log("Unmuted playback failed, trying muted:", err);

        // If unmuted playback fails, try muted
        videoEl.muted = true;
        setIsMuted(true);

        videoEl
          .play()
          .then(() => {
            setIsPlaying(true);
            console.log("Video playback started successfully (muted)");
          })
          .catch((err2: Error) => {
            console.error("Both muted and unmuted playback failed:", err2);
            setVideoError(
              "Couldn't play video. Try again or check if your device supports video playback.",
            );
          });
      });
  }, [videoEl]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      } else {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error("Error entering fullscreen:", err);

          // Try iOS-specific fullscreen for Safari
          const videoContainer = containerRef.current as HTMLDivElement;
          if ("webkitEnterFullscreen" in videoContainer) {
            try {
              // Use a type declaration for the Safari-specific API
              interface WebkitHTMLElement extends HTMLDivElement {
                webkitEnterFullscreen: () => void;
              }
              (videoContainer as WebkitHTMLElement).webkitEnterFullscreen();
            } catch (iosErr) {
              console.error("iOS fullscreen failed:", iosErr);
            }
          }
        });
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  // Handle progress bar click to seek
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoEl) return;

      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const seekTime = pos * videoEl.duration;

      console.log(`Seeking to ${seekTime}s`);
      videoEl.currentTime = seekTime;
    },
    [videoEl],
  );

  // Reset controls timeout to hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Handle touch events for mobile devices
  useEffect(() => {
    const handleTouchMove = () => {
      setShowControls(true);
      resetControlsTimeout();
    };

    const handleTouchEnd = () => {
      resetControlsTimeout();
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [resetControlsTimeout]);

  // Hide controls after inactivity
  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout();

    resetControlsTimeout();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // When video is ready, setup event listeners and UI
  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    console.log("Video ready, setting up UI listeners");
    setVideoEl(video);

    // Log video properties for debugging
    console.log("Video properties:", {
      hasAudio:
        "mozHasAudio" in video
          ? // Use an interface extension to type the non-standard property
            !(video as HTMLVideoElement & { mozHasAudio: boolean }).mozHasAudio
          : "unknown",
      muted: video.muted,
      volume: video.volume,
      src: video.src,
    });

    // Event handler functions
    const handlePlay = () => {
      console.log("Video play event");
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log("Video pause event");
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Also update duration here as it might become available during playback
      if (
        video.duration &&
        video.duration !== Number.POSITIVE_INFINITY &&
        video.duration > 0
      ) {
        setDuration(video.duration);
      }

      // Calculate progress safely
      const validDuration =
        video.duration &&
        video.duration > 0 &&
        video.duration !== Number.POSITIVE_INFINITY;
      setProgress(
        validDuration ? (video.currentTime / video.duration) * 100 : 0,
      );
    };

    const handleMetadataLoaded = () => {
      console.log("Video metadata loaded:", {
        duration: video.duration,
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        muted: video.muted,
      });

      // Set duration if available and valid
      if (
        video.duration &&
        video.duration !== Number.POSITIVE_INFINITY &&
        video.duration > 0
      ) {
        setDuration(video.duration);
      }
    };

    const handleLoadedData = () => {
      console.log("Video data loaded, duration:", video.duration);
      // This event fires when the first frame is loaded
      // At this point, duration should be available for most formats
      if (
        video.duration &&
        video.duration !== Number.POSITIVE_INFINITY &&
        video.duration > 0
      ) {
        setDuration(video.duration);
      }
    };

    const handleDurationChange = () => {
      console.log("Duration changed:", video.duration);

      // Only update if we have a valid duration
      if (
        video.duration &&
        video.duration !== Number.POSITIVE_INFINITY &&
        video.duration > 0
      ) {
        setDuration(video.duration);
      }
    };

    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setVideoError(
        `Error loading video: ${video.error?.message || "unknown error"}`,
      );
    };

    const handleVolumeChange = () => {
      console.log("Video volume changed:", {
        muted: video.muted,
        volume: video.volume,
      });
      setIsMuted(video.muted);
    };

    // Set up event listeners
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleMetadataLoaded);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("error", handleError);
    video.addEventListener("volumechange", handleVolumeChange);

    // Try autoplay with muted audio
    if (video.paused) {
      try {
        // Try unmuted autoplay first
        video.muted = false;
        setIsMuted(false);

        video
          .play()
          .then(() => {
            console.log("Video autoplay succeeded with audio");
          })
          .catch((err) => {
            console.log("Unmuted autoplay failed, trying muted:", err);

            // Fall back to muted autoplay
            video.muted = true;
            setIsMuted(true);

            video
              .play()
              .then(() => {
                console.log("Video autoplay succeeded with muted audio");
              })
              .catch((err2) => {
                console.warn(
                  "All autoplay attempts failed, waiting for user interaction:",
                  err2,
                );
              });
          });
      } catch (err) {
        console.error("Error during autoplay attempt:", err);
      }
    }

    // Return cleanup function
    return () => {
      // Remove all event listeners when component unmounts
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("error", handleError);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  // Handle play state changes from VideoSphere
  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsPlaying(isPlaying);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-black"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Fallback screen showing loading or error state */}
      {videoError && !isPlaying ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black">
          <div className="text-red-500 text-center mb-4 px-4">{videoError}</div>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setVideoError(null);
              if (videoEl) {
                videoEl.load();
                handlePlayClick();
              }
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <Canvas
          camera={{
            position: [0, 0, 0.1],
            fov: 75,
            near: 0.1,
            far: 1000,
          }}
          onCreated={({ camera, gl }) => {
            // Initialize camera view direction on canvas creation
            camera.lookAt(0, 0, -1);

            // Mobile WebGL optimizations
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            console.log("Canvas created, camera initialized");
          }}
          fallback={
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Loading 360° viewer...</p>
            </div>
          }
        >
          <VideoSphere
            onVideoReady={handleVideoReady}
            isGyroscopeEnabled={isListening}
            videoSrc={videoSrc}
            onPlayStateChange={handlePlayStateChange}
          />
        </Canvas>
      )}

      {/* Debug display - only shown if showDebug is true */}
      {showDebug && debugInfo && (
        <div className="absolute top-0 right-0 bg-black/70 text-white text-xs p-2 z-30 font-mono max-w-xs overflow-auto">
          <pre>{debugInfo}</pre>
        </div>
      )}

      {/* Control bar */}
      <VideoControls
        showControls={showControls}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isMuted={isMuted}
        isGyroscopeEnabled={isListening}
        isGyroscopeAvailable={isGyroscopeAvailable}
        progressRef={progressRef}
        onProgressClick={handleProgressClick}
        onPlayPause={togglePlayPause}
        onMuteToggle={toggleMute}
        onGyroscopeToggle={() => toggleGyroscope()}
        onFullscreenToggle={toggleFullscreen}
      />
    </div>
  );
}
