
import React, { useState, useEffect } from 'react';
import { EntityType, GridCell, LevelConfig } from '../types';

const LevelEditor: React.FC = () => {
  // Using strings for inputs allows empty state while typing
  const [widthInput, setWidthInput] = useState("8");
  const [heightInput, setHeightInput] = useState("8");
  const [levelName, setLevelName] = useState("Bài học mới");
  const [description, setDescription] = useState("Mô tả nhiệm vụ...");
  const [hint, setHint] = useState("Gợi ý cho học sinh...");
  const [winWheatInput, setWinWheatInput] = useState("0");

  const [selectedEntity, setSelectedEntity] = useState<EntityType>(EntityType.EMPTY);
  const [grid, setGrid] = useState<GridCell[][]>([]);

  // Initial Grid
  useEffect(() => {
    initializeGrid(8, 8);
  }, []);

  const initializeGrid = (w: number, h: number) => {
     const newGrid = Array(h).fill(null).map((_, y) => 
        Array(w).fill(null).map((_, x) => ({ x, y, type: EntityType.EMPTY, harvested: false, watered: false }))
     );
     setGrid(newGrid);
  };

  const handleApplySize = () => {
     let w = parseInt(widthInput);
     let h = parseInt(heightInput);
     
     // Validate bounds
     if (isNaN(w) || w < 5) w = 5;
     if (w > 15) w = 15;
     
     if (isNaN(h) || h < 5) h = 5;
     if (h > 15) h = 15;

     // Update inputs to reflected clamped values
     setWidthInput(w.toString());
     setHeightInput(h.toString());
     
     initializeGrid(w, h);
  };

  const toggleCell = (x: number, y: number) => {
      setGrid(prev => {
          const newGrid = prev.map(row => [...row]); // Deep copy rows
          newGrid[y][x] = { ...newGrid[y][x], type: selectedEntity };
          return newGrid;
      });
  };

  const handleExport = () => {
      const winWheat = parseInt(winWheatInput) || 0;
      const width = grid[0]?.length || 8;
      
      const levelConfig: Partial<LevelConfig> = {
          id: Date.now(),
          name: levelName,
          description: description,
          gridSize: width, 
          initialGrid: grid,
          initialDrone: { x: 0, y: 0, battery: 100 },
          winCondition: { wheat: winWheat > 0 ? winWheat : undefined },
          hint: hint
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levelConfig, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${levelName.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const tools = [
      { id: EntityType.EMPTY, icon: '⬜', label: 'Xóa' },
      { id: EntityType.WHEAT, icon: '🌾', label: 'Lúa' },
      { id: EntityType.ROCK, icon: '🪨', label: 'Đá' },
      { id: EntityType.SUNFLOWER, icon: '🌻', label: 'Hướng dương' },
      { id: EntityType.CHARGING, icon: '🔋', label: 'Sạc' },
      { id: EntityType.GOAL, icon: '🎯', label: 'Đích' },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
       {/* Sidebar */}
       <div className="w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
           <h2 className="font-display font-bold text-2xl text-forest mb-6">Soạn bài học</h2>
           
           <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học</label>
                    <input type="text" value={levelName} onChange={e => setLevelName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả nhiệm vụ</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 h-20"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gợi ý (Hint)</label>
                    <input type="text" value={hint} onChange={e => setHint(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
           </div>

           <div className="mb-6 border-t border-gray-100 pt-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước lưới (5-15)</label>
               <div className="flex space-x-2">
                   <input 
                      type="number" value={widthInput} onChange={e => setWidthInput(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2" placeholder="W" min="5" max="15"
                   />
                   <span className="self-center">x</span>
                   <input 
                      type="number" value={heightInput} onChange={e => setHeightInput(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2" placeholder="H" min="5" max="15"
                   />
               </div>
               <button onClick={handleApplySize} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-charcoal py-2 rounded text-sm font-medium transition-colors">
                   Áp dụng kích thước (Reset)
               </button>
           </div>
           
           <div className="mb-6 border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Điều kiện thắng</label>
                <div className="flex items-center space-x-2">
                    <span>Thu hoạch Lúa:</span>
                    <input type="number" value={winWheatInput} onChange={e => setWinWheatInput(e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1" />
                </div>
           </div>

           <div className="mb-6 border-t border-gray-100 pt-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Công cụ vẽ</label>
               <div className="grid grid-cols-3 gap-2">
                   {tools.map(t => (
                       <button
                          key={t.id}
                          onClick={() => setSelectedEntity(t.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded border transition-all
                             ${selectedEntity === t.id ? 'border-forest bg-green-50 ring-2 ring-forest ring-opacity-50' : 'border-gray-200 hover:bg-gray-50'}
                          `}
                       >
                           <span className="text-2xl mb-1">{t.icon}</span>
                           <span className="text-xs text-gray-600">{t.label}</span>
                       </button>
                   ))}
               </div>
           </div>

           <div className="border-t border-gray-200 pt-6">
               <button onClick={handleExport} className="w-full bg-forest text-white py-3 rounded-lg font-bold hover:bg-forest-light shadow-md transition-all flex items-center justify-center">
                   <span>📥</span> <span className="ml-2">Tải xuống Bài học (.json)</span>
               </button>
           </div>
       </div>

       {/* Canvas */}
       <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto">
           <div className="bg-white p-1 shadow-xl rounded-lg border border-gray-300 relative">
                <div 
                    className="grid gap-1 bg-gray-200 border border-gray-200"
                    style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 8}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, y) => (
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                onClick={() => toggleCell(x, y)}
                                className={`
                                    w-12 h-12 flex items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-colors
                                    ${cell.type === EntityType.ROCK ? '!bg-gray-300' : ''}
                                    ${cell.type === EntityType.WHEAT ? '!bg-amber-100' : ''}
                                    ${cell.type === EntityType.SUNFLOWER ? '!bg-yellow-50' : ''}
                                    ${cell.type === EntityType.GOAL ? '!bg-green-50' : ''}
                                    ${cell.type === EntityType.CHARGING ? '!bg-blue-50' : ''}
                                `}
                            >
                                {cell.type === EntityType.WHEAT && '🌾'}
                                {cell.type === EntityType.ROCK && '🪨'}
                                {cell.type === EntityType.SUNFLOWER && '🌻'}
                                {cell.type === EntityType.GOAL && '🎯'}
                                {cell.type === EntityType.CHARGING && '🔋'}
                            </div>
                        ))
                    ))}
                </div>
           </div>
       </div>
    </div>
  );
};

export default LevelEditor;
