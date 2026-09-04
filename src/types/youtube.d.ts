// ============================================================
// TYPES — YouTube IFrame Player API
// Deklarasi global tunggal agar tidak bentrok antar-komponen
// ============================================================

export interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
  setPlaybackRate?: (rate: number) => void;
  setPlaybackQuality?: (quality: string) => void;
  unloadModule?: (module: string) => void;
}

export interface YouTubePlayerEvent {
  target: YouTubePlayerInstance;
  data?: number;
}

export interface YouTubeNamespace {
  Player: new (
    elementId: string,
    config: {
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onPlaybackRateChange?: (event: YouTubePlayerEvent) => void;
      };
    }
  ) => YouTubePlayerInstance;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING?: number;
    CUED?: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
