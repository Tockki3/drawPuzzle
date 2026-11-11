import Matter from 'matter-js';
import {
  Point,
  LevelDefinition,
  DrawnObject,
  ToolMode
} from '../types';
import { sounds } from './sound';

export interface PhysicsCallbacks {
  onStarCollect: (starId: string) => void;
  onGoalReached: (targetId: string, ballId: string) => void;
  onBallImpact: (velocity: number) => void;
  onDoorTrigger?: (triggerId: string) => void;
}

export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public level: LevelDefinition;
  public drawnObjects: DrawnObject[] = [];
  public balls: Map<string, Matter.Body> = new Map();
  public targetSensors: Map<string, Matter.Body> = new Map();
  public stars: Map<string, Matter.Body> = new Map();
  public doorBodies: Map<string, Matter.Body> = new Map();
  public callbacks: PhysicsCallbacks;
  public goalTimers: Map<string, number> = new Map(); // targetId -> frames in cup

  private isRunning: boolean = true;
  private timeScale: number = 1.0;

  constructor(level: LevelDefinition, callbacks: PhysicsCallbacks) {
    this.level = level;
    this.callbacks = callbacks;

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.98, scale: 0.001 }
    });
    this.world = this.engine.world;

    this.initLevel();
    this.setupCollisionHandlers();
  }

  public setTimeScale(scale: number) {
    this.timeScale = scale;
  }

  public setRunning(running: boolean) {
    this.isRunning = running;
  }

  public initLevel() {
    Matter.World.clear(this.world, false);
    this.balls.clear();
    this.targetSensors.clear();
    this.stars.clear();
    this.doorBodies.clear();
    this.goalTimers.clear();
    this.drawnObjects = [];

    // 1. Create Level Boundaries (Canvas walls: top, bottom, left, right)
    const wallThickness = 60;
    const boundaries = [
      // Top
      Matter.Bodies.rectangle(500, -wallThickness / 2, 1200, wallThickness, { isStatic: true, label: 'wall' }),
      // Bottom
      Matter.Bodies.rectangle(500, 650 + wallThickness / 2, 1200, wallThickness, { isStatic: true, label: 'death_floor' }),
      // Left
      Matter.Bodies.rectangle(-wallThickness / 2, 325, wallThickness, 800, { isStatic: true, label: 'wall' }),
      // Right
      Matter.Bodies.rectangle(1000 + wallThickness / 2, 325, wallThickness, 800, { isStatic: true, label: 'wall' })
    ];
    Matter.World.add(this.world, boundaries);

    // 2. Create Obstacles
    this.level.obstacles.forEach((obs) => {
      let body: Matter.Body | null = null;
      const opts: Matter.IChamferableBodyDefinition = {
        isStatic: obs.isStatic ?? true,
        label: `obstacle_${obs.id}`,
        friction: obs.friction ?? 0.5,
        restitution: obs.restitution ?? 0.2
      };

      if (obs.type === 'circle' && obs.radius) {
        body = Matter.Bodies.circle(obs.x, obs.y, obs.radius, opts);
      } else if (obs.type === 'bouncer') {
        body = Matter.Bodies.rectangle(obs.x, obs.y, obs.width || 120, obs.height || 20, {
          ...opts,
          restitution: obs.restitution || 0.95,
          label: 'bouncer'
        });
      } else if (obs.type === 'door') {
        body = Matter.Bodies.rectangle(obs.x, obs.y, obs.width || 24, obs.height || 200, {
          ...opts,
          isStatic: true,
          label: `door_${obs.id}`
        });
        this.doorBodies.set(obs.id, body);
      } else {
        // Rectangle / Platform / Lever
        body = Matter.Bodies.rectangle(obs.x, obs.y, obs.width || 100, obs.height || 20, opts);
      }

      if (body) {
        if (obs.angle) {
          Matter.Body.setAngle(body, obs.angle);
        }
        Matter.World.add(this.world, body);

        // If it's a seesaw plank, add a revolute constraint
        if (obs.id === 'seesaw_plank') {
          const hinge = Matter.Constraint.create({
            pointA: { x: obs.x, y: obs.y },
            bodyB: body,
            pointB: { x: 0, y: 0 },
            length: 0,
            stiffness: 1
          });
          Matter.World.add(this.world, hinge);
        }

        // If it's a windmill blade, attach to center axis
        if (obs.id.startsWith('blade')) {
          const bladeHinge = Matter.Constraint.create({
            pointA: { x: 500, y: 340 },
            bodyB: body,
            pointB: { x: 0, y: 0 },
            length: 0,
            stiffness: 1
          });
          Matter.World.add(this.world, bladeHinge);
        }

        // If it's a pendulum bob, attach with rope constraint
        if (obs.id === 'pendulum_bob') {
          const rope = Matter.Constraint.create({
            pointA: { x: 340, y: 140 },
            bodyB: body,
            length: 240,
            stiffness: 0.9
          });
          Matter.World.add(this.world, rope);
        }
      }
    });

    // 3. Create Targets (Cups with 3 physical walls: Left wall, Right wall, Floor, plus an inner Goal Sensor)
    this.level.targets.forEach((tgt) => {
      const cupWallThickness = 10;
      const cupBottom = Matter.Bodies.rectangle(
        tgt.x,
        tgt.y + tgt.height / 2,
        tgt.width,
        cupWallThickness,
        { isStatic: true, label: `cup_bottom_${tgt.id}` }
      );
      const cupLeft = Matter.Bodies.rectangle(
        tgt.x - tgt.width / 2 + cupWallThickness / 2,
        tgt.y,
        cupWallThickness,
        tgt.height,
        { isStatic: true, label: `cup_left_${tgt.id}` }
      );
      const cupRight = Matter.Bodies.rectangle(
        tgt.x + tgt.width / 2 - cupWallThickness / 2,
        tgt.y,
        cupWallThickness,
        tgt.height,
        { isStatic: true, label: `cup_right_${tgt.id}` }
      );

      // Inner goal sensor
      const sensor = Matter.Bodies.rectangle(
        tgt.x,
        tgt.y + tgt.height / 4,
        tgt.width - cupWallThickness * 2,
        tgt.height / 2,
        {
          isStatic: true,
          isSensor: true,
          label: `goal_sensor_${tgt.id}`
        }
      );

      this.targetSensors.set(tgt.id, sensor);
      Matter.World.add(this.world, [cupBottom, cupLeft, cupRight, sensor]);
    });

    // 4. Create Stars (Sensors)
    this.level.stars.forEach((star) => {
      const starBody = Matter.Bodies.circle(star.x, star.y, star.radius, {
        isStatic: true,
        isSensor: true,
        label: `star_${star.id}`
      });
      this.stars.set(star.id, starBody);
      Matter.World.add(this.world, starBody);
    });

    // 5. Create Balls
    this.level.balls.forEach((b) => {
      const ball = Matter.Bodies.circle(b.x, b.y, b.radius, {
        density: 0.003,
        friction: 0.4,
        frictionAir: 0.005,
        restitution: 0.4,
        label: `ball_${b.id}`
      });
      this.balls.set(b.id, ball);
      Matter.World.add(this.world, ball);
    });
  }

  private setupCollisionHandlers() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];
        const labelA = bodyA.label || '';
        const labelB = bodyB.label || '';

        // Star collection
        if (labelA.startsWith('ball_') && labelB.startsWith('star_')) {
          const starId = labelB.replace('star_', '');
          this.callbacks.onStarCollect(starId);
        } else if (labelB.startsWith('ball_') && labelA.startsWith('star_')) {
          const starId = labelA.replace('star_', '');
          this.callbacks.onStarCollect(starId);
        }

        // Bouncer sound
        if (labelA === 'bouncer' || labelB === 'bouncer') {
          sounds.playBounce();
        } else if (labelA.startsWith('ball_') || labelB.startsWith('ball_')) {
          // Play impact sound proportional to relative speed
          const speedA = Matter.Vector.magnitude(bodyA.velocity);
          const speedB = Matter.Vector.magnitude(bodyB.velocity);
          const maxSpeed = Math.max(speedA, speedB);
          if (maxSpeed > 2.0) {
            this.callbacks.onBallImpact(maxSpeed);
          }
        }

        // Pressure switch trigger
        if ((labelA.includes('switch_pad') && labelB.includes('player_drawing')) ||
            (labelB.includes('switch_pad') && labelA.includes('player_drawing')) ||
            (labelA.includes('switch_pad') && labelB.includes('ball_')) ||
            (labelB.includes('switch_pad') && labelA.includes('ball_'))) {
          this.triggerDoorOpen('heavy_door');
        }
      }
    });
  }

  public triggerDoorOpen(doorId: string) {
    const door = this.doorBodies.get(doorId);
    if (door) {
      // Slide door down into ground or remove
      Matter.World.remove(this.world, door);
      this.doorBodies.delete(doorId);
      sounds.playSuccess();
    }
  }

  // Convert player stroke into realistic rigid body
  public addDrawnStroke(
    points: Point[],
    mode: ToolMode,
    color: string
  ): DrawnObject | null {
    if (points.length < 2) return null;

    // 1. Simplify points
    const simplified = this.simplifyPoints(points, 8);
    if (simplified.length < 2) return null;

    const strokeLength = this.calculateLength(simplified);
    const thickness = 14; // Line physical thickness
    const isStatic = mode === 'static';
    const isClosed = this.checkIsClosed(simplified);

    let mainBody: Matter.Body;

    if (isClosed && simplified.length >= 6) {
      // Closed loop: create solid polygon
      const matterVertices = simplified.map((p) => ({ x: p.x, y: p.y }));
      // Calculate center of mass
      const center = Matter.Vertices.centre(matterVertices);
      mainBody = Matter.Bodies.fromVertices(center.x, center.y, [matterVertices], {
        isStatic,
        density: 0.002,
        friction: 0.7,
        restitution: 0.25,
        label: 'player_drawing'
      }) || this.createCompoundLineBody(simplified, thickness, isStatic);
    } else {
      // Open line: create seamless compound body of connected capsule segments
      mainBody = this.createCompoundLineBody(simplified, thickness, isStatic);
    }

    if (!mainBody) return null;

    mainBody.label = 'player_drawing';
    Matter.World.add(this.world, mainBody);

    // If Pivot mode: attach hinge constraint at the first drawn point
    let pinPoint: Point | undefined;
    if (mode === 'pivot') {
      pinPoint = { x: simplified[0].x, y: simplified[0].y };
      const hinge = Matter.Constraint.create({
        pointA: pinPoint,
        bodyB: mainBody,
        pointB: {
          x: pinPoint.x - mainBody.position.x,
          y: pinPoint.y - mainBody.position.y
        },
        length: 0,
        stiffness: 1
      });
      Matter.World.add(this.world, hinge);
    }

    const drawnObj: DrawnObject = {
      id: `drawn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bodyId: mainBody.id,
      points: simplified,
      type: mode,
      length: strokeLength,
      color,
      timestamp: Date.now(),
      isStatic,
      pinPoint
    };

    this.drawnObjects.push(drawnObj);
    return drawnObj;
  }

  // Create seamless compound rigid body from polyline segments
  private createCompoundLineBody(points: Point[], thickness: number, isStatic: boolean): Matter.Body {
    const parts: Matter.Body[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segLength = Math.hypot(dx, dy);
      if (segLength < 1) continue;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const angle = Math.atan2(dy, dx);

      // Segment rectangle
      const rect = Matter.Bodies.rectangle(midX, midY, segLength, thickness, {
        angle,
        isStatic
      });
      parts.push(rect);

      // Vertex circle caps to round off joints smoothly
      const cap = Matter.Bodies.circle(p1.x, p1.y, thickness / 2, { isStatic });
      parts.push(cap);
    }

    // Final end cap
    const lastP = points[points.length - 1];
    parts.push(Matter.Bodies.circle(lastP.x, lastP.y, thickness / 2, { isStatic }));

    const compound = Matter.Body.create({
      parts,
      isStatic,
      friction: 0.6,
      restitution: 0.25,
      density: 0.002
    });

    return compound;
  }

  // Undo last drawn stroke
  public undoLastStroke(): DrawnObject | null {
    if (this.drawnObjects.length === 0) return null;
    const last = this.drawnObjects.pop()!;
    this.removeBodyById(last.bodyId);
    sounds.playErase();
    return last;
  }

  // Clear all drawings
  public clearDrawings() {
    this.drawnObjects.forEach((obj) => {
      this.removeBodyById(obj.bodyId);
    });
    this.drawnObjects = [];
    sounds.playErase();
  }

  // Erase drawing at specific point
  public eraseAtPoint(pt: Point, radius: number = 25): boolean {
    const bodies = Matter.Query.point(this.world.bodies, pt);
    let erased = false;

    for (const b of bodies) {
      if (b.label === 'player_drawing' || (b.parent && b.parent.label === 'player_drawing')) {
        const targetBody = b.parent || b;
        const index = this.drawnObjects.findIndex((o) => o.bodyId === targetBody.id);
        if (index !== -1) {
          this.removeBodyById(targetBody.id);
          this.drawnObjects.splice(index, 1);
          erased = true;
          sounds.playErase();
        }
      }
    }
    return erased;
  }

  private removeBodyById(bodyId: number) {
    const allBodies = Matter.Composite.allBodies(this.world);
    const body = allBodies.find((b) => b.id === bodyId);
    if (body) {
      // Also remove any constraints attached to it
      const allConstraints = Matter.Composite.allConstraints(this.world);
      allConstraints.forEach((c) => {
        if (c.bodyA?.id === bodyId || c.bodyB?.id === bodyId) {
          Matter.World.remove(this.world, c);
        }
      });
      Matter.World.remove(this.world, body);
    }
  }

  // Update physics step (60 FPS)
  public step(delta: number) {
    if (!this.isRunning) return;

    // Apply gravity zones / wind forces
    if (this.level.gravityZones) {
      const allBodies = Matter.Composite.allBodies(this.world);
      this.level.gravityZones.forEach((zone) => {
        allBodies.forEach((body) => {
          if (!body.isStatic) {
            const bx = body.position.x;
            const by = body.position.y;
            if (
              bx >= zone.x &&
              bx <= zone.x + zone.width &&
              by >= zone.y &&
              by <= zone.y + zone.height
            ) {
              Matter.Body.applyForce(body, body.position, {
                x: zone.forceX || 0,
                y: zone.forceY
              });
            }
          }
        });
      });
    }

    // Step engine
    Matter.Engine.update(this.engine, delta * this.timeScale);

    // Check goal condition (ball inside cup sensor)
    this.targetSensors.forEach((sensor, targetId) => {
      this.balls.forEach((ball, ballId) => {
        const contains = Matter.Bounds.contains(sensor.bounds, ball.position);
        if (contains) {
          const current = (this.goalTimers.get(targetId) || 0) + 1;
          this.goalTimers.set(targetId, current);

          // If ball has stayed in goal cup for at least 25 frames (~0.4s) and low speed
          const speed = Matter.Vector.magnitude(ball.velocity);
          if (current >= 25 && speed < 3.5) {
            this.callbacks.onGoalReached(targetId, ballId);
          }
        } else {
          this.goalTimers.set(targetId, 0);
        }
      });
    });
  }

  private simplifyPoints(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points;
    const result: Point[] = [points[0]];
    let last = points[0];

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      if (dist >= tolerance) {
        result.push(p);
        last = p;
      }
    }

    if (result[result.length - 1] !== points[points.length - 1]) {
      result.push(points[points.length - 1]);
    }
    return result;
  }

  private calculateLength(points: Point[]): number {
    let len = 0;
    for (let i = 0; i < points.length - 1; i++) {
      len += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    return len;
  }

  private checkIsClosed(points: Point[]): boolean {
    if (points.length < 5) return false;
    const start = points[0];
    const end = points[points.length - 1];
    return Math.hypot(end.x - start.x, end.y - start.y) < 30;
  }
}
