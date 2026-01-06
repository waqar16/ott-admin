// Helper function to clamp a value between min and max
export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(v, max));

// Format time in seconds to MM:SS
export const formatTime = (seconds: number): string => {
  // Handle edge cases
  if (!seconds || Number.isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
