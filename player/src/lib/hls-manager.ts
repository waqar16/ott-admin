import Hls from "hls.js";

interface HLSManagerOptions {
  onVideoReady: (video: HTMLVideoElement) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  debug?: boolean;
}

export class HLSManager {
  private hls: Hls | null = null;
  private video: HTMLVideoElement;
  private options: HLSManagerOptions;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private debug: boolean;

  constructor(video: HTMLVideoElement, options: HLSManagerOptions) {
    this.video = video;
    this.options = options;
    this.debug = options.debug ?? false;
  }

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log(...args);
    }
  }

  private logError(...args: unknown[]): void {
    if (this.debug) {
      console.error(...args);
    }
  }

  private logWarn(...args: unknown[]): void {
    if (this.debug) {
      console.warn(...args);
    }
  }

  public initialize(videoSrc: string): void {
    if (!videoSrc.endsWith(".m3u8")) {
      // Regular video source
      this.video.src = videoSrc;
      this.options.onVideoReady(this.video);
      return;
    }

    this.log("Initializing HLS playback for:", videoSrc);

    // Configure video element for HLS
    this.video.setAttribute("playsinline", "true");
    this.video.setAttribute("webkit-playsinline", "true");
    this.video.setAttribute("x-webkit-airplay", "allow");
    this.video.preload = "auto";

    if (!Hls.isSupported()) {
      this.logError("HLS.js is not supported in this browser");
      // Fallback to native HLS support
      this.video.src = videoSrc;
      this.options.onVideoReady(this.video);
      return;
    }

    this.log("HLS.js is supported, initializing...");
    this.initializeHLS(videoSrc);
  }

  private initializeHLS(videoSrc: string): void {
    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 1,
      highBufferWatchdogPeriod: 4,
      nudgeOffset: 0.2,
      nudgeMaxRetry: 6,
      maxFragLookUpTolerance: 0.5,
      maxLoadingDelay: 4,
      startFragPrefetch: true,
      testBandwidth: true,
      progressive: true,
      abrEwmaDefaultEstimate: 500000,
      abrEwmaFastLive: 3,
      abrEwmaSlowLive: 9,
      startLevel: -1,
      debug: this.debug,
    });

    this.setupHLSEventListeners();

    // Load the source
    this.log("Loading HLS source...");
    this.hls.loadSource(videoSrc);
    this.hls.attachMedia(this.video);
  }

  private setupHLSEventListeners(): void {
    if (!this.hls) return;

    // Log HLS events for debugging
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.log("HLS: Media attached");
    });

    this.hls.on(Hls.Events.MEDIA_DETACHED, () => {
      this.log("HLS: Media detached");
    });

    this.hls.on(Hls.Events.MANIFEST_LOADING, () => {
      this.log("HLS: Manifest loading");
    });

    this.hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
      this.log("HLS: Manifest loaded", data);
    });

    this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      this.log("HLS: Manifest parsed", data);
      this.options.onVideoReady(this.video);

      // Add video event listeners after HLS is ready
      this.setupVideoEventListeners();

      // Try to start playback
      this.video.play().catch((err) => {
        this.logWarn("Initial play failed:", err);
        this.options.onPlayStateChange(false);
      });
    });

    this.hls.on(Hls.Events.BUFFER_CREATED, () => {
      this.log("HLS: Buffer created");
    });

    this.hls.on(Hls.Events.BUFFER_APPENDING, () => {
      this.log("HLS: Buffer appending");
    });

    this.hls.on(Hls.Events.BUFFER_APPENDED, () => {
      this.log("HLS: Buffer appended");
    });

    this.hls.on(Hls.Events.ERROR, (event, data) => {
      this.logError("HLS error:", data);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            this.logError("Fatal network error, trying to recover...");
            this.recoverNetworkError();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.logError("Fatal media error, trying to recover...");
            this.recoverMediaError();
            break;
          default:
            this.logError("Fatal error, cannot recover");
            this.destroy();
            break;
        }
      } else {
        // Handle non-fatal errors
        switch (data.details) {
          case Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE:
            this.log("Buffer hole detected, attempting to recover...");
            this.handleBufferHole(data);
            break;
          case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
            this.log("Buffer stalled, attempting to recover...");
            this.handleBufferStall();
            break;
          default:
            this.log("Non-fatal error, continuing playback");
            break;
        }
      }
    });
  }

  private handleBufferHole(data: { reason?: string }) {
    // If we're at the start of the video, try to seek forward slightly
    if (this.video.currentTime < 1) {
      this.log("Seeking forward slightly to skip initial buffer hole");
      this.video.currentTime = 1;
      return;
    }

    // For holes during playback, try to seek to the next keyframe
    if (!data.reason) {
      this.log("No reason provided for buffer hole, skipping seek");
      return;
    }

    const holeStart = data.reason.match(/seeking from (\d+\.?\d*)/)?.[1];
    const holeEnd = data.reason.match(/to (\d+\.?\d*)/)?.[1];

    if (holeStart && holeEnd) {
      this.log(
        `Attempting to seek over buffer hole from ${holeStart} to ${holeEnd}`,
      );
      this.video.currentTime = Number.parseFloat(holeEnd) + 0.1;
    }
  }

  private handleBufferStall() {
    // If we're stalled, try to seek forward slightly
    if (this.video.buffered.length > 0) {
      const currentBufferEnd = this.video.buffered.end(
        this.video.buffered.length - 1,
      );
      if (currentBufferEnd > this.video.currentTime) {
        this.log("Seeking forward to buffered content");
        this.video.currentTime = currentBufferEnd - 0.1;
      }
    }
  }

  private recoverNetworkError() {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      this.log(`Retry attempt ${this.retryCount}/${this.MAX_RETRIES}`);
      this.hls?.startLoad();
    } else {
      this.logError("Max retries reached for network error");
      this.destroy();
    }
  }

  private recoverMediaError() {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      this.log(`Retry attempt ${this.retryCount}/${this.MAX_RETRIES}`);
      this.hls?.recoverMediaError();
    } else {
      this.logError("Max retries reached for media error");
      this.destroy();
    }
  }

  private setupVideoEventListeners(): void {
    const handlePlay = () => {
      this.log("Video play event");
      this.options.onPlayStateChange(true);
    };

    const handlePause = () => {
      this.log("Video pause event");
      this.options.onPlayStateChange(false);
    };

    const handleEnded = () => {
      this.log("Video ended");
      this.options.onPlayStateChange(false);
    };

    const handleWaiting = () => {
      this.log("Video waiting for data");
    };

    const handleStalled = () => {
      this.log("Video playback stalled");
    };

    this.video.addEventListener("play", handlePlay);
    this.video.addEventListener("pause", handlePause);
    this.video.addEventListener("ended", handleEnded);
    this.video.addEventListener("waiting", handleWaiting);
    this.video.addEventListener("stalled", handleStalled);
  }

  public destroy(): void {
    this.log("Cleaning up HLS instance");
    this.hls?.destroy();
    this.hls = null;
  }
}
