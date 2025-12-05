import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

interface Firework {
  x: number;
  y: number;
  particles: FireworkParticle[];
}

interface FireworkParticle {
  angle: number;
  speed: number;
  life: number;
  hue: number;
}

// Type extensions for browser compatibility
interface HTMLAudioElementExtended {
  preservesPitch?: boolean;
  mozPreservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
}

export default function Visualizer({ audioElement }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const matrixColumnsRef = useRef<number[]>([]);
  const blobPointsRef = useRef<number>(8);
  const timeRef = useRef<number>(0);
  
  const { 
    visualizerMode, 
    setVisualizerMode, 
    audioContext, 
    analyser, 
    setAudioContext, 
    setAnalyser,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume
  } = useAudioStore();
  
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize particles for galaxy mode (reduced to 100 for performance)
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 150 + 50,
        speed: (Math.random() - 0.5) * 0.01,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 60 + 260,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle audio element connection with improved AudioContext settings
  useEffect(() => {
    if (!audioElement || !canvasRef.current) return;

    // Enable preservesPitch for better audio quality
    const audioEl = audioElement as unknown as HTMLAudioElement & HTMLAudioElementExtended;
    if ('preservesPitch' in audioElement) {
      audioEl.preservesPitch = true;
    } else if ('mozPreservesPitch' in audioElement) {
      audioEl.mozPreservesPitch = true;
    } else if ('webkitPreservesPitch' in audioElement) {
      audioEl.webkitPreservesPitch = true;
    }

    let context = audioContext;
    let analyzerNode = analyser;

    if (!context) {
      // Better AudioContext setup for lower latency and better quality
      context = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
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

  // Update time and duration from audio element
  useEffect(() => {
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () => setDuration(audioElement.duration);
    const updatePlayState = () => setIsPlaying(!audioElement.paused);

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('durationchange', updateDuration);
    audioElement.addEventListener('play', updatePlayState);
    audioElement.addEventListener('pause', updatePlayState);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('durationchange', updateDuration);
      audioElement.removeEventListener('play', updatePlayState);
      audioElement.removeEventListener('pause', updatePlayState);
    };
  }, [audioElement, setCurrentTime, setDuration, setIsPlaying]);

  // Update volume on audio element
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [audioElement, volume]);

  // Optimized draw functions using useCallback
  const drawIdleAnimation = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current / 1000;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < 3; i++) {
      const radius = 50 + i * 40 + Math.sin(time * 2 + i) * 20;
      const alpha = 0.3 - i * 0.1;
      
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload or search for music...', centerX, centerY);
  }, []);

  const drawBars = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barCount = 64;
    const barWidth = width / barCount - 2;
    
    for (let i = 0; i < barCount; i++) {
      const value = dataArray[Math.floor(i * dataArray.length / barCount)] / 255;
      const barHeight = value * height * 0.7;
      const x = i * (barWidth + 2);
      
      const gradient = ctx.createLinearGradient(x, height, x, height - barHeight);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.5, '#22d3ee');
      gradient.addColorStop(1, '#f472b6');
      
      ctx.fillStyle = gradient;
      
      // Use roundRect if available for rounded corners
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      }
      
      const reflectionGradient = ctx.createLinearGradient(x, height, x, height + barHeight * 0.3);
      reflectionGradient.addColorStop(0, `rgba(168, 85, 247, ${value * 0.3})`);
      reflectionGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      
      ctx.fillStyle = reflectionGradient;
      
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, height + 2, barWidth, barHeight * 0.3, [0, 0, 4, 4]);
        ctx.fill();
      } else {
        ctx.fillRect(x, height + 2, barWidth, barHeight * 0.3);
      }
    }
  }, []);

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const colors = [
      { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.2)' },
      { stroke: '#22d3ee', fill: 'rgba(34, 211, 238, 0.15)' },
      { stroke: '#f472b6', fill: 'rgba(244, 114, 182, 0.1)' },
    ];
    
    colors.forEach((color, layerIndex) => {
      ctx.strokeStyle = color.stroke;
      ctx.fillStyle = color.fill;
      ctx.lineWidth = 3;
      
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
      
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.stroke();
    });
  }, []);

  const drawCircular = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    const rotation = timeRef.current / 5000;

    const avgValue = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    glowGradient.addColorStop(0, `rgba(168, 85, 247, ${avgValue * 0.6})`);
    glowGradient.addColorStop(0.5, `rgba(34, 211, 238, ${avgValue * 0.3})`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (1.2 + avgValue * 0.3), 0, Math.PI * 2);
    ctx.fill();

    const barCount = 128;
    for (let i = 0; i < barCount; i++) {
      const value = dataArray[Math.floor(i * dataArray.length / barCount)] / 255;
      const angle = (i / barCount) * Math.PI * 2 + rotation;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const barLength = value * 150;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      const hue = (i / barCount) * 360;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.5)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, ${0.8 + value * 0.2})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }, []);

  const drawGalaxy = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const bassValue = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    
    const particles = particlesRef.current;
    particles.forEach((p) => {
      p.angle += p.speed;
      
      const targetRadius = p.radius * (1 + bassValue * 0.5);
      
      const x = centerX + Math.cos(p.angle) * targetRadius;
      const y = centerY + Math.sin(p.angle) * targetRadius;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * (1 + bassValue * 2));
      gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.opacity})`);
      gradient.addColorStop(1, `hsla(${p.hue}, 80%, 50%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, p.size * (1 + bassValue * 2), 0, Math.PI * 2);
      ctx.fill();
    });
    
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
    
    ctx.strokeStyle = `rgba(168, 85, 247, ${bassValue * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + bassValue * 100, 0, Math.PI * 2);
    ctx.stroke();
  }, []);

  const drawDNA = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const points = 50;
    const time = timeRef.current / 500;
    
    for (let i = 0; i < points; i++) {
      const x = (i / points) * width;
      const freq = dataArray[Math.floor(i * dataArray.length / points)] / 255;
      
      const y1 = height / 2 + Math.sin(i * 0.3 + time * 2) * 100 * (0.5 + freq * 0.5);
      const y2 = height / 2 + Math.sin(i * 0.3 + time * 2 + Math.PI) * 100 * (0.5 + freq * 0.5);
      
      ctx.strokeStyle = `rgba(168, 85, 247, ${freq * 0.8 + 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
      
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(x, y1, 5 * freq + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y2, 5 * freq + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawFireworks = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const bassValue = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    
    if (bassValue > 0.7 && Math.random() > 0.8) {
      fireworksRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        particles: Array(30).fill(0).map(() => ({
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 5 + 2,
          life: 1,
          hue: Math.random() * 60 + 260
        }))
      });
    }
    
    fireworksRef.current.forEach((fw, i) => {
      fw.particles.forEach(p => {
        p.life -= 0.02;
        const x = fw.x + Math.cos(p.angle) * p.speed * (1 - p.life) * 50;
        const y = fw.y + Math.sin(p.angle) * p.speed * (1 - p.life) * 50;
        
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      if (fw.particles[0].life <= 0) {
        fireworksRef.current.splice(i, 1);
      }
    });
  }, []);

  const drawMatrix = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const fontSize = 14;
    const columnCount = Math.floor(width / fontSize);
    
    if (matrixColumnsRef.current.length === 0) {
      for (let i = 0; i < columnCount; i++) {
        matrixColumnsRef.current.push(Math.random() * height);
      }
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.font = `${fontSize}px monospace`;
    
    for (let i = 0; i < matrixColumnsRef.current.length && i < columnCount; i++) {
      const freq = dataArray[Math.floor(i * dataArray.length / columnCount)] / 255;
      const char = String.fromCharCode(0x30A0 + Math.random() * 96);
      
      const hue = 270 + freq * 60;
      ctx.fillStyle = `hsla(${hue}, 100%, ${50 + freq * 30}%, ${0.8 + freq * 0.2})`;
      ctx.fillText(char, i * fontSize, matrixColumnsRef.current[i]);
      
      matrixColumnsRef.current[i] += fontSize * (0.5 + freq);
      if (matrixColumnsRef.current[i] > height && Math.random() > 0.95) {
        matrixColumnsRef.current[i] = 0;
      }
    }
  }, []);

  const drawNeonRings = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const ringCount = 8;
    
    for (let i = 0; i < ringCount; i++) {
      const freqIndex = Math.floor(i * dataArray.length / ringCount);
      const value = dataArray[freqIndex] / 255;
      const baseRadius = (i + 1) * 40;
      const radius = baseRadius + value * 30;
      
      const hue = 260 + i * 15;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.3 + value * 0.7})`;
      ctx.lineWidth = 3 + value * 5;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, []);

  const drawMountains = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const layers = 3;
    
    for (let layer = 0; layer < layers; layer++) {
      const alpha = (layers - layer) / layers;
      const yOffset = layer * 50;
      
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * width;
        const value = dataArray[i] / 255;
        const y = height - value * height * 0.6 - yOffset;
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = ((i - 1) / dataArray.length) * width;
          const prevValue = dataArray[i - 1] / 255;
          const prevY = height - prevValue * height * 0.6 - yOffset;
          const cpx = (prevX + x) / 2;
          const cpy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
        }
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, height - 200, 0, height);
      gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.6})`);
      gradient.addColorStop(0.5, `rgba(34, 211, 238, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(244, 114, 182, ${alpha * 0.2})`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, []);

  const drawBlob = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 4;
    const time = timeRef.current / 1000;
    
    ctx.beginPath();
    
    const points = blobPointsRef.current;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const freqIndex = Math.floor(i * dataArray.length / points);
      const value = dataArray[freqIndex] / 255;
      
      const radius = baseRadius + value * 100 + Math.sin(time * 2 + i) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 2);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
    gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.6)');
    gradient.addColorStop(1, 'rgba(244, 114, 182, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  // Main draw loop - optimized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false })!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // Limit DPR for performance
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };
    
    window.addEventListener('resize', handleResize);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      timeRef.current = Date.now();
      
      let dataArray: Uint8Array;
      let hasAudio = false;

      if (analyserRef.current && audioElement && !audioElement.paused) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const tempArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(tempArray);
        dataArray = tempArray;
        hasAudio = dataArray.some(val => val > 0);
      } else {
        dataArray = new Uint8Array(256).fill(0);
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#050507');
      gradient.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (!hasAudio) {
        drawIdleAnimation(ctx, width, height);
      } else {
        switch (visualizerMode) {
          case 'bars':
            drawBars(ctx, dataArray, width, height);
            break;
          case 'wave':
            drawWave(ctx, dataArray, width, height);
            break;
          case 'circular':
            drawCircular(ctx, dataArray, width, height);
            break;
          case 'galaxy':
            drawGalaxy(ctx, dataArray, width, height);
            break;
          case 'dna':
            drawDNA(ctx, dataArray, width, height);
            break;
          case 'fireworks':
            drawFireworks(ctx, dataArray, width, height);
            break;
          case 'matrix':
            drawMatrix(ctx, dataArray, width, height);
            break;
          case 'rings':
            drawNeonRings(ctx, dataArray, width, height);
            break;
          case 'mountains':
            drawMountains(ctx, dataArray, width, height);
            break;
          case 'blob':
            drawBlob(ctx, dataArray, width, height);
            break;
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(resizeTimeout);
    };
  }, [visualizerMode, audioElement, drawIdleAnimation, drawBars, drawWave, drawCircular, drawGalaxy, drawDNA, drawFireworks, drawMatrix, drawNeonRings, drawMountains, drawBlob]);

  const modes: { id: VisualizerMode; label: string; icon: string }[] = useMemo(() => [
    { id: 'bars', label: 'Bars', icon: '📊' },
    { id: 'wave', label: 'Wave', icon: '〰️' },
    { id: 'circular', label: 'Circular', icon: '⭕' },
    { id: 'galaxy', label: 'Galaxy', icon: '✨' },
    { id: 'dna', label: 'DNA', icon: '🧬' },
    { id: 'fireworks', label: 'Fireworks', icon: '🎆' },
    { id: 'matrix', label: 'Matrix', icon: '💚' },
    { id: 'rings', label: 'Rings', icon: '⭕' },
    { id: 'mountains', label: 'Mountains', icon: '⛰️' },
    { id: 'blob', label: 'Blob', icon: '💧' },
  ], []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => console.error('Play error:', err));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    audioElement.volume = newVolume;
    setVolume(newVolume);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-full'
      }`}
    >
      <div className="relative w-full aspect-video max-h-[70vh] rounded-2xl overflow-hidden bg-black/40 backdrop-blur border border-white/5" style={{ willChange: 'transform' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Controls overlay - integrated into visualizer */}
        {audioElement && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-4">
            {/* Track info */}
            {currentTrack && (
              <div className="flex items-center gap-3 mb-3">
                {currentTrack.albumArt && (
                  <img 
                    src={currentTrack.albumArt} 
                    alt="Album art" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {currentTrack.title || 'Unknown Track'}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {currentTrack.artist || 'Unknown Artist'}
                  </p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="mb-3">
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Play/pause and volume controls */}
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-shadow"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Volume control */}
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <span className="text-gray-400 text-sm">🔊</span>
                <div 
                  ref={volumeRef}
                  onClick={handleVolumeChange}
                  className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            </div>
          </div>
        )}
        
        {/* Mode selector */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 bg-black/60 backdrop-blur-xl rounded-full px-3 py-2 border border-white/10 overflow-x-auto max-w-[90vw]">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setVisualizerMode(mode.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                visualizerMode === mode.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={mode.label}
            >
              <span className="flex items-center gap-1">
                <span>{mode.icon}</span>
                <span className="hidden sm:inline">{mode.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
