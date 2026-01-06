import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DeviceOrientationControls } from "../lib/device-orientation-controls";
import { useFrame, useThree } from "@react-three/fiber";
import { clamp } from "../lib/utils";
import { HLSManager } from "../lib/hls-manager";

export interface VideoSphereProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isGyroscopeEnabled: boolean;
  videoSrc: string;
  onPlayStateChange: (isPlaying: boolean) => void;
}

export function VideoSphere({
  onVideoReady,
  isGyroscopeEnabled,
  videoSrc,
  onPlayStateChange,
}: VideoSphereProps) {
  const [video] = useState(() => {
    const vid = document.createElement("video");
    vid.crossOrigin = "anonymous";
    vid.loop = false;
    vid.muted = false; // Start unmuted, we'll handle muting if autoplay fails
    vid.playsInline = true; // Critical for iOS
    vid.preload = "auto"; // Force preloading for mobile

    // Debug video loading issues
    vid.onerror = (e) => {
      console.error("Video error:", e);
    };

    return vid;
  });

  const [texture] = useState(() => {
    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    // Apply a rotation to the texture itself
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI;
    return tex;
  });

  const { camera, gl } = useThree();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const orbitControlsRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const deviceControlsRef = useRef<DeviceOrientationControls | null>(null);
  const hlsManagerRef = useRef<HLSManager | null>(null);

  // Enable WebGL compatibility mode for mobile
  useEffect(() => {
    // Force the renderer to use appropriate settings for mobile
    if (gl) {
      try {
        // Use proper THREE.js properties available in this version
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;

        // Mobile-specific settings
        gl.setClearColor(0x000000, 1);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Check for WebGL capabilities
        console.log("WebGL capabilities:", {
          isWebGL2: gl.capabilities.isWebGL2,
          maxTextures: gl.capabilities.maxTextures,
        });
      } catch (err) {
        console.error("WebGL configuration error:", err);
      }
    }
  }, [gl]);

  // Initialize video playback
  useEffect(() => {
    // Create HLS manager instance
    hlsManagerRef.current = new HLSManager(video, {
      onVideoReady,
      onPlayStateChange,
    });

    // Initialize with video source
    hlsManagerRef.current.initialize(videoSrc);

    // Cleanup
    return () => {
      hlsManagerRef.current?.destroy();
      hlsManagerRef.current = null;
    };
  }, [video, videoSrc, onVideoReady, onPlayStateChange]);

  // Force video texture updates and device controls update
  useFrame(() => {
    if (texture && video.readyState >= 2) {
      // Only update when video has loaded first frame
      texture.needsUpdate = true;
    }

    // Ensure mesh is visible
    if (meshRef.current) {
      meshRef.current.visible = true;
    }

    // Update device orientation controls if enabled
    if (deviceControlsRef.current && isGyroscopeEnabled) {
      deviceControlsRef.current.update();
    }
  });

  // Set initial camera orientation
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // Position the camera at the center
      camera.position.set(0, 0, 0.1);
      // Look at negative Z axis
      camera.lookAt(0, 0, -1);
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Set initial controls state
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.set(0, 0, -1);
      orbitControlsRef.current.update();
    }
  }, []);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleZoom = (e: WheelEvent) => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = clamp(camera.fov + e.deltaY / 10, 30, 90);
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener("wheel", handleZoom);
    return () => window.removeEventListener("wheel", handleZoom);
  }, [camera]);

  // Setup device orientation controls for mobile devices
  useEffect(() => {
    if (!camera) return;

    const cleanupDeviceControls = () => {
      if (deviceControlsRef.current) {
        deviceControlsRef.current.disconnect();
        deviceControlsRef.current = null;

        // Re-enable orbit controls when device controls are disabled
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
      }
    };

    // Only create device controls if gyroscope is enabled
    if (isGyroscopeEnabled) {
      console.log("Setting up device orientation controls");

      // Disable orbit controls when device controls are enabled
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = false;
      }

      // Create and connect device orientation controls
      const deviceControls = new DeviceOrientationControls(camera);
      deviceControlsRef.current = deviceControls;

      deviceControls.connect().then((success) => {
        console.log("Device orientation controls initialized:", success);

        // If device orientation is not available, fall back to orbit controls
        if (!success && orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
      });
    } else {
      // Clean up device controls when disabled
      cleanupDeviceControls();
    }

    // Cleanup on unmount
    return cleanupDeviceControls;
  }, [camera, isGyroscopeEnabled]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        target={new THREE.Vector3(0, 0, -1)}
        // Enable touch controls for mobile devices
        enableRotate={!isGyroscopeEnabled} // Disable when gyroscope is active
        rotateSpeed={-0.5} // Negative value to invert the rotation direction
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
      {/* Scale Y to -1 to flip the sphere, maintain rotation for centering */}
      <mesh ref={meshRef} rotation={[0, Math.PI / 2, 0]} scale={[1, -1, 1]}>
        <sphereGeometry args={[30, 64, 64]} />
        {texture && (
          <meshBasicMaterial
            map={texture}
            side={THREE.BackSide}
            toneMapped={false}
          />
        )}
      </mesh>
    </>
  );
}
