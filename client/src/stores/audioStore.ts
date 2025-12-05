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
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setAudioContext: (context: AudioContext | null) => void;
  setAnalyser: (analyser: AnalyserNode | null) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  visualizerMode: 'frequency',
  audioContext: null,
  analyser: null,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setVolume: (volume) => set({ volume }),
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  setAudioContext: (context) => set({ audioContext: context }),
  setAnalyser: (analyser) => set({ analyser }),
}));

interface SequencerState {
  bpm: number;
  steps: number;
  currentStep: number;
  swing: number;
  tracks: any[];
  setBpm: (bpm: number) => void;
  setCurrentStep: (step: number) => void;
  setSwing: (swing: number) => void;
  setTracks: (tracks: any[]) => void;
}

export const useSequencerStore = create<SequencerState>((set) => ({
  bpm: 120,
  steps: 16,
  currentStep: 0,
  swing: 0,
  tracks: [],
  setBpm: (bpm) => set({ bpm }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSwing: (swing) => set({ swing }),
  setTracks: (tracks) => set({ tracks }),
}));
