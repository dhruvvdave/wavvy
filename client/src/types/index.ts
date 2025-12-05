export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  spotify_url?: string;
  created_at: Date;
}

export interface Beat {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  bpm: number;
  pattern_data: PatternData;
  audio_url?: string;
  plays: number;
  created_at: Date;
  user?: User;
}

export interface PatternData {
  steps: number;
  tracks: TrackPattern[];
  swing: number;
}

export interface TrackPattern {
  name: string;
  steps: boolean[];
  volume: number;
  muted: boolean;
  solo: boolean;
}

export interface AudioFile {
  id: string;
  user_id: string;
  filename: string;
  url: string;
  duration: number;
  source: 'upload' | 'spotify' | 'url';
  external_id?: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  beat_id: string;
  user_id: string;
  content: string;
  timestamp_seconds?: number;
  created_at: Date;
  user?: User;
}

export interface Like {
  id: string;
  beat_id: string;
  user_id: string;
  created_at: Date;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url?: string;
  external_urls: { spotify: string };
}

export type VisualizerMode = 'frequency' | 'waveform' | 'circular' | 'particles' | 'spectrum';

export interface InstrumentType {
  id: string;
  name: string;
  type: 'synth' | 'piano' | 'bass' | 'pluck';
}
