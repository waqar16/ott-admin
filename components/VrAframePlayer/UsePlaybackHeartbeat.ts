import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';

 
export function UsePlaybackHeartbeat({
  contentId,
  video,
  isPlaying,
}) { 
  const intervalRef = useRef(null);

  useEffect(() => {
    if ( !contentId || !video) return;

    function sendHeartbeat() {
      if ( !contentId || !video) return;
      apiClient.post(`/content/playback/${contentId}/heartbeat/`, {
        position: Math.floor(video.currentTime),
        is_playing: !video.paused && !video.ended,
      }).catch(() => {
        // Do not retry aggressively
      });
    }

    // Helper to randomize interval between 10-15s
    function getNextInterval() {
      return 10000 + Math.floor(Math.random() * 5000);
    }

    let stopped = false;
    function scheduleNext() {
      if (stopped) return;
      if (document.visibilityState !== 'visible' || video?.paused || video?.ended) return;
      sendHeartbeat();
      intervalRef.current = setTimeout(scheduleNext, getNextInterval());
    }

    // Start interval if playing and tab is visible
    if (isPlaying && document.visibilityState === 'visible') {
      scheduleNext();
    }

    // Pause heartbeat in background tabs
    function handleVisibility() {
      if (document.visibilityState !== 'visible' && intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      } else if (document.visibilityState === 'visible' && isPlaying && !intervalRef.current) {
        scheduleNext();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopped = true;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line
  }, [ contentId, video, isPlaying]);
}
