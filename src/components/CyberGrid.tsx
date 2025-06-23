import React, { useEffect, useRef } from 'react';

const CyberGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = Math.max(60, Math.min(100, canvas.width / 25));
      const opacity = 0.015 + Math.sin(time * 0.0008) * 0.005;
      
      ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
      ctx.lineWidth = 0.5;

      // Vertical lines with subtle animation
      for (let x = 0; x <= canvas.width; x += gridSize) {
        const offset = Math.sin(time * 0.001 + x * 0.008) * 1;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines with subtle animation
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const offset = Math.cos(time * 0.001 + y * 0.008) * 1;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Subtle accent lines - very rare
      if (Math.random() > 0.998) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * canvas.height);
        ctx.lineTo(canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      // Vertical accent lines - very rare
      if (Math.random() > 0.999) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, 0);
        ctx.lineTo(Math.random() * canvas.width, canvas.height);
        ctx.stroke();
      }

      time += 16;
    };

    const animate = () => {
      drawGrid();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 1 }}
    />
  );
};

export default CyberGrid;