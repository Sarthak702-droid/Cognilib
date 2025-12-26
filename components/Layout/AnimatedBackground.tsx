import React, { useEffect, useRef } from 'react';

export const AnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Normalized for parallax (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Pixel values for spotlight
      const cursorX = e.clientX;
      const cursorY = e.clientY;

      // Update CSS variables for high-performance animation
      containerRef.current.style.setProperty('--mouse-x', x.toFixed(4));
      containerRef.current.style.setProperty('--mouse-y', y.toFixed(4));
      containerRef.current.style.setProperty('--cursor-x', `${cursorX}px`);
      containerRef.current.style.setProperty('--cursor-y', `${cursorY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle System Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.3; // Very slow natural movement
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(80, (width * height) / 10000); // Responsive count

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Calculate parallax offset based on mouse from center
      const parallaxX = (mouseX - width / 2) * 0.02;
      const parallaxY = (mouseY - height / 2) * 0.02;

      // Draw connections
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const p1x = p1.x + parallaxX * (p1.size * 0.5); // Parallax effect
        const p1y = p1.y + parallaxY * (p1.size * 0.5);

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1x, p1y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${0.1 + (p1.size / 5)})`;
        ctx.fill();

        p1.update();

        // Connect to mouse (Web Effect)
        const dxMouse = p1x - mouseX;
        const dyMouse = p1y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        if (distMouse < 200) {
          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distMouse / 200)})`;
          ctx.stroke();
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2x = p2.x + parallaxX * (p2.size * 0.5);
          const p2y = p2.y + parallaxY * (p2.size * 0.5);
          
          const dx = p1x - p2x;
          const dy = p1y - p2y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            // Opacity based on distance
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ 
        '--mouse-x': '0', 
        '--mouse-y': '0',
        '--cursor-x': '50vw',
        '--cursor-y': '50vh'
      } as React.CSSProperties}
    >
      {/* Base Gradient */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 animate-gradient-xy"></div>
      
      {/* Mouse Follow Spotlight/Glow */}
      <div 
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none transition-transform duration-100 ease-out will-change-transform opacity-30 mix-blend-overlay"
        style={{ 
          transform: 'translate(calc(var(--cursor-x) - 50%), calc(var(--cursor-y) - 50%))',
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0) 70%)'
        }}
      />

      {/* Interactive Blobs */}
      <div 
        className="absolute top-[10%] left-[10%] transition-transform duration-1000 ease-out will-change-transform"
        style={{ transform: 'translate(calc(var(--mouse-x) * -30px), calc(var(--mouse-y) * -30px))' }}
      >
        <div className="w-[32rem] h-[32rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      </div>
      
      <div 
        className="absolute top-[30%] right-[5%] transition-transform duration-1000 ease-out will-change-transform"
        style={{ transform: 'translate(calc(var(--mouse-x) * 40px), calc(var(--mouse-y) * 40px))' }}
      >
        <div 
          className="w-[40rem] h-[40rem] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" 
          style={{ animationDelay: '2s' }} 
        />
      </div>
      
      <div 
        className="absolute bottom-[0%] left-[20%] transition-transform duration-1000 ease-out will-change-transform"
        style={{ transform: 'translate(calc(var(--mouse-x) * 20px), calc(var(--mouse-y) * 20px))' }}
      >
        <div 
          className="w-[30rem] h-[30rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" 
          style={{ animationDelay: '4s' }} 
        />
      </div>

      {/* Canvas Layer for Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-70"
      />
    </div>
  );
};