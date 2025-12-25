'use client';

import { useEffect } from 'react';

export default function CursorComponent() {
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('cursor-follower');
    const root = document.documentElement;

    let mouseX = 0,
      mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
      }

      if (follower) {
        follower.style.transform = `translate(${mouseX - 15}px, ${mouseY - 15}px)`;
      }

      root.style.setProperty('--cursor-x', (mouseX / window.innerWidth) * 100 + '%');
      root.style.setProperty('--cursor-y', (mouseY / window.innerHeight) * 100 + '%');
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Canvas background animation
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let width = canvas.width;
        let height = canvas.height;
        let clouds: Array<{
          x: number;
          y: number;
          r: number;
          color: string;
          vx: number;
          vy: number;
        }> = [];

        function init() {
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
          clouds = [];
          for (let i = 0; i < 15; i++) {
            clouds.push({
              x: Math.random() * width,
              y: Math.random() * height,
              r: Math.random() * 200 + 150,
              color: Math.random() > 0.5 ? '#064e3b' : '#1e1b4b',
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
            });
          }
        }

        function draw() {
          ctx!.fillStyle = '#020617';
          ctx!.fillRect(0, 0, width, height);

          clouds.forEach((c) => {
            c.x += c.vx;
            c.y += c.vy;
            if (c.x < -c.r) c.x = width + c.r;
            if (c.x > width + c.r) c.x = -c.r;
            if (c.y < -c.r) c.y = height + c.r;
            if (c.y > height + c.r) c.y = -c.r;

            const grad = ctx!.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
            grad.addColorStop(0, c.color);
            grad.addColorStop(1, 'transparent');
            ctx!.fillStyle = grad;
            ctx!.beginPath();
            ctx!.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx!.fill();
          });
          requestAnimationFrame(draw);
        }

        window.addEventListener('resize', init);
        init();
        draw();
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <canvas id="bg-canvas"></canvas>
      <div id="custom-cursor"></div>
      <div id="cursor-follower"></div>
    </>
  );
}
