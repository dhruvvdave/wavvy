import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../stores/audioStore';
import { VisualizerMode } from '../../types';

interface VisualizerProps {
  audioElement?: HTMLAudioElement | null;
}

export default function Visualizer({ audioElement }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { visualizerMode, setVisualizerMode, audioContext, analyser, setAudioContext, setAnalyser } = useAudioStore();

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    let context = audioContext;
    let analyzerNode = analyser;

    if (!context) {
      context = new AudioContext();
      setAudioContext(context);
    }

    if (!analyzerNode) {
      analyzerNode = context.createAnalyser();
      analyzerNode.fftSize = 2048;
      setAnalyser(analyzerNode);

      // Only create source if it doesn't exist
      try {
        const source = context.createMediaElementSource(audioElement);
        source.connect(analyzerNode);
        analyzerNode.connect(context.destination);
      } catch (error) {
        // Source already exists, which is fine
        console.debug('Audio source already connected:', error);
      }
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      if (!analyzerNode) return;
      
      analyzerNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      switch (visualizerMode) {
        case 'frequency':
          drawFrequencyBars(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'waveform':
          drawWaveform(ctx, analyzerNode, canvas.width, canvas.height);
          break;
        case 'circular':
          drawCircular(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'particles':
          drawParticles(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'spectrum':
          drawSpectrum(ctx, dataArray, canvas.width, canvas.height);
          break;
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, visualizerMode, audioContext, analyser]);

  const drawFrequencyBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barWidth = (width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      const hue = (i / dataArray.length) * 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, analyzerNode: AnalyserNode, width: number, height: number) => {
    const bufferLength = analyzerNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8b5cf6';
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;

    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] / 255;
      const angle = (i / dataArray.length) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + value * 100);
      const y2 = centerY + Math.sin(angle) * (radius + value * 100);

      const hue = (i / dataArray.length) * 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const particles = Math.min(dataArray.length, 100);
    
    for (let i = 0; i < particles; i++) {
      const value = dataArray[i] / 255;
      const x = (i / particles) * width;
      const y = height / 2 + (Math.random() - 0.5) * value * height;
      const size = value * 10 + 2;

      const hue = (i / particles) * 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${value})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] / 255;
      const x = (i / dataArray.length) * width;
      
      const gradient = ctx.createLinearGradient(x, height, x, height - value * height);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#ec4899');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - value * height, width / dataArray.length, value * height);
    }
  };

  const modes: VisualizerMode[] = ['frequency', 'waveform', 'circular', 'particles', 'spectrum'];

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold gradient-text">🎨 Visualizer</h2>
        <div className="flex gap-2">
          {modes.map((mode) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisualizerMode(mode)}
              className={`px-3 py-1 rounded text-xs capitalize ${
                visualizerMode === mode ? 'bg-primary neon-glow' : 'bg-white/5'
              }`}
            >
              {mode}
            </motion.button>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-96 bg-dark/50"
      />
    </div>
  );
}
