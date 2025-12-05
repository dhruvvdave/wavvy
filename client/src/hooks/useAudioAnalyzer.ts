import { useEffect, useRef } from 'react';
import { useAudioStore } from '../stores/audioStore';

export function useAudioAnalyzer(audioElement: HTMLAudioElement | null) {
  const { audioContext, analyser, setAudioContext, setAnalyser } = useAudioStore();
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    let context = audioContext;
    let analyzerNode = analyser;

    try {
      // Create audio context if it doesn't exist
      if (!context) {
        context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      }

      // Create analyzer if it doesn't exist
      if (!analyzerNode) {
        analyzerNode = context.createAnalyser();
        analyzerNode.fftSize = 2048;
        analyzerNode.smoothingTimeConstant = 0.8;
        setAnalyser(analyzerNode);
      }

      // Create source and connect if not already connected
      if (!sourceRef.current) {
        try {
          sourceRef.current = context.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyzerNode);
          analyzerNode.connect(context.destination);
        } catch (err) {
          // Source might already be connected
          console.warn('Audio source already connected:', err);
        }
      }

      // Resume context on user interaction
      const resumeContext = () => {
        if (context && context.state === 'suspended') {
          context.resume();
        }
      };

      audioElement.addEventListener('play', resumeContext);

      return () => {
        audioElement.removeEventListener('play', resumeContext);
      };
    } catch (error) {
      console.error('Error setting up audio analyzer:', error);
    }
  }, [audioElement, audioContext, analyser, setAudioContext, setAnalyser]);

  return { audioContext, analyser };
}

export function useVisualizerAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  analyser: AnalyserNode | null,
  mode: string
) {
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Drawing logic is in the Visualizer component
      // This hook just manages the animation loop
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasRef, analyser, mode]);
}
