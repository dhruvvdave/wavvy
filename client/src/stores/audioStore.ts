import { create } from 'zustand';
import { VisualizerMode } from '../types';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  visualizerMode: VisualizerMode;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  currentTrack: {
    title: string;
    artist: string;
    albumArt?: string;
  } | null;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setAudioContext: (context: AudioContext | null) => void;
  setAnalyser: (analyser: AnalyserNode | null) => void;
  setCurrentTrack: (track: { title: string; artist: string; albumArt?: string } | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  visualizerMode: 'bars',
  audioContext: null,
  analyser: null,
  currentTrack: null,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setVolume: (volume) => set({ volume }),
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  setAudioContext: (context) => set({ audioContext: context }),
  setAnalyser: (analyser) => set({ analyser }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
}));
