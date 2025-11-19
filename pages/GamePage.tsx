
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CURRICULUM, MOVEMENT_COST } from '../constants';
import { GameStatus, DroneState, Resources, LogEntry, EntityType, LevelConfig } from '../types';
import FarmGrid from '../components/FarmGrid';
import CodeEditor from '../components/CodeEditor';
import { transpileToJs, DroneAPI } from '../services/pythonInterpreter';
import { getAiHelp } from '../services/geminiService';

const GamePage: React.FC = () => {
  // Level State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(CURRICULUM[0]);

  // Game State
  const [code, setCode] = useState<string>(CURRICULUM[0].defaultCode || "");
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [grid, setGrid] = useState(CURRICULUM[0].initialGrid);
  const [drone, setDrone] = useState<DroneState>(CURRICULUM[0].initialDrone);
  const [resources, setResources] = useState<Resources>({ energy: 100, wheat: 0, water: 50 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [speed, setSpeed] = useState<number>(1);
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Refs for execution control
  const stopSignalRef = useRef<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Date.now().toString() + Math.random(), timestamp: new Date(), message, type }]);
  };

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load Level Data
  useEffect(() => {
    const level = CURRICULUM.find(l => l.id === currentLevelId) || CURRICULUM[0];
    setCurrentLevel(level);
    resetGame(level);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelId]);

  const resetGame = useCallback((level = currentLevel) => {
    stopSignalRef.current = true; // Stop any running code
    setGrid(JSON.parse(JSON.stringify(level.initialGrid))); 
    setDrone({ ...level.initialDrone });
    setResources({ energy: 100, wheat: 0, water: 50 });
    setCode(level.defaultCode || "");
    setStatus(GameStatus.IDLE);
    setLogs([]);
  }, [currentLevel]);

  const handleRun = async () => {
    if (status === GameStatus.RUNNING) return;
    
    // Reset state but keep logs for a moment? No, clear logs.
    setGrid(JSON.parse(JSON.stringify(currentLevel.initialGrid)));
    setDrone({ ...currentLevel.initialDrone });
    setResources({ energy: 100, wheat: 0, water: 50 });
    setLogs([]);
    
    setStatus(GameStatus.RUNNING);
    stopSignalRef.current = false;
    addLog("🚀 Bắt đầu thực thi...", "info");

    try {
      const jsCode = transpileToJs(code);
      // console.log("Transpiled Code:", jsCode); // Debug
      
      // Execute
      // eslint-disable-next-line no-eval
      const runFunction = eval(jsCode);
      await runFunction(createDroneAPI());
      
      if (!stopSignalRef.current) {
         checkWinCondition();
      }
    } catch (error: any) {
      setStatus(GameStatus.FAILED);
      addLog(`Lỗi Runtime: ${error.message}`, "error");
      
      // Call AI for error help
      setIsAiThinking(true);
      const aiHint = await getAiHelp({
          code,
          errorMessage: error.message,
          goal: currentLevel.description
      });
      setIsAiThinking(false);
      addLog(aiHint, "ai");
    }
  };

  const handleStop = () => {
    stopSignalRef.current = true;
    setStatus(GameStatus.PAUSED);
    addLog("🛑 Đã dừng khẩn cấp.", "error");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!chatInput.trim() || isAiThinking) return;

      const userQuestion = chatInput;
      setChatInput("");
      addLog(userQuestion, "user");

      setIsAiThinking(true);
      const response = await getAiHelp({
          code,
          userQuestion,
          goal: currentLevel.description
      });
      setIsAiThinking(false);
      addLog(response, "ai");
  };

  // Drone API Factory
  const createDroneAPI = (): DroneAPI => {
    const delay = () => new Promise(resolve => setTimeout(resolve, 1000 / speed));
    
    const checkStop = () => {
        if (stopSignalRef.current) throw new Error("Execution Stopped");
    };

    return {
      up: async () => {
        checkStop();
        await delay();
        setDrone(d => {
           if (d.y > 0) return { ...d, y: d.y - 1 };
           throw new Error("Ra khỏi bản đồ!");
        });
        setResources(r => ({ ...r, energy: r.energy - MOVEMENT_COST }));
      },
      down: async () => {
        checkStop();
        await delay();
        setDrone(d => {
           if (d.y < currentLevel.gridSize - 1) return { ...d, y: d.y + 1 };
           throw new Error("Ra khỏi bản đồ!");
        });
        setResources(r => ({ ...r, energy: r.energy - MOVEMENT_COST }));
      },
      left: async () => {
        checkStop();
        await delay();
        setDrone(d => {
           if (d.x > 0) return { ...d, x: d.x - 1 };
           throw new Error("Ra khỏi bản đồ!");
        });
        setResources(r => ({ ...r, energy: r.energy - MOVEMENT_COST }));
      },
      right: async () => {
        checkStop();
        await delay();
        setDrone(d => {
           if (d.x < currentLevel.gridSize - 1) return { ...d, x: d.x + 1 };
           throw new Error("Ra khỏi bản đồ!");
        });
        setResources(r => ({ ...r, energy: r.energy - MOVEMENT_COST }));
      },
      harvest: async () => {
        checkStop();
        await delay();
        setDrone(currentDrone => {
            setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                const cell = { ...newGrid[currentDrone.y][currentDrone.x] };
                if ((cell.type === EntityType.WHEAT || cell.type === EntityType.SUNFLOWER) && !cell.harvested) {
                    cell.harvested = true;
                    setResources(r => ({ ...r, wheat: r.wheat + 1 }));
                    addLog("Đã thu hoạch!", "success");
                } else {
                    addLog("Không có gì để thu hoạch.", "info");
                }
                newGrid[currentDrone.y][currentDrone.x] = cell;
                return newGrid;
            });
            return currentDrone;
        });
      },
      water: async () => {
        checkStop();
        await delay();
        addLog("Đã tưới nước.", "info");
      },
      scan: async () => {
        checkStop();
        await delay();
        // Simplified scan implementation
        return new Promise((resolve) => {
             setDrone(current => {
                 const item = grid[current.y][current.x].type;
                 resolve(item);
                 return current;
             });
        });
      },
      log: (msg: any) => {
         addLog(String(msg), 'info');
      },
      battery: 100
    };
  };

  const checkWinCondition = () => {
      let won = true;
      const condition = currentLevel.winCondition;

      if (condition.wheat && resources.wheat < condition.wheat) won = false;
      if (condition.reachGoal) {
           // Basic check - detailed implementation might check coords
      }

      setTimeout(() => {
          setDrone(d => {
             const cell = grid[d.y][d.x];
             if (condition.reachGoal && cell.type !== EntityType.GOAL) won = false;
             
             if (won) {
                setStatus(GameStatus.COMPLETED);
                addLog("🎉 NHIỆM VỤ HOÀN THÀNH!", "success");
            } else {
                setStatus(GameStatus.FAILED);
                addLog("Nhiệm vụ thất bại.", "error");
            }
             return d;
          });
      }, 500);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-sky overflow-hidden">
      
      {/* Level Sidebar (Left) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 hidden md:flex">
         <div className="p-4 border-b border-gray-200 bg-gray-50">
             <h2 className="font-bold text-forest uppercase text-sm tracking-wider">Chương trình học</h2>
         </div>
         <div className="flex-1 overflow-y-auto">
             {CURRICULUM.map((level) => (
                 <button
                    key={level.id}
                    onClick={() => setCurrentLevelId(level.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 text-sm transition-all hover:bg-green-50
                        ${currentLevelId === level.id ? 'bg-green-100 border-l-4 border-l-forest font-semibold text-forest' : 'text-gray-600'}
                    `}
                 >
                     {level.name}
                     {currentLevelId === level.id && status === GameStatus.COMPLETED && <span className="float-right">✅</span>}
                 </button>
             ))}
         </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center space-x-4">
                <h2 className="font-display font-bold text-xl text-forest truncate hidden sm:block">{currentLevel.name}</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleRun} disabled={status === GameStatus.RUNNING}
                        className={`px-4 py-2 rounded-lg font-bold text-white transition-all ${status === GameStatus.RUNNING ? 'bg-gray-400' : 'bg-forest hover:bg-forest-light'}`}
                    >
                        {status === GameStatus.RUNNING ? '⏳ ...' : '▶ Chạy'}
                    </button>
                    <button 
                        onClick={handleStop} 
                        className="px-3 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                    >
                        ⏹
                    </button>
                    <button 
                        onClick={() => resetGame()}
                        className="px-3 py-2 rounded-lg font-bold text-charcoal bg-gray-200 hover:bg-gray-300 transition-all"
                    >
                        🔄
                    </button>
                </div>
            </div>
            
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm hidden lg:flex">
                    <span>Tốc độ:</span>
                    <input 
                        type="range" min="1" max="5" step="1" 
                        value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                        className="accent-amber cursor-pointer"
                    />
                </div>
                <div className="flex space-x-4 font-mono text-sm">
                    <div className="bg-amber-100 px-3 py-1 rounded text-amber-dark font-bold border border-amber-200">
                        ⚡ {resources.energy}
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded text-forest font-bold border border-green-200">
                        🌾 {resources.wheat}
                    </div>
                </div>
            </div>
        </div>

        {/* Content Columns */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* Code Editor */}
            <div className="h-1/2 md:h-full md:w-5/12 p-0 flex flex-col border-r border-gray-200">
                <CodeEditor code={code} onChange={(val) => setCode(val || '')} />
            </div>

            {/* Simulation (Center) */}
            <div className="flex-1 p-8 bg-[#e2e8f0] overflow-auto flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-5 pattern-grid-lg pointer-events-none"></div>
                <FarmGrid grid={grid} drone={drone} gridSize={currentLevel.gridSize} />
            </div>

            {/* Console (Right) */}
            <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 h-1/3 md:h-full">
                <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-600 border-b border-gray-200 flex justify-between">
                    <span>Trung tâm điều hành</span>
                    {isAiThinking && <span className="text-xs text-amber animate-pulse">AI đang nhập...</span>}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm bg-[#1e1e1e]">
                    {logs.length === 0 && <div className="text-gray-500 italic">Sẵn sàng khởi chạy...</div>}
                    {logs.map((log) => (
                        <div key={log.id} className={`
                            p-2 rounded border-l-4 
                            ${log.type === 'info' ? 'border-blue-400 text-gray-300 bg-gray-800' : ''}
                            ${log.type === 'success' ? 'border-green-500 text-green-100 bg-green-900/30' : ''}
                            ${log.type === 'error' ? 'border-red-500 text-red-100 bg-red-900/30' : ''}
                            ${log.type === 'ai' ? 'border-amber text-amber-100 bg-amber-900/20 italic' : ''}
                            ${log.type === 'user' ? 'border-gray-400 text-white bg-gray-700 text-right' : ''}
                        `}>
                            {log.type !== 'user' && <span className="opacity-50 text-xs mr-2">[{log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>}
                            {log.type === 'ai' && <span className="mr-1">🤖</span>}
                            {log.type === 'user' && <span className="mr-1">👤</span>}
                            {log.message}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-2 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input 
                           type="text" 
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           placeholder="Hỏi AI trợ giúp..."
                           disabled={isAiThinking}
                           className="flex-1 bg-gray-700 text-white text-sm rounded px-3 py-2 outline-none focus:ring-1 focus:ring-amber border border-gray-600 placeholder-gray-500 disabled:opacity-50"
                        />
                        <button 
                           type="submit" 
                           disabled={!chatInput.trim() || isAiThinking}
                           className="bg-amber hover:bg-amber-dark text-white px-3 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           ➤
                        </button>
                    </form>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 hidden md:block">
                    <h3 className="font-bold text-forest mb-2">Mục tiêu:</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{currentLevel.description}</p>
                    <p className="text-xs text-gray-500 mt-2 italic">💡 {currentLevel.hint}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
