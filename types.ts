
export enum EntityType {
  EMPTY = 'empty',
  WHEAT = 'wheat',
  SUNFLOWER = 'sunflower',
  ROCK = 'rock',
  CHARGING = 'charging',
  WATER = 'water',
  GOAL = 'goal'
}

export interface GridCell {
  x: number;
  y: number;
  type: EntityType;
  harvested: boolean;
  watered: boolean;
}

export interface DroneState {
  x: number;
  y: number;
  battery: number;
}

export interface Resources {
  energy: number;
  wheat: number;
  water: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success' | 'ai' | 'user';
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  gridSize: number;
  initialGrid: GridCell[][];
  initialDrone: DroneState;
  winCondition: {
    wheat?: number;
    energyMin?: number;
    reachGoal?: boolean;
  };
  hint: string;
  defaultCode?: string;
}

export enum GameStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
