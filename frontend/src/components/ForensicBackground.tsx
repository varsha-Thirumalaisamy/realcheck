import React, { useEffect, useRef } from 'react';

export const ForensicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
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

    // Particle nodes for forensic constellation network
    const particleCount = Math.min(Math.floor((width * height) / 28000), 55);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      color: string;
    }> = [];

    const colors = [
      'rgba(0, 240, 255, ',    // Cyan
      'rgba(56, 189, 248, ',   // Sky blue
      'rgba(129, 140, 248, ',  // Indigo
      'rgba(16, 185, 129, '    // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        alpha: baseAlpha,
        baseAlpha,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let tick = 0;

    const render = () => {
      tick += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective telemetry lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        else if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        else if (p1.y > height) p1.y = 0;

        // Subtle alpha breathing
        p1.alpha = p1.baseAlpha + Math.sin(tick * 2 + i) * 0.12;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.14;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.color}${Math.max(0, p1.alpha)})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="forensic-bg-root" aria-hidden="true">
      {/* 1. Dynamic Luminous Aurora Orbs */}
      <div className="forensic-orb orb-primary" />
      <div className="forensic-orb orb-secondary" />
      <div className="forensic-orb orb-tertiary" />
      <div className="forensic-orb orb-accent" />

      {/* 2. Cyber Matrix Vector Grid */}
      <div className="forensic-grid-mesh" />

      {/* 3. Cyber Scanline & Vignette Depth */}
      <div className="forensic-vignette" />

      {/* 4. Interactive Telemetry Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="forensic-canvas"
      />
    </div>
  );
};
