import { useEffect, useRef, useState } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      analyzerNode.smoothingTimeConstant = 0.8;
      setAnalyser(analyzerNode);

      try {
        const source = context.createMediaElementSource(audioElement);
        source.connect(analyzerNode);
        analyzerNode.connect(context.destination);
      } catch (error) {
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

      // Enhanced background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(3, 0, 20, 0.3)');
      gradient.addColorStop(1, 'rgba(10, 10, 31, 0.3)');
      ctx.fillStyle = gradient;
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
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      const hue = (i / dataArray.length) * 360;
      const gradient = ctx.createLinearGradient(x, height - barHeight, x, height);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, 0.7)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.3)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      // Add glow effect
      if (barHeight > height * 0.3) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;
      }
      
      x += barWidth + 1;
    }
  };

  const drawWaveform = (ctx: CanvasRenderingContext2D, analyzerNode: AnalyserNode, width: number, height: number) => {
    const bufferLength = analyzerNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 3;
    
    // Draw multiple waves with different colors
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899'];
    
    colors.forEach((color, index) => {
      ctx.strokeStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      const offset = index * 20;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2 + offset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    });
    
    ctx.shadowBlur = 0;
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    // Draw center glow
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `rgba(139, 92, 246, ${avgValue * 0.5})`);
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (1 + avgValue * 0.3), 0, Math.PI * 2);
    ctx.fill();

    // Draw bars
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] / 255;
      const angle = (i / dataArray.length) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const barLength = value * 150;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      const hue = (i / dataArray.length) * 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.8 + value * 0.2})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  const particlesStore: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

  const drawParticles = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const bassValue = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    
    // Add new particles on bass hits
    if (bassValue > 0.5 && Math.random() > 0.7) {
      for (let i = 0; i < 5; i++) {
        particlesStore.push({
          x: width / 2,
          y: height / 2,
          vx: (Math.random() - 0.5) * 10 * bassValue,
          vy: (Math.random() - 0.5) * 10 * bassValue,
          life: 1,
        });
      }
    }
    
    // Update and draw particles
    for (let i = particlesStore.length - 1; i >= 0; i--) {
      const p = particlesStore[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      
      if (p.life <= 0) {
        particlesStore.splice(i, 1);
        continue;
      }
      
      const size = p.life * 8;
      const hue = (1 - p.life) * 120 + 240;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${p.life})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Draw frequency particles
    const particles = Math.min(dataArray.length, 150);
    for (let i = 0; i < particles; i++) {
      const value = dataArray[i] / 255;
      const x = (i / particles) * width;
      const y = height / 2 + (Math.random() - 0.5) * value * height * 0.6;
      const size = value * 8 + 2;

      const hue = (i / particles) * 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${value * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawSpectrum = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barWidth = width / dataArray.length;
    
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i] / 255;
      const x = i * barWidth;
      const barHeight = value * height;
      
      const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.3, '#06b6d4');
      gradient.addColorStop(0.6, '#ec4899');
      gradient.addColorStop(1, '#f59e0b');
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(139, 92, 246, ${value})`;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    }
    ctx.shadowBlur = 0;
  };

  const modes: { id: VisualizerMode; label: string; icon: string }[] = [
    { id: 'frequency', label: 'Bars', icon: '📊' },
    { id: 'waveform', label: 'Wave', icon: '〰️' },
    { id: 'circular', label: 'Circular', icon: '⭕' },
    { id: 'particles', label: 'Particles', icon: '✨' },
    { id: 'spectrum', label: 'Spectrum', icon: '🌈' },
  ];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div 
      className={`glass rounded-2xl overflow-hidden transition-all duration-500 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-xl bg-white/5">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          🎨 Audio Visualizer
        </h2>
        <div className="flex gap-2 items-center flex-wrap">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisualizerMode(mode.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                visualizerMode === mode.id 
                  ? 'bg-primary neon-glow-strong text-white' 
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="flex items-center gap-1">
                <span>{mode.icon}</span>
                <span className="hidden sm:inline">{mode.label}</span>
              </span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 transition-all duration-300"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </motion.button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className={`w-full bg-gradient-to-b from-dark/80 to-dark/60 ${isFullscreen ? 'h-full' : 'h-[500px]'}`}
      />
    </motion.div>
  );
}
