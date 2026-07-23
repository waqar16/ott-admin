# Video Players

This folder contains advanced video player components for the OTT platform with support for HLS adaptive streaming, VR/360° content, WebXR, and comprehensive accessibility features.

## Components

### VideoPlayer

An advanced HLS video player with adaptive bitrate streaming, quality selection UI, custom controls, and full keyboard accessibility.

**Features:**

- HLS.js integration for adaptive bitrate streaming
- Automatic quality switching with manual override
- Custom video controls (play/pause, seek, volume, fullscreen)
- Quality level selection menu
- Error handling and recovery
- Loading indicators
- Native HLS support for Safari
- Responsive design
- **Full keyboard controls for accessibility**
- **ARIA labels on all interactive elements**
- **Screen reader support**

**Keyboard Controls:**

- `Space` or `K` - Play/Pause
- `←` (Left Arrow) or `J` - Seek backward 10 seconds
- `→` (Right Arrow) or `L` - Seek forward 10 seconds
- `↑` (Up Arrow) - Increase volume
- `↓` (Down Arrow) - Decrease volume
- `M` - Toggle mute
- `F` - Toggle fullscreen

**Props:**

```typescript
interface VideoPlayerProps {
  src: string // HLS stream URL (.m3u8)
  poster?: string // Poster image URL
  autoPlay?: boolean // Auto-play on load (default: false)
  controls?: boolean // Show custom controls (default: true)
  initialBitrate?: number // Starting quality level (-1 for auto)
  onQualityChange?: (level: number, bitrate: number) => void
  onError?: (error: string) => void
  className?: string
}
```

**Usage Example:**

```tsx
import { VideoPlayer } from '@/players'
;<VideoPlayer
  src="https://cdn.example.com/video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  autoPlay={false}
  controls={true}
  initialBitrate={-1}
  onQualityChange={(level, bitrate) => {
    console.log(`Quality: ${level}, Bitrate: ${bitrate}bps`)
  }}
  onError={(error) => {
    console.error('Playback error:', error)
  }}
  className="aspect-video"
/>
```

### VRPlayer

A VR/360° video player built with React Three Fiber and HLS.js for immersive content with WebXR support, Cardboard mode, and accessibility features.

**Features:**

- **WebXR immersive VR mode** (for compatible VR headsets)
- **Google Cardboard mode toggle** (for mobile VR viewers)
- 360° video playback mapped to inside-out sphere
- Stereoscopic 3D support (side-by-side format)
- HLS.js integration for adaptive streaming
- Interactive orbit controls (drag to look around)
- Zoom support
- Quality level selection
- Custom video controls overlay
- Loading indicators
- Support for both 360° and standard video modes
- **Full keyboard controls for accessibility**
- **ARIA labels on all interactive elements**
- **VR mode detection and UI adaptation**

**WebXR Support:**

- Automatic detection of WebXR availability
- "Enter VR" button when supported
- Seamless transition to immersive VR mode
- Works with Oculus Quest, HTC Vive, and other WebXR devices

**Keyboard Controls:**

- `Space` or `K` - Play/Pause
- `←` (Left Arrow) or `J` - Seek backward 10 seconds
- `→` (Right Arrow) or `L` - Seek forward 10 seconds
- `↑` (Up Arrow) - Increase volume
- `↓` (Down Arrow) - Decrease volume
- `M` - Toggle mute
- `F` - Toggle fullscreen
- `V` - Open VR mode menu

**Props:**

```typescript
interface VRPlayerProps {
  src: string // HLS stream URL (.m3u8)
  poster?: string // Poster image URL
  is360?: boolean // Enable 360° mode (default: true)
  isStereo?: boolean // Enable stereoscopic rendering (default: false)
  initialBitrate?: number // Starting quality level (-1 for auto)
  autoPlay?: boolean // Auto-play on load (default: false)
  onQualityChange?: (level: number, bitrate: number) => void
  onError?: (error: string) => void
  className?: string
}
```

**Usage Example:**

