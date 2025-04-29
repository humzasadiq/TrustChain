import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import ToggleSwitch from "./switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export default function ProductionLineAnimation() {
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [transactions, setTransactions] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [stageStatus, setStageStatus] = useState({}); // For blinking effects
  const wsRef = useRef(null);
  const ESP_IP = "192.168.43.242";
  const [flashId, setFlashId] = useState(null);
  const animationRef = useRef(null);
  const carRef = useRef(null);

  // Stage positions (as percentages)
  const stagePositions = {
    S1: 25,
    S2: 50,
    S3: 75,
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle car animation based on current stage
  useEffect(() => {
    if (currentStage && carRef.current) {
      const position = stagePositions[currentStage] || 0;
      carRef.current.style.transition = "left 1.5s ease-in-out";
      carRef.current.style.left = `${position}%`;
    }
  }, [currentStage]);

  // Handle stage status changes for blinking effects
  useEffect(() => {
    const clearBlinkEffects = () => {
      Object.keys(stageStatus).forEach(stage => {
        if (stageStatus[stage].timeoutId) {
          clearTimeout(stageStatus[stage].timeoutId);
        }
      });
    };

    return () => clearBlinkEffects();
  }, [stageStatus]);

  const connectWebSocket = () => {
    setWsStatus("connecting");
    const socket = new WebSocket(`ws://${ESP_IP}/ws`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWsStatus("connected");
    };

    socket.onmessage = (event) => {
      const message = event.data;
      const idx = message.indexOf(' [');
      const stage = idx !== -1 ? message.substring(0, idx) : message;
      
      // Update current stage for car animation
      if (stage.includes("S1") || stage.includes("S2") || stage.includes("S3")) {
        const stageName = stage.includes("S1") ? "S1" : 
                          stage.includes("S2") ? "S2" : 
                          stage.includes("S3") ? "S3" : null;
        setCurrentStage(stageName);
        
        // Set blinking effect
        let statusType = "unknown";
        if (message.includes("UID:")) {
          statusType = "rfid";
        } else if (message.includes("[Entry]")) {
          statusType = "entry";
        } else if (message.includes("[Exit]")) {
          statusType = "exit";
        }
        
        // Apply blinking effect to the stage
        if (stageName) {
          setStageStatus(prev => {
            // Clear previous timeout if exists
            if (prev[stageName]?.timeoutId) {
              clearTimeout(prev[stageName].timeoutId);
            }
            
            // Set new timeout
            const timeoutId = setTimeout(() => {
              setStageStatus(current => ({
                ...current,
                [stageName]: { ...current[stageName], active: false, timeoutId: null }
              }));
            }, 2000);
            
            return {
              ...prev,
              [stageName]: { active: true, type: statusType, timeoutId }
            };
          });
        }
      }

      // Process for transaction table
      let status = "Unknown";
      if (message.includes("UID:")) {
        status = "RFID Scanned";
      } else if (message.includes("[Entry]")) {
        status = "Entry";
      } else if (message.includes("[Exit]")) {
        status = "Exit";
      }

      const action = message.includes("[Exit]") ? "Exit" : "Entry";

      let rfidTag = "";
      if (message.includes("UID:")) {
        const parts = message.split("UID:");
        rfidTag = parts[1]?.trim() || "";
      }

      const newId = Date.now();
      setTransactions(prev => [
        {
          id: newId,
          stage,
          status,
          action,
          rfidTag,
          carPart: "Unknown",
          timestamp: new Date().toLocaleString()
        },
        ...prev.slice(0, 19)
      ]);
      
      setFlashId(newId);
      setTimeout(() => setFlashId(null), 1000);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus("disconnected");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
      socket.close();
    };
  };

  const handleToggle = (checked) => {
    if (checked) {
      connectWebSocket();
    } else {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setWsStatus("disconnected");
    }
  };

  const statusColors = {
    Entry: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "RFID Scanned": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Exit: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  // Get stage class based on status
  const getStageClass = (stageName) => {
    if (!stageStatus[stageName]?.active) return "";
    
    const type = stageStatus[stageName]?.type;
    if (type === "entry") return "stage-blink-green";
    if (type === "rfid") return "stage-blink-orange";
    if (type === "exit") return "stage-blink-red";
    return "";
  };

  return (
    <div className="mt-6 mb-6">
      <Card className="flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Production Line Tracking</CardTitle>
              <CardDescription>Real-time manufacturing stage updates</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm",
                wsStatus === "connected" ? "text-green-500" :
                  wsStatus === "connecting" ? "text-yellow-500" : "text-red-500"
              )}>
                {wsStatus.toUpperCase()}
              </span>
              <ToggleSwitch
                checked={wsStatus === "connected"}
                onChange={handleToggle}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Production Line Animation */}
          <div className="border border-gray-200 rounded-lg p-6 mb-8 relative">
            <div className="h-64 relative">
              {/* Animated dashed line */}
              <div className="absolute z-1 top-1/2 left-0 right-0 h-1 bg-transparent transform -translate-y-1/2">
                <div className="moving-dashes"></div>
              </div>
              
              {/* Production Stages */}
              <div className={`absolute z-2 bg-red-300/90 border-backlighter top-1/2 left-[25%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-28 border rounded-lg flex items-center justify-center text-2xl font-bold ${getStageClass("S1")}`}>
                S1
              </div>
              <div className={`absolute z-2 bg-blue-300/90 top-1/2 left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-28 border rounded-lg flex items-center justify-center text-2xl font-bold ${getStageClass("S2")}`}>
                S2
              </div>
              <div className={`absolute z-2 bg-orange-300/90 top-1/2 left-[75%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-28 border rounded-lg flex items-center justify-center text-2xl font-bold ${getStageClass("S3")}`}>
                S3
              </div>
              
              {/* Car */}
              <div 
                ref={carRef} 
                className="absolute z-3 top-1/2 left-0 transform -translate-y-13 w-26"
                style={{ transition: "left 1.5s ease-in-out" }}
              >
                <img 
                  src="/car.png" 
                  alt="Car" 
                  className="w-full rotate-90 " 
                  onError={(e) => {
                    e.target.style.background = "red";
                    e.target.style.width = "100%";
                    e.target.style.height = "100%";
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Transaction Table */}
          <div className="h-[calc(100vh-500px)] overflow-hidden">
            <div className="h-full overflow-auto">
              <Table className="relative">
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[200px]">Stage</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="w-[150px]">RFID Tag</TableHead>
                    <TableHead className="w-[150px]">Car Part</TableHead>
                    <TableHead className="w-[200px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <TableRow 
                        key={tx.id}
                        className={tx.id === flashId ? "animate-flash" : ""}
                      >
                        <TableCell className="font-medium truncate max-w-[200px]">{tx.stage}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium inline-block min-w-[80px] text-center",
                            statusColors[tx.status] || "bg-gray-100 text-gray-800"
                          )}>
                            {tx.status}{tx.status === "RFID Scanned" && ` (${tx.action})`}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.rfidTag || "-"}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">{tx.carPart}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{tx.timestamp}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 h-32">
                        {wsStatus === "connected"
                          ? "Waiting for production events..."
                          : "Connection to IoT device offline"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style jsx global>{`
        @keyframes flash {
          0%, 100% { background-color: inherit; }
          50% { background-color: rgba(99, 102, 241, 0.2); }
        }
        
        .animate-flash {
          animation: flash 0.3s ease-in-out 2;
        }
        
        @keyframes dashMove {
          0% { background-position: 0 0; }
          100% { background-position: 50px 0; }
        }
        
        .moving-dashes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(to right, #e5e7eb 50%, transparent 50%);
          background-size: 20px 100%;
          animation: dashMove 1s linear infinite;
        }
        
        @keyframes blinkGreen {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(74, 222, 128, 0.3); }
        }
        
        @keyframes blinkOrange {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(251, 146, 60, 0.3); }
        }
        
        @keyframes blinkRed {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(248, 113, 113, 0.3); }
        }
        
        .stage-blink-green {
          animation: blinkGreen 0.5s ease-in-out infinite;
        }
        
        .stage-blink-orange {
          animation: blinkOrange 0.5s ease-in-out infinite;
        }
        
        .stage-blink-red {
          animation: blinkRed 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}