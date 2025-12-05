import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../stores/audioStore';
import { VisualizerMode } from '../../types';

interface VisualizerProps {
  audioElement?: HTMLAudioElement | null;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  hue: number;
}

export default function Visualizer({ audioElement }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { visualizerMode, setVisualizerMode, audioContext, analyser, setAudioContext, setAnalyser } = useAudioStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles for galaxy mode
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 150 + 50,
        speed: (Math.random() - 0.5) * 0.01,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 60 + 260, // Purple to pink range
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle audio element connection
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
      analyzerNode.fftSize = 512;
      analyzerNode.smoothingTimeConstant = 0.85;
      setAnalyser(analyzerNode);
      analyserRef.current = analyzerNode;

      try {
        const source = context.createMediaElementSource(audioElement);
        source.connect(analyzerNode);
        analyzerNode.connect(context.destination);
      } catch (error) {
        console.debug('Audio source already connected:', error);
      }
    } else {
      analyserRef.current = analyzerNode;
    }
  }, [audioElement, audioContext, analyser, setAudioContext, setAnalyser]);

  // Main draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Get frequency data from analyser
      let dataArray: Uint8Array;
      let hasAudio = false;

      if (analyserRef.current && audioElement && !audioElement.paused) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const tempArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(tempArray);
        dataArray = tempArray;
        hasAudio = dataArray.some(val => val > 0);
      } else {
        // Fallback to empty data
        dataArray = new Uint8Array(256).fill(0);
      }

      // Dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#050507');
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // If no audio, show idle animation
      if (!hasAudio) {
        drawIdleAnimation(ctx, canvas.width, canvas.height);
      } else {
        switch (visualizerMode) {
          case 'bars':
            drawBars(ctx, dataArray, canvas.width, canvas.height);
            break;
          case 'wave':
            drawWave(ctx, dataArray, canvas.width, canvas.height);
            break;
          case 'circular':
            drawCircular(ctx, dataArray, canvas.width, canvas.height);
            break;
          case 'galaxy':
            drawGalaxy(ctx, dataArray, canvas.width, canvas.height);
            break;
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visualizerMode, audioElement]);

  const drawIdleAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = Date.now() / 1000;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw pulsing rings
    for (let i = 0; i < 3; i++) {
      const radius = 50 + i * 40 + Math.sin(time * 2 + i) * 20;
      const alpha = 0.3 - i * 0.1;
      
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw floating text
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload or search for music...', centerX, centerY);
  };

  // Bars mode - gradient bars with reflection
  const drawBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barCount = 64;
    const barWidth = width / barCount - 2;
    
    for (let i = 0; i < barCount; i++) {
      const value = dataArray[Math.floor(i * dataArray.length / barCount)] / 255;
      const barHeight = value * height * 0.7;
      const x = i * (barWidth + 2);
      
      // Main bar with gradient
      const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.5, '#22d3ee');
      gradient.addColorStop(1, '#f472b6');
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(168, 85, 247, ${value * 0.8})`;
      
      // Rounded rectangle for bar
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();
      
      // Reflection
      const reflectionGradient = ctx.createLinearGradient(x, height, x, height + barHeight * 0.3);
      reflectionGradient.addColorStop(0, `rgba(168, 85, 247, ${value * 0.3})`);
      reflectionGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      
      ctx.fillStyle = reflectionGradient;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.roundRect(x, height + 2, barWidth, barHeight * 0.3, [0, 0, 4, 4]);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  // Wave mode - smooth bezier curves
  const drawWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const colors = [
      { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.2)' },
      { stroke: '#22d3ee', fill: 'rgba(34, 211, 238, 0.15)' },
      { stroke: '#f472b6', fill: 'rgba(244, 114, 182, 0.1)' },
    ];
    
    colors.forEach((color, layerIndex) => {
      ctx.strokeStyle = color.stroke;
      ctx.fillStyle = color.fill;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color.stroke;
      
      ctx.beginPath();
      
      const points: { x: number; y: number }[] = [];
      const sliceWidth = width / dataArray.length;
      const offset = layerIndex * 30;
      
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] / 255;
        const x = i * sliceWidth;
        const y = height / 2 - value * height * 0.3 + offset;
        points.push({ x, y });
      }
      
      // Draw smooth curve using bezier
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      // Fill under the wave
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      
      // Draw the wave line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.stroke();
    });
    
    ctx.shadowBlur = 0;
  };

  // Circular mode - radial visualizer
  const drawCircular = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    const rotation = Date.now() / 5000; // Slow rotation

    // Draw center pulsing glow
    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    glowGradient.addColorStop(0, `rgba(168, 85, 247, ${avgValue * 0.6})`);
    glowGradient.addColorStop(0.5, `rgba(34, 211, 238, ${avgValue * 0.3})`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (1.2 + avgValue * 0.3), 0, Math.PI * 2);
    ctx.fill();

    // Draw radial bars
    const barCount = 128;
    for (let i = 0; i < barCount; i++) {
      const value = dataArray[Math.floor(i * dataArray.length / barCount)] / 255;
      const angle = (i / barCount) * Math.PI * 2 + rotation;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const barLength = value * 150;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      // Gradient color based on position
      const hue = (i / barCount) * 360;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.5)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, ${0.8 + value * 0.2})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  // Galaxy mode - particles reacting to bass
  const drawGalaxy = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate bass value
    const bassValue = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    
    // Update and draw particles
    const particles = particlesRef.current;
    particles.forEach((p) => {
      // Rotate particle
      p.angle += p.speed;
      
      // Bass reaction - expand radius
      const targetRadius = p.radius * (1 + bassValue * 0.5);
      
      const x = centerX + Math.cos(p.angle) * targetRadius;
      const y = centerY + Math.sin(p.angle) * targetRadius;
      
      // Draw particle with glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * (1 + bassValue * 2));
      gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity})`);
      gradient.addColorStop(1, `hsla(${p.hue}, 80%, 50%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, p.size * (1 + bassValue * 2), 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Center glow pulsing with bass
    const centerGlow = ctx.createRadialGradient(
      centerX, centerY, 0, 
      centerX, centerY, 200 * (1 + bassValue)
    );
    centerGlow.addColorStop(0, `rgba(168, 85, 247, ${0.5 * bassValue})`);
    centerGlow.addColorStop(0.4, `rgba(34, 211, 238, ${0.3 * bassValue})`);
    centerGlow.addColorStop(0.7, `rgba(244, 114, 182, ${0.2 * bassValue})`);
    centerGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);
    
    // Draw frequency-reactive ring
    ctx.strokeStyle = `rgba(168, 85, 247, ${bassValue * 0.8})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + bassValue * 100, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const modes: { id: VisualizerMode; label: string; icon: string }[] = [
    { id: 'bars', label: 'Bars', icon: '📊' },
    { id: 'wave', label: 'Wave', icon: '〰️' },
    { id: 'circular', label: 'Circular', icon: '⭕' },
    { id: 'galaxy', label: 'Galaxy', icon: '✨' },
  ];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div 
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-full'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative w-full aspect-video max-h-[70vh] rounded-2xl overflow-hidden bg-black/40 backdrop-blur border border-white/5">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Mode selector floating at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisualizerMode(mode.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                visualizerMode === mode.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>{mode.icon}</span>
                <span className="hidden sm:inline">{mode.label}</span>
              </span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '✕' : '⛶'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
