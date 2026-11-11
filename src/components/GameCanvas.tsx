import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';
import {
  Point,
  ToolMode,
  LevelDefinition,
  DrawnObject,
  StarObject
} from '../types';
import { PhysicsEngine } from '../game/physics';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/levels';
import { sounds } from '../game/sound';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface GameCanvasProps {
  level: LevelDefinition;
  physicsEngine: PhysicsEngine | null;
  toolMode: ToolMode;
  currentInkUsed: number;
  maxInkBudget: number;
  showHint: boolean;
  onStrokeComplete: (length: number) => void;
  onEraseStroke: (refundLength: number) => void;
  isRunning: boolean;
  starsCollected: Set<string>;
  onSandboxPlace?: (pt: Point) => void;
  isSandboxPlacing?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  physicsEngine,
  toolMode,
  currentInkUsed,
  maxInkBudget,
  showHint,
  onStrokeComplete,
  onEraseStroke,
  isRunning,
  starsCollected,
  onSandboxPlace,
  isSandboxPlacing
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ballTrailsRef = useRef<Map<string, Point[]>>(new Map());
  const animFrameRef = useRef<number | null>(null);

  // Transform client pointer coordinates into logical 1000x650 canvas coords
  const getCanvasCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT, (e.clientY - rect.top) * scaleY))
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        life: 0.9 + Math.random() * 0.1
      });
    }
  }, []);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (isSandboxPlacing && onSandboxPlace) {
      onSandboxPlace(pt);
      spawnParticles(pt.x, pt.y, '#38bdf8', 10);
      return;
    }

    if (toolMode === 'eraser') {
      if (physicsEngine) {
        physicsEngine.eraseAtPoint(pt, 30);
      }
      return;
    }

    if (currentInkUsed >= maxInkBudget) return;

    setIsDrawing(true);
    currentStrokeRef.current = [pt];
    sounds.playDraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    if (toolMode === 'eraser' && (e.buttons === 1 || e.pressure > 0)) {
      if (physicsEngine) {
        physicsEngine.eraseAtPoint(pt, 30);
      }
      return;
    }

    if (!isDrawing) return;

    const stroke = currentStrokeRef.current;
    if (stroke.length === 0) return;

    const last = stroke[stroke.length - 1];
    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);

    if (dist >= 6) {
      // Check remaining ink budget
      const nextTotalInk = currentInkUsed + dist;
      if (nextTotalInk <= maxInkBudget) {
        stroke.push(pt);
        sounds.playDraw();
      }
    }
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const stroke = currentStrokeRef.current;
    if (stroke.length >= 2 && physicsEngine) {
      let strokeColor = '#38bdf8'; // sky blue for dynamic
      if (toolMode === 'static') strokeColor = '#f59e0b'; // amber for static
      if (toolMode === 'pivot') strokeColor = '#a855f7'; // purple for pivot

      const added = physicsEngine.addDrawnStroke(stroke, toolMode, strokeColor);
      if (added) {
        onStrokeComplete(added.length);
        spawnParticles(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y, strokeColor, 8);
      }
    }
    currentStrokeRef.current = [];
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    finishDrawing();
  };

  const handlePointerCancel = () => {
    finishDrawing();
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // 1. Step Physics
      if (physicsEngine && isRunning) {
        physicsEngine.step(delta * 1000);
      }

      // 2. Clear canvas with blueprint drafting grid
      ctx.fillStyle = '#0f172a'; // Deep slate background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      ctx.beginPath();
      for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
      }
      ctx.stroke();

      // Draw faint coordinate marks
      ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('+ [0,0]', 8, 16);
      ctx.fillText('+ [1000,650]', CANVAS_WIDTH - 84, CANVAS_HEIGHT - 10);

      // 3. Render Gravity Zones / Wind Streams
      if (level.gravityZones) {
        level.gravityZones.forEach((zone) => {
          const isUp = zone.forceY < 0;
          const isRight = (zone.forceX || 0) > 0;

          // Gradient
          const grad = ctx.createLinearGradient(
            zone.x,
            zone.y,
            zone.x + (zone.forceX ? zone.width : 0),
            zone.y + (zone.forceY ? zone.height : 0)
          );
          if (isUp) {
            grad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
            grad.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
          } else {
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
          }

          ctx.fillStyle = grad;
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

          // Border dashes
          ctx.strokeStyle = isUp ? 'rgba(192, 132, 252, 0.6)' : 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
          ctx.setLineDash([]);

          // Animated arrows
          const arrowOffset = (time / 30) % 24;
          ctx.fillStyle = isUp ? '#c084fc' : '#38bdf8';
          ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
          ctx.fillText(zone.label || '특수 기류 존', zone.x + 12, zone.y + 20);

          for (let ax = zone.x + 30; ax < zone.x + zone.width - 20; ax += 50) {
            for (let ay = zone.y + 30; ay < zone.y + zone.height - 20; ay += 50) {
              ctx.beginPath();
              if (isUp) {
                const py = ay - arrowOffset;
                if (py > zone.y + 20 && py < zone.y + zone.height - 10) {
                  ctx.moveTo(ax, py);
                  ctx.lineTo(ax - 5, py + 8);
                  ctx.lineTo(ax + 5, py + 8);
                  ctx.fill();
                }
              } else if (isRight) {
                const px = ax + arrowOffset;
                if (px > zone.x + 20 && px < zone.x + zone.width - 10) {
                  ctx.moveTo(px, ay);
                  ctx.lineTo(px - 8, ay - 5);
                  ctx.lineTo(px - 8, ay + 5);
                  ctx.fill();
                }
              }
            }
          }
        });
      }

      // 4. Render Obstacles
      if (physicsEngine) {
        level.obstacles.forEach((obs) => {
          ctx.save();
          if (obs.type === 'door') {
            // Check if door is open
            if (!physicsEngine.doorBodies.has(obs.id)) {
              ctx.restore();
              return;
            }
            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2;
            const dw = obs.width || 24;
            const dh = obs.height || 200;
            ctx.fillRect(obs.x - dw / 2, obs.y - dh / 2, dw, dh);
            ctx.strokeRect(obs.x - dw / 2, obs.y - dh / 2, dw, dh);

            // Door warning hazard stripes
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            for (let sy = obs.y - dh / 2; sy < obs.y + dh / 2; sy += 24) {
              ctx.fillRect(obs.x - dw / 2, sy, dw, 10);
            }
          } else if (obs.type === 'bouncer') {
            const bw = obs.width || 120;
            const bh = obs.height || 20;
            ctx.fillStyle = '#059669';
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(obs.x - bw / 2, obs.y - bh / 2, bw, bh, 6);
            ctx.fill();
            ctx.stroke();

            // Spring chevrons
            ctx.fillStyle = '#6ee7b7';
            ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ BOUNCE ⚡', obs.x, obs.y + 4);
          } else if (obs.type === 'circle' && obs.radius) {
            ctx.fillStyle = obs.color || '#475569';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Rectangle / Seesaw plank
            let rx = obs.x;
            let ry = obs.y;
            let rAngle = obs.angle || 0;

            // If it's a dynamic body like seesaw_plank or windmill blade, get position & angle from Matter body!
            const allBodies = Matter.Composite.allBodies(physicsEngine.world);
            const body = allBodies.find((b) => b.label === `obstacle_${obs.id}`);
            if (body) {
              rx = body.position.x;
              ry = body.position.y;
              rAngle = body.angle;
            }

            ctx.translate(rx, ry);
            ctx.rotate(rAngle);

            const w = obs.width || 100;
            const h = obs.height || 20;

            ctx.fillStyle = obs.color || '#334155';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-w / 2, -h / 2, w, h, 4);
            ctx.fill();
            ctx.stroke();

            // Rivets on static platforms
            if (obs.isStatic && w > 60) {
              ctx.fillStyle = '#94a3b8';
              ctx.beginPath();
              ctx.arc(-w / 2 + 10, 0, 3, 0, Math.PI * 2);
              ctx.arc(w / 2 - 10, 0, 3, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.rotate(-rAngle);
            ctx.translate(-rx, -ry);
          }
          ctx.restore();
        });
      }

      // 5. Render Target Cups
      level.targets.forEach((tgt) => {
        ctx.save();
        const tx = tgt.x;
        const ty = tgt.y;
        const tw = tgt.width;
        const th = tgt.height;

        // Glowing cup container base
        const cupGrad = ctx.createLinearGradient(tx, ty - th / 2, tx, ty + th / 2);
        cupGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
        cupGrad.addColorStop(1, 'rgba(59, 130, 246, 0.45)');

        ctx.fillStyle = cupGrad;
        ctx.fillRect(tx - tw / 2, ty - th / 2, tw, th);

        // Cup walls
        ctx.strokeStyle = tgt.color || '#3b82f6';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Left rim -> Left bottom -> Right bottom -> Right rim
        ctx.moveTo(tx - tw / 2, ty - th / 2);
        ctx.lineTo(tx - tw / 2, ty + th / 2);
        ctx.lineTo(tx + tw / 2, ty + th / 2);
        ctx.lineTo(tx + tw / 2, ty - th / 2);
        ctx.stroke();

        // Pulsing target beacon light in cup
        const pulse = 0.5 + Math.sin(time / 200) * 0.5;
        ctx.fillStyle = tgt.color || '#3b82f6';
        ctx.globalAlpha = 0.3 + pulse * 0.4;
        ctx.beginPath();
        ctx.ellipse(tx, ty + th / 2 - 8, tw / 3, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Label
        ctx.fillStyle = '#93c5fd';
        ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tgt.label || 'GOAL', tx, ty - th / 2 - 8);

        ctx.restore();
      });

      // 6. Render Stars
      level.stars.forEach((star, idx) => {
        const isCollected = starsCollected.has(star.id);
        if (isCollected) return;

        ctx.save();
        const floatOffset = Math.sin(time / 250 + idx * 1.5) * 4;
        const sx = star.x;
        const sy = star.y + floatOffset;
        const starRadius = star.radius;

        // Golden aura
        const auraGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, starRadius * 2);
        auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        auraGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, starRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw 5-pointed star
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = starRadius;
        const innerRadius = starRadius * 0.48;
        let rot = (Math.PI / 2) * 3 + (time / 1000) * 0.5;
        let x = sx;
        let y = sy;
        const step = Math.PI / spikes;

        ctx.moveTo(sx, sy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = sx + Math.cos(rot) * outerRadius;
          y = sy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = sx + Math.cos(rot) * innerRadius;
          y = sy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // 7. Render Player Drawn Objects (Rigid Bodies)
      if (physicsEngine) {
        const allBodies = Matter.Composite.allBodies(physicsEngine.world);

        physicsEngine.drawnObjects.forEach((drawn) => {
          const body = allBodies.find((b) => b.id === drawn.bodyId);
          if (!body) return;

          ctx.save();

          // If compound body with parts
          const partsToRender = body.parts.length > 1 ? body.parts.slice(1) : [body];

          partsToRender.forEach((part) => {
            const vertices = part.vertices;
            if (!vertices || vertices.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let v = 1; v < vertices.length; v++) {
              ctx.lineTo(vertices[v].x, vertices[v].y);
            }
            ctx.closePath();

            ctx.fillStyle = drawn.color || '#38bdf8';
            ctx.shadowColor = drawn.isStatic ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.35)';
            ctx.shadowBlur = 6;
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          // If pinned (Pivot mode), render brass hinge pin
          if (drawn.pinPoint) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawn.pinPoint.x, drawn.pinPoint.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(drawn.pinPoint.x, drawn.pinPoint.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // 8. Render Balls (with 3D sphere gradient and rolling tick mark)
      if (physicsEngine) {
        physicsEngine.balls.forEach((ballBody, ballId) => {
          const bx = ballBody.position.x;
          const by = ballBody.position.y;
          const ballConfig = level.balls.find((b) => b.id === ballId);
          const r = ballConfig?.radius || 14;
          const ballColor = ballConfig?.color || '#ef4444';

          // Update motion trail
          let trail = ballTrailsRef.current.get(ballId);
          if (!trail) {
            trail = [];
            ballTrailsRef.current.set(ballId, trail);
          }
          trail.push({ x: bx, y: by });
          if (trail.length > 16) trail.shift();

          // Draw fading trail
          for (let t = 0; t < trail.length - 1; t++) {
            const alpha = (t / trail.length) * 0.4;
            ctx.fillStyle = ballColor;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(trail[t].x, trail[t].y, r * (0.3 + (t / trail.length) * 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;

          // Ball 3D radial sphere
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(ballBody.angle);

          const sphereGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
          sphereGrad.addColorStop(0, '#ffffff');
          sphereGrad.addColorStop(0.3, ballColor);
          sphereGrad.addColorStop(1, '#991b1b'); // Darker shade at rim

          ctx.fillStyle = sphereGrad;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Rolling crosshair mark so rotation is physically tangible
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-r * 0.6, 0);
          ctx.lineTo(r * 0.6, 0);
          ctx.moveTo(0, -r * 0.6);
          ctx.lineTo(0, r * 0.6);
          ctx.stroke();

          ctx.restore();
        });
      }

      // 9. Render Ghost Hint Strokes (if activated)
      if (showHint && level.hintStrokes) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -(time / 40);

        level.hintStrokes.forEach((stroke) => {
          if (stroke.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 10. Render Active In-Progress Drawing Stroke
      const activeStroke = currentStrokeRef.current;
      if (activeStroke.length >= 2) {
        ctx.save();
        let activeColor = '#38bdf8';
        if (toolMode === 'static') activeColor = '#f59e0b';
        if (toolMode === 'pivot') activeColor = '#a855f7';

        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(activeStroke[0].x, activeStroke[0].y);
        for (let i = 1; i < activeStroke.length; i++) {
          ctx.lineTo(activeStroke[i].x, activeStroke[i].y);
        }
        ctx.stroke();

        // Tip circle
        const lastP = activeStroke[activeStroke.length - 1];
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lastP.x, lastP.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 11. Render Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity on particles
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [level, physicsEngine, toolMode, isRunning, showHint, starsCollected]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none"
    >
      <div className="relative max-w-full aspect-[1000/650] w-full max-h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full h-full block touch-none ${
            toolMode === 'eraser' ? 'cursor-erase' : 'cursor-draw'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>
    </div>
  );
};
