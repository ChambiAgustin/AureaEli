import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  type: 'star' | 'flower' | 'petal' | 'heart';
  angle: number;
  spin: number;
  swaySpeed: number;
  swayOffset: number;
}

export const InteractiveParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Configuración responsiva
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Inicializar partículas
    const initParticles = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      // Menos partículas en mobile para optimizar rendimiento al máximo
      const particleCount = isMobile ? 35 : 80;

      const colors = {
        spark: ['rgba(210, 150, 80, 0.45)', 'rgba(213, 175, 55, 0.38)', 'rgba(197, 168, 128, 0.3)'],
        leaf: ['rgba(92, 107, 87, 0.22)', 'rgba(79, 94, 76, 0.16)'],
        petal: ['rgba(158, 98, 82, 0.25)', 'rgba(191, 130, 110, 0.18)'],
        heart: ['rgba(158, 98, 82, 0.22)', 'rgba(191, 130, 110, 0.16)', 'rgba(210, 180, 140, 0.28)']
      };

      for (let i = 0; i < particleCount; i++) {
        // Diversificar tipos de partículas
        const rand = Math.random();
        let type: 'star' | 'flower' | 'petal' | 'heart' = 'star';
        let colorList = colors.spark;
        let radius = Math.random() * 3.5 + 2.5; // estrellas de 2.5px a 6px

        if (rand > 0.82) {
          type = 'flower';
          colorList = colors.leaf;
          radius = Math.random() * 6 + 5; // flores de salvia de 5px a 11px
        } else if (rand > 0.68) {
          type = 'petal';
          colorList = colors.petal;
          radius = Math.random() * 5 + 4; // flores de terracota de 4px a 9px
        } else if (rand > 0.50) {
          type = 'heart';
          colorList = colors.heart;
          radius = Math.random() * 5 + 4; // corazones de 4px a 9px
        }

        const color = colorList[Math.floor(Math.random() * colorList.length)];

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.4 + 0.1), // Flotan hacia arriba lentamente
          radius,
          opacity: Math.random() * 0.8 + 0.2,
          color,
          type,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.01,
          swaySpeed: Math.random() * 0.01 + 0.005,
          swayOffset: Math.random() * Math.PI * 2
        });
      }
    };

    // Dibujar estrellas curvas de cuatro puntas (sagrada intención)
    const drawStar = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      angle: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.fillStyle = color;
      
      // Brillo orbital sutil
      c.shadowBlur = radius * 1.5;
      c.shadowColor = 'var(--color-dorado-mate)';
      
      c.beginPath();
      c.moveTo(0, -radius);
      c.quadraticCurveTo(0, 0, radius, 0);
      c.quadraticCurveTo(0, 0, 0, radius);
      c.quadraticCurveTo(0, 0, -radius, 0);
      c.quadraticCurveTo(0, 0, 0, -radius);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Dibujar corazones cálidos y flotantes
    const drawHeart = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      angle: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.fillStyle = color;
      
      c.beginPath();
      const topCurveHeight = radius * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(-radius * 0.6, -radius * 0.6, -radius, 0, 0, radius * 1.1);
      c.bezierCurveTo(radius, 0, radius * 0.6, -radius * 0.6, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    // Dibujar flores silvestres abstractas de 5 pétalos
    const drawFlower = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      angle: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.fillStyle = color;
      
      // Dibujar 5 pétalos circulares
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.arc(0, -radius * 0.55, radius * 0.45, 0, Math.PI * 2);
        c.fill();
        c.rotate((Math.PI * 2) / 5);
      }
      
      // Núcleo de oro champagne
      c.beginPath();
      c.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
      c.fillStyle = 'var(--color-dorado-mate)';
      c.fill();
      
      c.restore();
    };

    // Bucle de animación (60 FPS)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particles.forEach((p) => {
        // 1. Movimiento básico y viento oscilante (sway)
        p.angle += p.spin;
        p.swayOffset += p.swaySpeed;
        
        let currentVx = p.vx + Math.sin(p.swayOffset) * 0.08;
        let currentVy = p.vy;

        // 2. Interacción de Repulsión con el Mouse (Física fluida)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Radio de repulsión sensible de 160px
          const repelRadius = 160;

          if (dist < repelRadius) {
            // Fuerza proporcional a la cercanía
            const force = (repelRadius - dist) / repelRadius;
            const angle = Math.atan2(dy, dx);
            
            // Empujar partícula hacia afuera
            const pushX = Math.cos(angle) * force * 1.8;
            const pushY = Math.sin(angle) * force * 1.8;

            currentVx += pushX;
            currentVy += pushY;
          }
        }

        // Aplicar movimiento con fricción suave para que regresen al flujo natural
        p.x += currentVx;
        p.y += currentVy;

        // Fricción para frenar aceleraciones bruscas del mouse
        p.vx *= 0.98;

        // 3. Teletransporte y reseteo cíclico al salir de los bordes
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) {
          p.x = canvas.width + 20;
        } else if (p.x > canvas.width + 30) {
          p.x = -20;
        }

        // 4. Dibujar según el tipo
        if (p.type === 'star') {
          drawStar(ctx, p.x, p.y, p.radius, p.angle, p.color);
        } else if (p.type === 'flower') {
          drawFlower(ctx, p.x, p.y, p.radius, p.angle, p.color);
        } else if (p.type === 'petal') {
          // Flores de terracota también usan el dibujador de flores con su paleta cálida
          drawFlower(ctx, p.x, p.y, p.radius, p.angle, p.color);
        } else if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.radius, p.angle, p.color);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Eventos
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseLeave);

    // Iniciar bucle
    animate();

    // Limpieza
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, // En el fondo absoluto por detrás del layout
        pointerEvents: 'none', // Permite que los clicks atraviesen a los elementos interactivos
      }}
    />
  );
};
