'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Hls from 'hls.js';

// WebXR polyfill types
declare global {
  interface Navigator {
    xr?: {
      isSessionSupported: (mode: string) => Promise<boolean>;
      requestSession: (mode: string, options?: any) => Promise<any>;
    };
  }
}

export interface VRPlayerProps {
  src: string;
  poster?: string;
  is360?: boolean;
  isStereo?: boolean;
  initialBitrate?: number;
  autoPlay?: boolean;
  onQualityChange?: (level: number, bitrate: number) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface VideoSphereProps {
  videoElement: HTMLVideoElement;
  isStereo: boolean;
}

function VideoSphere({ videoElement, isStereo }: VideoSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (videoElement && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
      const texture = new THREE.VideoTexture(videoElement);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // For stereoscopic video, we only use half the texture (side-by-side format)
      if (isStereo) {
        texture.repeat.set(0.5, 1);
        texture.offset.set(0, 0);
      }
      
      setVideoTexture(texture);
    }
  }, [videoElement, isStereo]);

  useFrame(() => {
    if (videoTexture && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
      videoTexture.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial 
        map={videoTexture} 
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

interface SceneProps {
  videoElement: HTMLVideoElement;
  isStereo: boolean;
  isCardboardMode: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

function Scene({ videoElement, isStereo, isCardboardMode }: SceneProps) {
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 0.1);
    camera.fov = 75;
    camera.updateProjectionMatrix();
  }, [camera]);

  // WebXR session management
  useEffect(() => {
    if (!gl || !gl.xr) return;
    
    // Configure XR for VR
    gl.xr.enabled = true;
  }, [gl]);

  return (
    <>
      <VideoSphere videoElement={videoElement} isStereo={isStereo} />
      {!isCardboardMode && (
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={-0.5}
          minDistance={0.1}
          maxDistance={1}
          target={[0, 0, 0]}
        />
      )}
    </>
  );
}

export function VRPlayer({
  src,
  poster,
  is360 = true,
  isStereo = false,
  initialBitrate,
  autoPlay = false,
  onQualityChange,
  onError,
  className = '',
}: VRPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualityLevels, setQualityLevels] = useState<{ index: number; name: string; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // WebXR and VR mode states
  const [supportsWebXR, setSupportsWebXR] = useState(false);
  const [isInXR, setIsInXR] = useState(false);
  const [isCardboardMode, setIsCardboardMode] = useState(false);
  const [showVRMenu, setShowVRMenu] = useState(false);

  // Check WebXR support
  useEffect(() => {
    const checkWebXR = async () => {
      if (navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setSupportsWebXR(supported);
        } catch (error) {
          console.log('WebXR not supported:', error);
          setSupportsWebXR(false);
        }
      } else {
        setSupportsWebXR(false);
      }
    };
    
    checkWebXR();
  }, []);

  // Keyboard controls for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default only for player controls
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'v':
          if (is360) {
            e.preventDefault();
            setShowVRMenu(!showVRMenu);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, volume, is360, showVRMenu]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Setup HLS
    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: initialBitrate !== undefined ? initialBitrate : -1,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        
        const levels = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : `Level ${index}`,
        }));

        setQualityLevels(levels);
        setCurrentQuality(hls.currentLevel);

        // Apply playback preferences (bitratePreset) similar to VideoPlayer
        try {
          const raw = localStorage.getItem('ott_playback_preferences');
          if (raw) {
            const prefs = JSON.parse(raw);
            if (prefs?.bitratePreset && prefs.bitratePreset !== 'auto') {
              const target = prefs.bitratePreset === 'custom' ? prefs.customBitrate * 1000 :
                prefs.bitratePreset === 'high' ? 5000 * 1000 :
                prefs.bitratePreset === 'medium' ? 2500 * 1000 :
                prefs.bitratePreset === 'low' ? 1000 * 1000 : undefined;
              if (target) {
                let closest = -1; let diff = Infinity;
                hls.levels.forEach((lvl, idx) => {
                  const d = Math.abs(lvl.bitrate - target);
                  if (d < diff) { diff = d; closest = idx; }
                });
                if (closest >= 0) {
                  hls.currentLevel = closest;
                  setCurrentQuality(closest);
                }
              }
            }
          }
        } catch {}

        if (autoPlay) {
          video.play().catch((error) => {
            console.error('Autoplay failed:', error);
            if (onError) onError('Autoplay failed');
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
        const level = hls.levels[data.level];
        if (onQualityChange && level) {
          onQualityChange(data.level, level.bitrate);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (onError) onError('Fatal playback error');
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      setIsLoading(false);

      if (autoPlay) {
        video.play().catch((error) => {
          console.error('Autoplay failed:', error);
          if (onError) onError('Autoplay failed');
        });
      }
    } else {
      console.error('HLS is not supported');
      if (onError) onError('HLS is not supported in this browser');
      setIsLoading(false);
    }
  }, [src, autoPlay, initialBitrate, onError, onQualityChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleLoadedData = () => {
      setIsVideoReady(true);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      if (value === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
      // Persist selection
      try {
        const raw = localStorage.getItem('ott_playback_preferences');
        const prefs = raw ? JSON.parse(raw) : {};
        prefs.bitratePreset = 'custom';
        const level = hlsRef.current.levels[levelIndex];
        if (level) prefs.customBitrate = Math.round(level.bitrate / 1000);
        localStorage.setItem('ott_playback_preferences', JSON.stringify(prefs));
      } catch {}
    }
  };

  const enterXR = async () => {
    if (!navigator.xr || !canvasRef.current) return;

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor']
      });

      setIsInXR(true);
      
      session.addEventListener('end', () => {
        setIsInXR(false);
      });

      // The three.js renderer will handle the XR session
      console.log('XR session started');
    } catch (error) {
      console.error('Failed to enter XR:', error);
      if (onError) onError('Failed to enter VR mode');
    }
  };

  const toggleCardboardMode = () => {
    setIsCardboardMode(!isCardboardMode);
    setShowVRMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Hidden Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        className="hidden"
        playsInline
        crossOrigin="anonymous"
      />

      {/* 360 Canvas */}
      {is360 && videoRef.current && isVideoReady && (
        <div className="w-full h-full">
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 0, 0.1], fov: 75 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Scene 
              videoElement={videoRef.current} 
              isStereo={isStereo}
              isCardboardMode={isCardboardMode}
            />
          </Canvas>
        </div>
      )}

      {/* Fallback: Regular Video Display */}
      {!is360 && (
        <video
          ref={videoRef}
          poster={poster}
          className="w-full h-full"
          playsInline
          crossOrigin="anonymous"
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4 mx-auto"></div>
            <p className="text-white">Loading {is360 ? '360° ' : ''}Video...</p>
          </div>
        </div>
      )}

      {/* VR Mode Indicator and Controls */}
      {is360 && !isLoading && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {/* Mode Indicator */}
          <div className="bg-black bg-opacity-70 px-3 py-1 rounded-lg">
            <span className="text-white text-sm font-medium">
              {isInXR ? '🥽 VR Mode' : isCardboardMode ? '📱 Cardboard' : '360° View'}
              {!isCardboardMode && ' | Drag to look around'}
            </span>
          </div>

          {/* VR Mode Buttons */}
          <div className="flex gap-2">
            {/* WebXR Button (if supported) */}
            {supportsWebXR && !isInXR && (
              <button
                onClick={enterXR}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg flex items-center gap-2"
                aria-label="Enter Virtual Reality mode"
                title="Enter VR (WebXR)"
              >
                <span className="text-lg">🥽</span>
                Enter VR
              </button>
            )}

            {/* VR Options Menu Toggle */}
            {!isInXR && (
              <div className="relative">
                <button
                  onClick={() => setShowVRMenu(!showVRMenu)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition"
                  aria-label="VR viewing options"
                  title="VR Options (Press V)"
                >
                  <span className="text-lg">⚙️</span>
                </button>

                {/* VR Menu Dropdown */}
                {showVRMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-black bg-opacity-95 rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50">
                    <div className="px-3 py-2 border-b border-gray-700">
                      <span className="text-white text-xs font-semibold uppercase">VR Modes</span>
                    </div>
                    
                    <button
                      onClick={toggleCardboardMode}
                      className={`block w-full text-left px-4 py-3 text-white hover:bg-purple-600 transition ${
                        isCardboardMode ? 'bg-purple-700' : ''
                      }`}
                      aria-label="Toggle Cardboard VR mode"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📱</span>
                        <div>
                          <div className="font-medium">Cardboard Mode</div>
                          <div className="text-xs text-gray-300">
                            {isCardboardMode ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                    </button>

                    {!supportsWebXR && (
                      <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-700">
                        ℹ️ WebXR not supported on this device
                      </div>
                    )}

                    <div className="px-4 py-2 bg-gray-900 text-xs text-gray-400">
                      <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                      <div>V - VR Menu</div>
                      <div>F - Fullscreen</div>
                      <div>Space/K - Play/Pause</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              aria-label="Video timeline seek (Arrow Left/Right or J/L)"
              title={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 transition"
                aria-label={isPlaying ? 'Pause video (Space or K)' : 'Play video (Space or K)'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-red-500 transition"
                  aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                  aria-label="Volume control (Arrow Up/Down)"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-red-500 transition px-3 py-1 border border-white rounded"
                    aria-label="Video quality settings"
                    title="Change quality"
                  >
                    {currentQuality === -1
                      ? 'Auto'
                      : qualityLevels[currentQuality]?.name || 'Quality'}
                  </button>

                  {showQualityMenu && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded shadow-lg overflow-hidden"
                      role="menu"
                      aria-label="Quality options"
                    >
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`block w-full text-left px-4 py-2 text-white hover:bg-red-600 transition ${
                          currentQuality === -1 ? 'bg-red-700' : ''
                        }`}
                        role="menuitem"
                        aria-label="Auto quality"
                      >
                        Auto
                      </button>
                      {qualityLevels.map((level) => (
                        <button
                          key={level.index}
                          onClick={() => changeQuality(level.index)}
                          className={`block w-full text-left px-4 py-2 text-white hover:bg-red-600 transition ${
                            currentQuality === level.index ? 'bg-red-700' : ''
                          }`}
                          role="menuitem"
                          aria-label={`${level.name} quality, ${Math.round(level.bitrate / 1000)} kbps`}
                        >
                          {level.name} ({Math.round(level.bitrate / 1000)}kbps)
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-transform hover:scale-110 pointer-events-auto"
            aria-label="Play video"
            title="Play (Space or K)"
          >
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