```tsx
import { VRPlayer } from '@/players';

// 360° Mono with WebXR
<VRPlayer
  src="https://cdn.example.com/360-video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  is360={true}
  isStereo={false}
  autoPlay={false}
  className="aspect-video"
/>

// 360° Stereo (Side-by-side format) with Cardboard support
<VRPlayer
  src="https://cdn.example.com/stereo-video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  is360={true}
  isStereo={true}
  autoPlay={false}
  onQualityChange={(level, bitrate) => {
    console.log(`Quality changed to ${level}`)
  }}
  className="aspect-video"
/>
```

## Accessibility Features

Both players are fully accessible with:

### ARIA Labels

- All buttons have descriptive `aria-label` attributes
- Current state announced (e.g., "Pause video" vs "Play video")
- Keyboard shortcuts included in labels
- Volume and time information in tooltips
- Quality menu items with resolution and bitrate info

### Keyboard Navigation

- All controls accessible via keyboard
- Logical tab order
- Standard media player shortcuts (Space, K, J, L, M, F)
- Arrow keys for volume and seeking

### Screen Reader Support

- Decorative icons marked with `aria-hidden="true"`
- Interactive elements properly labeled
- Menu roles for dropdowns
- State changes announced via ARIA

### Visual Feedback

- Clear focus indicators on all controls
- Tooltips showing keyboard shortcuts
- Progress bar with time display
- Quality menu highlighting active selection

## VR Mode Features

### WebXR Detection

VRPlayer automatically detects WebXR support:

```typescript
if (navigator.xr) {
  const supported = await navigator.xr.isSessionSupported('immersive-vr')
}
```

### VR Modes

1. **360° View (Default)**
   - Drag to look around
   - Scroll to zoom
   - Standard video controls

2. **Cardboard Mode**
   - Toggle via VR menu or `V` key
   - Optimized for mobile VR viewers
   - Gyroscope-based head tracking
   - Side-by-side stereo rendering

3. **WebXR Immersive Mode**
   - Available on compatible devices
   - "Enter VR" button appears when supported
   - Full 6DOF head tracking
   - Native VR headset integration

### VR Mode Indicator

Top-right corner shows current mode:

- "360° View | Drag to look around"
- "📱 Cardboard" - Cardboard VR active
- "🥽 VR Mode" - WebXR immersive active

## HLS Stream Requirements

Both players expect HLS streams in the following format:

- **Container:** MPEG-TS or fMP4
- **Video Codec:** H.264 or H.265
- **Audio Codec:** AAC
- **Manifest:** .m3u8 playlist file
- **Adaptive Bitrate:** Multiple quality levels (optional but recommended)

**Example HLS manifest structure:**

```
master.m3u8
├── 1080p/
│   └── playlist.m3u8
├── 720p/
│   └── playlist.m3u8
└── 480p/
    └── playlist.m3u8
```

## Stereoscopic Video Format

For VRPlayer with `isStereo={true}`, videos must be encoded in **side-by-side** format:

- Left eye view on the left half
- Right eye view on the right half
- Each eye receives 50% of the horizontal resolution

## Installation

The required dependencies are already in package.json:

```bash
pnpm install
```

**Dependencies:**

- `hls.js` - HTTP Live Streaming
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components
- `three` - 3D graphics library
- `@types/three` - TypeScript types

## Browser Support

### VideoPlayer

- **Modern Browsers:** Chrome, Firefox, Edge, Opera (via HLS.js)
- **Safari:** Native HLS support
- **Mobile:** iOS Safari, Chrome Mobile, Firefox Mobile
- **Accessibility:** Full keyboard and screen reader support

### VRPlayer

- **Desktop:** Chrome, Firefox, Edge, Safari (WebGL required)
- **Mobile:** Chrome Mobile, Safari iOS (WebGL required)
- **VR Headsets:**
  - WebXR: Oculus Quest, Meta Quest, HTC Vive, Valve Index
  - Cardboard: Any mobile device with gyroscope
- **Accessibility:** Full keyboard and screen reader support

## Performance Tips

1. **Use appropriate quality levels** - Provide multiple bitrates (480p, 720p, 1080p)
2. **Enable GPU acceleration** - Ensure WebGL is available for VRPlayer
3. **Optimize chunk size** - Use 2-6 second segments in HLS manifest
4. **CDN delivery** - Serve video content from a CDN for best performance
5. **Preload poster images** - Improve perceived loading time
6. **Test WebXR compatibility** - Use WebXR Device API emulator for testing

