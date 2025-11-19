import React from 'react';
import { GridCell, DroneState, EntityType } from '../types';

interface FarmGridProps {
  grid: GridCell[][];
  drone: DroneState;
  gridSize: number;
}

const FarmGrid: React.FC<FarmGridProps> = ({ grid, drone, gridSize }) => {
  
  const getCellContent = (cell: GridCell) => {
    switch (cell.type) {
      case EntityType.WHEAT:
        return <span className="text-2xl">{cell.harvested ? '🌱' : '🌾'}</span>;
      case EntityType.SUNFLOWER:
        return <span className="text-2xl">{cell.harvested ? '🌱' : '🌻'}</span>;
      case EntityType.ROCK:
        return <span className="text-2xl">🪨</span>;
      case EntityType.CHARGING:
        return <span className="text-2xl">🔋</span>;
      case EntityType.WATER:
        return <span className="text-2xl">💧</span>;
      case EntityType.GOAL:
        return <span className="text-2xl">🎯</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-gray-100 p-4 rounded-xl shadow-lg border border-gray-200 inline-block">
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: `${gridSize * 3.5}rem`,
          height: `${gridSize * 3.5}rem`
        }}
      >
        {grid.map((row, y) => (
          row.map((cell, x) => (
            <div 
              key={`${x}-${y}`}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-md flex items-center justify-center relative
                transition-colors duration-300
                ${cell.type === EntityType.EMPTY ? 'bg-white' : ''}
                ${cell.type === EntityType.ROCK ? 'bg-gray-300' : ''}
                ${(cell.type === EntityType.WHEAT || cell.type === EntityType.SUNFLOWER) && !cell.harvested ? 'bg-amber-100' : ''}
                ${cell.harvested ? 'bg-green-100' : ''}
                border border-gray-200 hover:border-amber
              `}
            >
              {getCellContent(cell)}
            </div>
          ))
        ))}
      </div>

      {/* Drone Layer */}
      <div 
        className="absolute top-4 left-4 pointer-events-none transition-all duration-500 ease-in-out z-10"
        style={{
          transform: `translate(${drone.x * (3.5 + 0.25)}rem, ${drone.y * (3.5 + 0.25)}rem)`
        }}
      >
         <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center animate-float">
            <span className="text-4xl filter drop-shadow-md">🤖</span>
         </div>
      </div>
    </div>
  );
};

export default FarmGrid;