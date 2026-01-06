"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type React from "react";
import { useDeviceOrientation } from "../hooks/use-device-orientation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@urview/ui/components/alert-dialog";

interface DeviceOrientationContextType {
  orientation: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    absolute: boolean;
    webkitCompassHeading?: number;
    webkitCompassAccuracy?: number;
  } | null;
  isSupported: boolean;
  error: string | null;
  isListening: boolean;
  hasConsented: boolean;
  startListening: () => void;
  stopListening: () => void;
  revokeConsent: () => void;
}

const DeviceOrientationContext =
  createContext<DeviceOrientationContextType | null>(null);

interface DeviceOrientationProviderProps {
  children: React.ReactNode;
}

export function DeviceOrientationProvider({
  children,
}: DeviceOrientationProviderProps) {
  const {
    orientation,
    isSupported,
    error,
    requestPermission,
    startListening: hookStartListening,
    stopListening: hookStopListening,
    isListening,
  } = useDeviceOrientation();

  const [hasConsented, setHasConsented] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);

  // Verify that device orientation is still accessible
  const verifyAndSetConsent = useCallback(async () => {
    try {
      // Try to request permission to see if it's still granted
      const hasPermission = await requestPermission();
      if (hasPermission) {
        setHasConsented(true);
      } else {
        // Permission was revoked, clear stored consent
        if (typeof window !== "undefined") {
          localStorage.removeItem("device-orientation-consent");
        }
        setHasConsented(false);
      }
    } catch (error) {
      console.error("Failed to verify device orientation permission:", error);
      // Clear stored consent if verification fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("device-orientation-consent");
      }
      setHasConsented(false);
    }
  }, [requestPermission]);

  // Initialize consent state from localStorage and verify it still works
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedConsent = localStorage.getItem("device-orientation-consent");
      if (storedConsent === "granted") {
        // Verify that we can actually still start listening
        verifyAndSetConsent();
      }
    }
  }, [verifyAndSetConsent]);

  // Persist consent state to localStorage
  const updateConsentState = (consented: boolean) => {
    setHasConsented(consented);
    if (typeof window !== "undefined") {
      if (consented) {
        localStorage.setItem("device-orientation-consent", "granted");
      } else {
        localStorage.removeItem("device-orientation-consent");
      }
    }
  };

  // Check if we need to show consent dialog when starting listening
  const startListening = async () => {
    if (!isSupported) {
      return;
    }

    if (hasConsented) {
      try {
        // Verify permission is still valid before starting
        const hasPermission = await requestPermission();
        if (hasPermission) {
          hookStartListening();
        } else {
          // Permission was revoked, update state and show dialog
          updateConsentState(false);
          setPendingStart(true);
          setShowConsentDialog(true);
        }
      } catch (error) {
        console.error("Failed to start device orientation:", error);
        // Permission likely revoked, update state and show dialog
        updateConsentState(false);
        setPendingStart(true);
        setShowConsentDialog(true);
      }
    } else {
      setPendingStart(true);
      setShowConsentDialog(true);
    }
  };

  const stopListening = () => {
    hookStopListening();
    setPendingStart(false);
  };

  const handleConsent = async () => {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        updateConsentState(true);
        setShowConsentDialog(false);
        hookStartListening();

        if (pendingStart) {
          hookStartListening();
          setPendingStart(false);
        }
      }
    } catch (error) {
      console.error("Failed to request device orientation permission:", error);
    }
  };

  const handleDecline = () => {
    setShowConsentDialog(false);
    setPendingStart(false);
  };

  const revokeConsent = () => {
    updateConsentState(false);
    stopListening();
  };

  const contextValue: DeviceOrientationContextType = {
    orientation,
    isSupported,
    error,
    isListening,
    hasConsented,
    startListening,
    stopListening,
    revokeConsent,
  };

  // Auto-show consent dialog if device orientation is supported but not consented
  useEffect(() => {
    if (isSupported && !hasConsented) {
      // Only show dialog automatically if this is an interactive page that would benefit from device orientation
      // And only on mobile devices
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      if (isMobileDevice || isTouchDevice) {
        // Small delay to let the page load
        const timer = setTimeout(() => {
          setShowConsentDialog(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, hasConsented]);

  return (
    <DeviceOrientationContext.Provider value={contextValue}>
      {children}

      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Interactive Video Experience</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This immersive streaming experience requires access to your
              device's motion sensors.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="grid grid-cols-2 gap-2">
            <AlertDialogAction onClick={handleConsent}>Allow</AlertDialogAction>
            <AlertDialogCancel onClick={handleDecline}>
              Decline
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DeviceOrientationContext.Provider>
  );
}

export function useDeviceOrientationContext() {
  const context = useContext(DeviceOrientationContext);
  if (!context) {
    throw new Error(
      "useDeviceOrientationContext must be used within a DeviceOrientationProvider",
    );
  }
  return context;
}

export type { DeviceOrientationContextType };