## Troubleshooting

### VideoPlayer

**Issue:** Video not playing

- Check if the HLS URL is accessible
- Verify CORS headers are set correctly
- Check browser console for HLS.js errors

**Issue:** Quality selection not appearing

- Ensure HLS manifest has multiple quality levels
- Check network tab to verify manifest is loading

**Issue:** Keyboard controls not working

- Ensure the player container has focus
- Check for JavaScript errors in console
- Verify no other handlers are preventing default

### VRPlayer

**Issue:** 360° view not working

- Verify WebGL is enabled in browser
- Check if video texture is loading correctly
- Ensure video element has `crossOrigin="anonymous"` for external sources

**Issue:** Stereoscopic rendering incorrect

- Verify video is in side-by-side format
- Check that `isStereo={true}` is set
- Ensure video aspect ratio is 2:1 for side-by-side content

**Issue:** WebXR not detected

- Verify device supports WebXR (use `chrome://webxr-internals`)
- Check if HTTPS is enabled (required for WebXR)
- Ensure browser has WebXR flag enabled

**Issue:** Cardboard mode not activating

- Check VR menu toggle button functionality
- Verify `is360={true}` is set
- Test on mobile device with gyroscope

## Next Steps

1. **Install dependencies:** Run `pnpm install` to install all required packages
2. **Configure video sources:** Replace example URLs with your actual HLS endpoints
3. **Test playback:** Uncomment the example code in `app/title/[id]/page.tsx`
4. **Test WebXR:** Use a VR headset or WebXR emulator
5. **Test accessibility:** Use keyboard navigation and screen readers
6. **Customize styling:** Adjust colors, sizes, and layout to match your design
7. **Add analytics:** Integrate tracking for play events, quality changes, VR mode usage

## Related Files

- `players/VideoPlayer.tsx` - Standard HLS player component with accessibility
- `players/VRPlayer.tsx` - VR/360° player component with WebXR and Cardboard
- `players/HLSPlayer.tsx` - Legacy HLS player (deprecated)
- `players/index.ts` - Export barrel file
- `app/title/[id]/page.tsx` - Usage example (commented out)

## Components

### VideoPlayer

An advanced HLS video player with adaptive bitrate streaming, quality selection UI, and custom controls.

**Features:**

- HLS.js integration for adaptive bitrate streaming
- Automatic quality switching with manual override
- Custom video controls (play/pause, seek, volume, fullscreen)
- Quality level selection menu
- Error handling and recovery
- Loading indicators
- Native HLS support for Safari
- Responsive design

**Props:**

```typescript
interface VideoPlayerProps {
  src: string // HLS stream URL (.m3u8)
  poster?: string // Poster image URL
  autoPlay?: boolean // Auto-play on load (default: false)
  controls?: boolean // Show custom controls (default: true)
  initialBitrate?: number // Starting quality level (-1 for auto)
  onQualityChange?: (level: number, bitrate: number) => void
  onError?: (error: string) => void
  className?: string
}
```

**Usage Example:**

```tsx
import { VideoPlayer } from '@/players'
;<VideoPlayer
  src="https://cdn.example.com/video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  autoPlay={false}
  controls={true}
  initialBitrate={-1}
  onQualityChange={(level, bitrate) => {
    console.log(`Quality: ${level}, Bitrate: ${bitrate}bps`)
  }}
  onError={(error) => {
    console.error('Playback error:', error)
  }}
  className="aspect-video"
/>
```

### VRPlayer

A VR/360° video player built with React Three Fiber and HLS.js for immersive content.

**Features:**

- 360° video playback mapped to inside-out sphere
- Stereoscopic 3D support (side-by-side format)
- HLS.js integration for adaptive streaming
- Interactive orbit controls (drag to look around)
- Zoom support
- Quality level selection
- Custom video controls overlay
- Loading indicators
- Support for both 360° and standard video modes

**Props:**

```typescript
interface VRPlayerProps {
  src: string // HLS stream URL (.m3u8)
  poster?: string // Poster image URL
  is360?: boolean // Enable 360° mode (default: true)
  isStereo?: boolean // Enable stereoscopic rendering (default: false)
  initialBitrate?: number // Starting quality level (-1 for auto)
  autoPlay?: boolean // Auto-play on load (default: false)
  onQualityChange?: (level: number, bitrate: number) => void
  onError?: (error: string) => void
  className?: string
}
```

