export type ToolMode = 'dynamic' | 'static' | 'pivot' | 'eraser';

export type GameState = 'playing' | 'paused' | 'cleared' | 'failed' | 'sandbox';

export type VisualTheme = 'blueprint' | 'chalkboard' | 'notebook';

export interface Point {
  x: number;
  y: number;
}

export interface BallConfig {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isStatic?: boolean;
}

export interface TargetGoal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  angle?: number;
  targetBallColor?: string;
  label?: string;
}

export interface StarObject {
  id: string;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

export interface ObstacleConfig {
  id: string;
  type: 'rectangle' | 'circle' | 'slope' | 'bypasser' | 'bouncer' | 'lever' | 'door';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  angle?: number;
  isStatic?: boolean;
  restitution?: number;
  friction?: number;
  color?: string;
  // For lever / seesaw
  pivotPoint?: Point;
  // For switches / doors
  switchTriggerId?: string;
}

export interface GravityZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  forceY: number; // negative for anti-gravity
  forceX?: number;
  label?: string;
}

export interface LevelDefinition {
  id: number;
  title: string;
  titleEn: string;
  subtitle: string;
  inkBudget: number; // max length in pixels for 100% ink
  parTime: number; // target time in seconds
  balls: BallConfig[];
  targets: TargetGoal[];
  stars: StarObject[];
  obstacles: ObstacleConfig[];
  gravityZones?: GravityZone[];
  hintStrokes?: Point[][];
  description: string;
}

export interface DrawnObject {
  id: string;
  bodyId: number;
  points: Point[];
  type: ToolMode;
  length: number;
  color: string;
  timestamp: number;
  isStatic: boolean;
  pinPoint?: Point;
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  starsEarned: number;
  bestInkRatio: number;
  bestTime: number;
}
