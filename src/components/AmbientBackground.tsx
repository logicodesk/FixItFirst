import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Pause,
  Play,
  Layers,
  Settings2,
  Volume2,
  Wrench,
  Leaf,
  Compass,
} from 'lucide-react';

interface AmbientBackgroundProps {
  interactive?: boolean;
}

type AmbianceTheme = 'workshop' | 'blueprint' | 'spark';
type MotionIntensity = 'subtle' | 'balanced' | 'lively';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  angle: number;
  angleSpeed: number;
  type: 'dot' | 'mote' | 'leaf' | 'sparkle' | 'gear' | 'loop' | 'screw' | 'stitch';
  scale: number;
  rotation: number;
  rotationSpeed: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [theme, setTheme] = useState<AmbianceTheme>('workshop');
  const [intensity, setIntensity] = useState<MotionIntensity>('lively');
  const [showControls, setShowControls] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const mouseRef = useRef<{ x: number; y: number; lastX: number; lastY: number; radius: number }>({
    x: -9999,
    y: -9999,
    lastX: -9999,
    lastY: -9999,
    radius: 150,
  });

  const ripplesRef = useRef<Ripple[]>([]);
  const sparksRef = useRef<Spark[]>([]);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsPlaying(false);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Main Canvas Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color definitions based on design system
    // --forest: #173D32, --forest-2: #2C5B47, --lime: #CBEA72, --mint: #DCE8DA, --sand: #F5E9BE
    const themeColors: Record<AmbianceTheme, string[]> = {
      workshop: [
        'rgba(44, 91, 71, ',    // forest-2
        'rgba(220, 232, 218, ', // mint
        'rgba(203, 234, 114, ', // lime
        'rgba(245, 233, 190, ', // warm sand
      ],
      blueprint: [
        'rgba(23, 61, 50, ',    // deep forest
        'rgba(44, 91, 71, ',    // forest-2
        'rgba(220, 232, 218, ', // mint
        'rgba(203, 234, 114, ', // lime
      ],
      spark: [
        'rgba(203, 234, 114, ', // lime
        'rgba(245, 233, 190, ', // sand
        'rgba(232, 225, 242, ', // lavender
        'rgba(220, 232, 218, ', // mint
      ],
    };

    const colors = themeColors[theme];

    // Determine particle types based on theme
    const typeDistribution: Record<AmbianceTheme, Particle['type'][]> = {
      workshop: ['leaf', 'leaf', 'mote', 'mote', 'dot', 'sparkle', 'screw', 'loop'],
      blueprint: ['gear', 'gear', 'screw', 'screw', 'stitch', 'loop', 'dot', 'dot'],
      spark: ['sparkle', 'sparkle', 'mote', 'mote', 'dot', 'loop', 'sparkle'],
    };

    const types = typeDistribution[theme];

    // Speed multiplier by intensity
    const speedMult = intensity === 'subtle' ? 0.35 : intensity === 'balanced' ? 0.65 : 1.05;
    const baseCount = intensity === 'subtle' ? 30 : intensity === 'balanced' ? 50 : 75;
    const particleCount = Math.min(85, Math.max(28, Math.floor((width * height) / (intensity === 'lively' ? 22000 : 32000))));

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const type = types[Math.floor(Math.random() * types.length)];
      const radius =
        type === 'dot'
          ? Math.random() * 2.8 + 1.2
          : type === 'mote'
          ? Math.random() * 5 + 3
          : 7;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7 * speedMult,
        vy: (Math.random() - 0.5) * 0.7 * speedMult - (theme === 'workshop' ? 0.2 : 0.08),
        radius,
        baseRadius: radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.22,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.035 * speedMult,
        type,
        scale: Math.random() * 0.5 + 0.75,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025 * speedMult,
      };
    });

    const addRipple = (x: number, y: number, color = 'rgba(203, 234, 114, 0.45)', maxRad = 65) => {
      if (ripplesRef.current.length > 14) ripplesRef.current.shift();
      ripplesRef.current.push({
        x,
        y,
        radius: 3,
        maxRadius: maxRad,
        alpha: 0.5,
        color,
        width: 1.5,
      });
    };

    const addBurst = (x: number, y: number) => {
      // Create multi-ring ripple
      addRipple(x, y, 'rgba(203, 234, 114, 0.65)', 70);
      setTimeout(() => addRipple(x, y, 'rgba(44, 91, 71, 0.4)', 95), 80);
      setTimeout(() => addRipple(x, y, 'rgba(245, 233, 190, 0.5)', 120), 160);

      // Create burst of tactile sparks
      const sparkCount = intensity === 'lively' ? 14 : 8;
      for (let i = 0; i < sparkCount; i++) {
        const ang = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
        const spd = Math.random() * 3.5 + 1.5;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: Math.random() * 3 + 2,
          alpha: 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.03 + 0.02,
        });
      }
    };

    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const now = performance.now();
      if (now - lastMoveTime > (intensity === 'lively' ? 90 : 160)) {
        addRipple(e.clientX, e.clientY, 'rgba(44, 91, 71, 0.22)', 45);

        // Spawn a subtle trailing sparkle mote
        if (Math.random() > 0.4) {
          sparksRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8 - 0.4,
            size: Math.random() * 2.5 + 1.5,
            alpha: 0.7,
            color: colors[Math.floor(Math.random() * colors.length)],
            decay: 0.035,
          });
        }
        lastMoveTime = now;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      addBurst(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Drawing particle primitives
    const drawLeaf = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.fillStyle = `${p.color}${p.alpha * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(8, -3, 6, 7);
      ctx.quadraticCurveTo(0, 10, 0, 10);
      ctx.quadraticCurveTo(0, 10, -6, 7);
      ctx.quadraticCurveTo(-8, -3, 0, -10);
      ctx.fill();

      // Stem line
      ctx.strokeStyle = `rgba(23, 61, 50, ${p.alpha * 0.45})`;
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.stroke();
      ctx.restore();
    };

    const drawSparkle = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.fillStyle = `${p.color}${p.alpha * 0.9})`;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos((i * Math.PI) / 2) * 8.5, Math.sin((i * Math.PI) / 2) * 8.5);
        ctx.lineTo(Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 2.8, Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 2.8);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawGear = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.strokeStyle = `${p.color}${p.alpha * 0.85})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 5, Math.sin(ang) * 5);
        ctx.lineTo(Math.cos(ang) * 8.5, Math.sin(ang) * 8.5);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawScrew = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.strokeStyle = `${p.color}${p.alpha * 0.75})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Slotted screw groove
      ctx.beginPath();
      ctx.moveTo(-3.5, 0);
      ctx.lineTo(3.5, 0);
      ctx.stroke();
      ctx.restore();
    };

    const drawStitch = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.strokeStyle = `${p.color}${p.alpha * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
      ctx.restore();
    };

    const drawLoop = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.strokeStyle = `${p.color}${p.alpha * 0.85})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0.2, Math.PI * 1.5);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = `${p.color}${p.alpha * 0.95})`;
      ctx.beginPath();
      ctx.moveTo(-1.5, -7.5);
      ctx.lineTo(3.2, -6);
      ctx.lineTo(0.2, -3.8);
      ctx.fill();
      ctx.restore();
    };

    const drawMote = (p: Particle) => {
      ctx.save();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.8);
      grad.addColorStop(0, `${p.color}${p.alpha * 1.3})`);
      grad.addColorStop(0.5, `${p.color}${p.alpha * 0.55})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render animated circular water / sound / energy ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 1.6;
        r.alpha *= 0.96;

        if (r.alpha < 0.015 || r.radius > r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color.replace(/[\d\.]+\)$/, `${r.alpha})`);
        ctx.lineWidth = r.width;
        ctx.stroke();
      }

      // 2. Render celebration / touch sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.alpha -= s.decay;

        if (s.alpha <= 0.02) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw tactile connection lines between neighboring particles (Repair Web)
      const connectThreshold = intensity === 'lively' ? 125 : 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectThreshold) {
            const lineAlpha = (1 - dist / connectThreshold) * (theme === 'blueprint' ? 0.22 : 0.14);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(44, 91, 71, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Update & draw particles
      particles.forEach((p) => {
        p.angle += p.angleSpeed;
        p.rotation += p.rotationSpeed;
        p.x += p.vx + Math.cos(p.angle) * 0.4;
        p.y += p.vy + Math.sin(p.angle) * 0.4;

        // Subtle mouse repulsion & magnetic swirling
        if (interactive && mouseRef.current.x > 0) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouseRef.current.radius && mdist > 0) {
            const force = (1 - mdist / mouseRef.current.radius) * (intensity === 'lively' ? 2.2 : 1.4);
            p.x += (mdx / mdist) * force;
            p.y += (mdy / mdist) * force;
          }
        }

        // Screen wrap-around with safety buffer
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Render appropriate shape
        switch (p.type) {
          case 'leaf':
            drawLeaf(p);
            break;
          case 'sparkle':
            drawSparkle(p);
            break;
          case 'gear':
            drawGear(p);
            break;
          case 'screw':
            drawScrew(p);
            break;
          case 'stitch':
            drawStitch(p);
            break;
          case 'loop':
            drawLoop(p);
            break;
          case 'mote':
            drawMote(p);
            break;
          default:
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha})`;
            ctx.fill();
            break;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlaying, interactive, theme, intensity]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Layer 1: Workshop Sunbeam Radial Rays (Animated slow rotation & breathe) */}
      <div className="absolute -top-40 -right-40 w-[650px] sm:w-[950px] h-[650px] sm:h-[950px] bg-gradient-to-br from-[#CBEA72]/20 via-[#DCE8DA]/25 to-transparent rounded-full blur-[110px] animate-sunbeam pointer-events-none" />

      {/* Layer 2: Organic Floating Glowing Orbs */}
      <div className="absolute top-[15%] left-[-15%] w-[480px] sm:w-[750px] h-[480px] sm:h-[750px] rounded-full bg-[#DCE8DA]/45 blur-[120px] animate-ambient-drift-2 pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[5%] w-[550px] sm:w-[800px] h-[550px] sm:h-[800px] rounded-full bg-[#F5E9BE]/35 blur-[110px] animate-ambient-drift-3 pointer-events-none" />
      <div className="absolute top-[55%] left-[28%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[#CBEA72]/18 blur-[105px] animate-ambient-drift-1 pointer-events-none" />

      {/* Layer 3: Flowing Topographic & Woodgrain Ambient Waves (SVGs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-multiply">
        {/* Wave 1: Flowing from bottom left to top right */}
        <svg
          className="absolute -bottom-24 -left-20 w-[140vw] h-[500px] text-[#2C5B47]/10 animate-wave-glide-1"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,176C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Wave 2: Complementary undulating ribbon */}
        <svg
          className="absolute top-1/4 -right-24 w-[130vw] h-[450px] text-[#CBEA72]/15 animate-wave-glide-2"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,133.3C840,107,960,85,1080,106.7C1200,128,1320,192,1380,224L1440,256"
          />
        </svg>
      </div>

      {/* Layer 4: Tactile Blueprint Grid with Subtle Pulse Sheen */}
      <div
        className="absolute inset-0 opacity-[0.042] mix-blend-multiply animate-pulse-sheen pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#173D32 1.3px, transparent 1.3px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Layer 5: Floating Crafted Workshop & Sustainability Silhouette Glyphs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Plant Leaf (top left) */}
        <div className="absolute top-[16%] left-[6%] opacity-25 text-[#2C5B47] animate-float-slow">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
          </svg>
        </div>

        {/* Floating Rotating Gear 1 (top right) */}
        <div className="absolute top-[20%] right-[7%] opacity-20 text-[#173D32] animate-gear-spin-slow">
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>

        {/* Counter-rotating Gear 2 interlocking */}
        <div className="absolute top-[28%] right-[11%] opacity-15 text-[#2C5B47] animate-gear-spin-reverse">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="2.5" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>

        {/* Floating Circular Economy Loop (mid left) */}
        <div className="absolute top-[62%] left-[9%] opacity-20 text-[#173D32] animate-float-medium">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        </div>

        {/* Floating Wrench (mid right) */}
        <div className="absolute top-[48%] right-[8%] opacity-20 text-[#2C5B47] animate-float-reverse">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        {/* Floating Lightbulb with Soft Glow (bottom left) */}
        <div className="absolute bottom-[18%] left-[14%] opacity-22 text-[#CBEA72] animate-float-slow">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
          </svg>
        </div>

        {/* Floating Sparkle Star of Renewal (bottom right) */}
        <div className="absolute bottom-[22%] right-[16%] opacity-30 text-[#CBEA72] animate-float-medium">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* Floating Needle & Thread Stitch (bottom center right) */}
        <div className="absolute bottom-[10%] right-[32%] opacity-15 text-[#2C5B47] animate-float-reverse">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </div>
      </div>

      {/* Layer 6: Dynamic Particle Canvas with physics, sparks, ripples, and repair web */}
      {isPlaying && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Layer 7: Interactive Ambiance Control Dock */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 pointer-events-auto flex items-center gap-2">
        {/* Expanded Options Tray */}
        {showControls && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#DCE8DA] shadow-lg animate-in fade-in slide-in-from-right duration-200">
            {/* Theme Selector: Workshop Breeze vs Blueprint vs Spark */}
            <button
              type="button"
              onClick={() => setTheme('workshop')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                theme === 'workshop'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-[#66736B] hover:text-[#182B24] hover:bg-[#F7F8F2]'
              }`}
              title="Workshop Breeze: drifting leaves, wood grain waves, and motes"
            >
              <Leaf className="w-3 h-3 text-[#CBEA72]" />
              <span className="hidden sm:inline">Breeze</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('blueprint')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                theme === 'blueprint'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-[#66736B] hover:text-[#182B24] hover:bg-[#F7F8F2]'
              }`}
              title="Blueprint & Tools: rotating gears, screws, stitches, and grid"
            >
              <Wrench className="w-3 h-3 text-[#CBEA72]" />
              <span className="hidden sm:inline">Craft</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('spark')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                theme === 'spark'
                  ? 'bg-[#173D32] text-white shadow-xs'
                  : 'text-[#66736B] hover:text-[#182B24] hover:bg-[#F7F8F2]'
              }`}
              title="Spark of Renewal: glowing sparkles and starlight connections"
            >
              <Sparkles className="w-3 h-3 text-[#CBEA72]" />
              <span className="hidden sm:inline">Spark</span>
            </button>

            <div className="w-[1px] h-4 bg-[#DCE8DA] mx-0.5" />

            {/* Motion Intensity Cycle */}
            <button
              type="button"
              onClick={() =>
                setIntensity((prev) =>
                  prev === 'subtle' ? 'balanced' : prev === 'balanced' ? 'lively' : 'subtle'
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#F7F8F2] hover:bg-[#DCE8DA]/60 text-[#182B24] text-[11px] font-medium transition-all capitalize"
              title={`Motion density: ${intensity}. Click to cycle.`}
            >
              {intensity}
            </button>
          </div>
        )}

        {/* Toggle Controls Drawer */}
        <button
          type="button"
          onClick={() => setShowControls((prev) => !prev)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#DCE8DA] hover:border-[#2C5B47]/50 text-[#66736B] hover:text-[#182B24] text-[11px] font-medium transition-all shadow-xs hover:shadow-md"
          title={showControls ? 'Close ambiance settings' : 'Ambiance themes & speed'}
          aria-label="Ambiance settings"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#2C5B47]" />
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#DCE8DA] hover:border-[#2C5B47]/50 text-[#66736B] hover:text-[#182B24] text-[11px] font-medium transition-all shadow-xs hover:shadow-md active:scale-95"
          title={isPlaying ? 'Pause background live animations' : 'Resume background live animations'}
          aria-label={isPlaying ? 'Pause background live animations' : 'Play background live animations'}
        >
          <span className="flex items-center justify-center">
            {isPlaying ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CBEA72] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2C5B47]" />
              </span>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-[#66736B]" />
            )}
          </span>
          <span className="hidden xs:inline">
            {isPlaying ? 'Live Ambiance' : 'Motion Paused'}
          </span>
          {isPlaying ? (
            <Pause className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          ) : (
            <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          )}
        </button>
      </div>
    </div>
  );
};