**Usage Example:**

```tsx
import { VRPlayer } from '@/players';

// 360° Mono
<VRPlayer
  src="https://cdn.example.com/360-video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  is360={true}
  isStereo={false}
  autoPlay={false}
  className="aspect-video"
/>

// 360° Stereo (Side-by-side format)
<VRPlayer
  src="https://cdn.example.com/stereo-video.m3u8"
  poster="https://cdn.example.com/poster.jpg"
  is360={true}
  isStereo={true}
  autoPlay={false}
  onQualityChange={(level, bitrate) => {
    console.log(`Quality changed to ${level}`)
  }}
  className="aspect-video"
/>
```

## HLS Stream Requirements

Both players expect HLS streams in the following format:

- **Container:** MPEG-TS or fMP4
- **Video Codec:** H.264 or H.265
- **Audio Codec:** AAC
- **Manifest:** .m3u8 playlist file
- **Adaptive Bitrate:** Multiple quality levels (optional but recommended)

**Example HLS manifest structure:**

```
master.m3u8
├── 1080p/
│   └── playlist.m3u8
├── 720p/
│   └── playlist.m3u8
└── 480p/
    └── playlist.m3u8
```

## Stereoscopic Video Format

For VRPlayer with `isStereo={true}`, videos must be encoded in **side-by-side** format:

- Left eye view on the left half
- Right eye view on the right half
- Each eye receives 50% of the horizontal resolution

## Installation

The required dependencies are already in package.json:

```bash
pnpm install
```

**Dependencies:**

- `hls.js` - HTTP Live Streaming
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components
- `three` - 3D graphics library
- `@types/three` - TypeScript types

## Browser Support

### VideoPlayer

- **Modern Browsers:** Chrome, Firefox, Edge, Opera (via HLS.js)
- **Safari:** Native HLS support
- **Mobile:** iOS Safari, Chrome Mobile, Firefox Mobile

### VRPlayer

- **Desktop:** Chrome, Firefox, Edge, Safari (WebGL required)
- **Mobile:** Chrome Mobile, Safari iOS (WebGL required)
- **VR Headsets:** Oculus Browser, Vive Browser (WebXR support)

## Performance Tips

1. **Use appropriate quality levels** - Provide multiple bitrates (480p, 720p, 1080p)
2. **Enable GPU acceleration** - Ensure WebGL is available for VRPlayer
3. **Optimize chunk size** - Use 2-6 second segments in HLS manifest
4. **CDN delivery** - Serve video content from a CDN for best performance
5. **Preload poster images** - Improve perceived loading time

## Troubleshooting

### VideoPlayer

**Issue:** Video not playing

- Check if the HLS URL is accessible
- Verify CORS headers are set correctly
- Check browser console for HLS.js errors

**Issue:** Quality selection not appearing

- Ensure HLS manifest has multiple quality levels
- Check network tab to verify manifest is loading

### VRPlayer

**Issue:** 360° view not working

- Verify WebGL is enabled in browser
- Check if video texture is loading correctly
- Ensure video element has `crossOrigin="anonymous"` for external sources

**Issue:** Stereoscopic rendering incorrect

- Verify video is in side-by-side format
- Check that `isStereo={true}` is set
- Ensure video aspect ratio is 2:1 for side-by-side content

## Next Steps

1. **Install dependencies:** Run `pnpm install` to install all required packages
2. **Configure video sources:** Replace example URLs with your actual HLS endpoints
3. **Test playback:** Uncomment the example code in `app/title/[id]/page.tsx`
4. **Customize styling:** Adjust colors, sizes, and layout to match your design
5. **Add analytics:** Integrate tracking for play events, quality changes, etc.

## Related Files

- `players/VideoPlayer.tsx` - Standard HLS player component
- `players/VRPlayer.tsx` - VR/360° player component
- `players/HLSPlayer.tsx` - Legacy HLS player (deprecated)
- `players/index.ts` - Export barrel file
- `app/title/[id]/page.tsx` - Usage example (commented out)
