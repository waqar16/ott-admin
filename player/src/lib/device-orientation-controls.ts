import * as THREE from "three";

/**
 * Extended Window interface with legacy browser properties
 */
declare namespace globalThis {
  interface Window {
    MSStream?: unknown;
    orientation?: number;
    __DeviceOrientationControls?: typeof DeviceOrientationControls;
    __requestOrientationPermission?: typeof DeviceOrientationControls.requestPermission;
  }
}

/**
 * Extended DeviceOrientationEvent interface with iOS permission API
 */
interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>;
}

/**
 * Extended DeviceOrientationEvent constructor with iOS permission API
 */
interface ExtendedDeviceOrientationEventConstructor {
  requestPermission?: () => Promise<string>;
}

/**
 * Device Orientation Controls for Three.js
 * Handles device orientation events with special handling for iOS
 */
export class DeviceOrientationControls {
  private camera: THREE.Camera;
  private deviceOrientation: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    orientation: number | null;
  };
  private screenOrientation: number;
  private enabled: boolean;
  private alphaOffset: number;
  private initialAlphaOffset: number;
  // Function references to avoid recreating them for every event
  private onDeviceOrientationChangeEvent: (
    event: DeviceOrientationEvent,
  ) => void;
  private onScreenOrientationChangeEvent: () => void;
  private onTouchStartEvent: (event: TouchEvent) => void;
  private zee: THREE.Vector3;
  private euler: THREE.Euler;
  private q0: THREE.Quaternion;
  private q1: THREE.Quaternion;
  private quaternion: THREE.Quaternion;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.deviceOrientation = {
      alpha: null,
      beta: null,
      gamma: null,
      orientation: null,
    };
    this.screenOrientation = 0;
    this.enabled = false;
    this.alphaOffset = 0;
    this.initialAlphaOffset = 0;

    // Initialize vectors and quaternions
    this.zee = new THREE.Vector3(0, 0, 1);
    this.euler = new THREE.Euler();
    this.q0 = new THREE.Quaternion();
    this.q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
    this.quaternion = new THREE.Quaternion();

    // Bind event handlers
    this.onDeviceOrientationChangeEvent =
      this.handleDeviceOrientationChange.bind(this);
    this.onScreenOrientationChangeEvent =
      this.handleScreenOrientationChange.bind(this);
    this.onTouchStartEvent = this.handleTouchStart.bind(this);
  }

  /**
   * Sets the initial alpha offset to maintain the current view when enabling controls
   */
  private setInitialState(): void {
    if (this.deviceOrientation.alpha !== null) {
      this.initialAlphaOffset = this.deviceOrientation.alpha;
    }
  }

  /**
   * Handle device orientation change events
   */
  private handleDeviceOrientationChange(event: DeviceOrientationEvent): void {
    this.deviceOrientation = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      orientation: window.orientation || 0,
    };
  }

  /**
   * Handle screen orientation changes
   */
  private handleScreenOrientationChange(): void {
    this.screenOrientation = window.orientation || 0;
  }

  /**
   * Special handler for touch events to help with iOS permission model
   */
  private handleTouchStart(event: TouchEvent): void {
    // We only want to reset the orientation when initially enabling the controls,
    // not on every touch event, which causes the "jumping" effect
    //
    // The touch event handler is primarily for iOS permission handling and
    // should not reset the view once controls are already established

    // Do nothing when controls are already enabled to prevent view jumps
    if (this.enabled) {
      // Intentionally not calling setInitialState() on every touch
      // This prevents the jumping effect when tapping the screen
      return;
    }

    // Only set initial state when first enabling the controls
    if (event.touches.length === 1 && !this.enabled) {
      this.setInitialState();
    }
  }

  /**
   * Connect to device orientation events
   * Returns a promise that resolves when successfully connected
   */
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if DeviceOrientationEvent is available
      if (window.DeviceOrientationEvent !== undefined) {
        // Special handling for iOS permissions
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          !(window as globalThis.Window).MSStream;

        const DeviceOrientationEventExt =
          DeviceOrientationEvent as unknown as ExtendedDeviceOrientationEventConstructor;

        if (
          isIOS &&
          typeof DeviceOrientationEventExt.requestPermission === "function"
        ) {
          // iOS 13+ requires user permission
          DeviceOrientationEventExt.requestPermission()
            .then((permissionState: string) => {
              if (permissionState === "granted") {
                window.addEventListener(
                  "orientationchange",
                  this.onScreenOrientationChangeEvent,
                );
                window.addEventListener(
                  "deviceorientation",
                  this.onDeviceOrientationChangeEvent,
                );
                window.addEventListener("touchstart", this.onTouchStartEvent);
                this.enabled = true;
                this.handleScreenOrientationChange();
                console.log("iOS device orientation permission granted");
                resolve(true);
              } else {
                console.warn("iOS device orientation permission denied");
                resolve(false);
              }
            })
            .catch((error: Error) => {
              console.error(
                "Error requesting device orientation permission:",
                error,
              );
              resolve(false);
            });
        } else {
          // Non-iOS devices don't need permission request
          window.addEventListener(
            "orientationchange",
            this.onScreenOrientationChangeEvent,
          );
          window.addEventListener(
            "deviceorientation",
            this.onDeviceOrientationChangeEvent,
          );
          window.addEventListener("touchstart", this.onTouchStartEvent);
          this.enabled = true;
          this.handleScreenOrientationChange();
          console.log("Device orientation events connected");
          resolve(true);
        }
      } else {
        console.warn("Device orientation not supported on this device");
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from device orientation events
   */
  disconnect(): void {
    window.removeEventListener(
      "orientationchange",
      this.onScreenOrientationChangeEvent,
    );
    window.removeEventListener(
      "deviceorientation",
      this.onDeviceOrientationChangeEvent,
    );
    window.removeEventListener("touchstart", this.onTouchStartEvent);
    this.enabled = false;
  }

  /**
   * Update camera based on device orientation
   */
  update(): void {
    if (!this.enabled) return;

    if (
      this.deviceOrientation.alpha !== null &&
      this.deviceOrientation.beta !== null &&
      this.deviceOrientation.gamma !== null
    ) {
      // Calculate the camera's current rotation
      const alpha =
        THREE.MathUtils.degToRad(this.deviceOrientation.alpha) +
        this.alphaOffset -
        this.initialAlphaOffset;
      const beta = THREE.MathUtils.degToRad(this.deviceOrientation.beta);
      const gamma = THREE.MathUtils.degToRad(this.deviceOrientation.gamma);
      const orient = THREE.MathUtils.degToRad(this.screenOrientation);

      // Set the camera's rotation using Euler angles
      this.euler.set(beta, alpha, -gamma, "YXZ");
      this.quaternion.setFromEuler(this.euler);
      this.quaternion.multiply(this.q1);
      this.quaternion.multiply(this.q0.setFromAxisAngle(this.zee, -orient));

      // Apply to camera
      this.camera.quaternion.copy(this.quaternion);
    }
  }

  /**
   * Set alpha offset (rotation around Y axis)
   */
  setAlphaOffset(offset: number): void {
    this.alphaOffset = offset;
  }

  /**
   * Check if device orientation is available on this device
   */
  static isAvailable(): boolean {
    return window.DeviceOrientationEvent !== undefined;
  }

  /**
   * Check if device needs permission to access orientation (iOS 13+)
   */
  static needsPermission(): boolean {
    const DeviceOrientationEventExt =
      DeviceOrientationEvent as unknown as ExtendedDeviceOrientationEventConstructor;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as globalThis.Window).MSStream &&
      typeof DeviceOrientationEventExt.requestPermission === "function"
    );
  }

  /**
   * Request device orientation permission for iOS
   * Returns a promise that resolves with permission state
   */
  static requestPermission(): Promise<boolean> {
    const DeviceOrientationEventExt =
      DeviceOrientationEvent as unknown as ExtendedDeviceOrientationEventConstructor;
    if (typeof DeviceOrientationEventExt.requestPermission === "function") {
      return DeviceOrientationEventExt.requestPermission()
        .then((permissionState: string) => {
          return permissionState === "granted";
        })
        .catch(() => {
          return false;
        });
    }
    return Promise.resolve(true); // Already has permission
  }
}

// Make it available on the window for debugging and access from VRPlayer (browser only)
if (typeof window !== "undefined") {
  const extWindow = window as globalThis.Window;
  extWindow.__DeviceOrientationControls = DeviceOrientationControls;
  extWindow.__requestOrientationPermission =
    DeviceOrientationControls.requestPermission;
}
