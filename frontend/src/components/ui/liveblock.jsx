import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import ToggleSwitch from "./switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { AlertTriangle } from "lucide-react";

export default function ProductionLineAnimation() {
    const [wsStatus, setWsStatus] = useState("disconnected");
    const [transactions, setTransactions] = useState([]);
    const [currentStage, setCurrentStage] = useState(null);
    const [stageStatus, setStageStatus] = useState({}); // For blinking effects
    const [currentOrderId, setCurrentOrderId] = useState("");
    const wsRef = useRef(null);
    const ESP_IP = "10.238.198.246";
    const [flashId, setFlashId] = useState(null);
    const carRef = useRef(null);
  
    // Stage positions (as percentages)
    const stagePositions = {
      S1: 20, // Adjusted from 25
      S2: 45,
      S3: 70, // Adjusted from 75
    };

    // Map ESP32 stage names to our format
    const stageNameMap = {
      "Stage 1 (Store)": "S1",
      "Stage 2 (Sub-Assembly)": "S2", 
      "Stage 3 (Design)": "S3"
    };

    const handleStageUpdate = (message) => {
        // Check if this is a warning message
        if (message.includes("⚠️") || message.includes("without a valid order")) {
          // Handle component tag without order ID
          const newId = Date.now();
          let rfidTag = "";
          
          // Extract RFID tag
          if (message.includes("COMPONENT TAG:")) {
            const parts = message.split("COMPONENT TAG:");
            rfidTag = parts[1]?.trim().split(" ")[0] || "";
          } else if (message.includes("tag scanned without")) {
            // Extract from format like "Component tag scanned without a valid order ID: f3 cc 72 14"
            const parts = message.split("ID:");
            rfidTag = parts[1]?.trim() || "";
          }
          
          setTransactions(prev => [
            {
              id: newId,
              stage: "Warning",
              status: "Caution",
              action: "Invalid",
              rfidTag,
              carPart: "Unknown",
              orderId: "Missing",
              timestamp: new Date().toLocaleString()
            },
            ...prev.slice(0, 19)
          ]);
          
          setFlashId(newId);
          setTimeout(() => setFlashId(null), 1000);
          return;
        }
        
        // Extract stage name
        let stageName = "";
        let stagePart = "";
        
        for (const key in stageNameMap) {
          if (message.includes(key)) {
            stageName = key;
            stagePart = stageNameMap[key];
            break;
          }
        }
        
        if (!stageName) return;
        
        // Update current stage for car animation
        setCurrentStage(stagePart);
        
        // Determine action type (Entry/Exit)
        let action = "Unknown";
        if (message.includes("[Entry]")) {
          action = "Entry";
        } else if (message.includes("[Exit]")) {
          action = "Exit";
        }
        
        // Determine status type
        let status = "Unknown";
        if (message.includes("ORDER TAG:")) {
          status = "RFID Scanned";
        } else if (message.includes("COMPONENT TAG:")) {
          status = "RFID Scanned";
        } else if (message.includes("[Entry]")) {
          status = "Entry";
        } else if (message.includes("[Exit]")) {
          status = "Exit";
        }
        
        // Extract RFID tag
        let rfidTag = "";
        if (message.includes("ORDER TAG:")) {
          const parts = message.split("ORDER TAG:");
          rfidTag = parts[1]?.trim().split(" ")[0] || "";
        } else if (message.includes("COMPONENT TAG:")) {
          const parts = message.split("COMPONENT TAG:");
          rfidTag = parts[1]?.trim().split(" ")[0] || "";
        }
        
        // Extract order ID if present
        let orderId = "";
        if (message.includes("Order ID:")) {
          const parts = message.split("Order ID:");
          orderId = parts[1]?.trim() || "";
          
          // Update current order ID if this is an order tag
          if (message.includes("ORDER TAG:")) {
            setCurrentOrderId(orderId);
          }
        } else if (message.includes("Associated with Order ID:")) {
          const parts = message.split("Associated with Order ID:");
          orderId = parts[1]?.trim() || "";
        } else if (currentOrderId) {
          orderId = currentOrderId;
        }
        
        // Determine part type (order or component)
        let carPart = "Unknown";
        if (message.includes("ORDER TAG:")) {
          carPart = "Order Tag";
        } else if (message.includes("COMPONENT TAG:")) {
          carPart = "Component";
        }
        
        // Update stage status for blinking effect
        setStageStatus(prev => {
          const newStatus = { ...prev };
          
          // Clear any existing timeout for this stage
          if (newStatus[stagePart]?.timeoutId) {
            clearTimeout(newStatus[stagePart].timeoutId);
          }
          
          // Set new timeout to clear the blinking effect
          const timeoutId = setTimeout(() => {
            setStageStatus(current => ({
              ...current,
              [stagePart]: { active: false, timeoutId: null }
            }));
          }, 2000);
          
          // Update the stage status
          let statusType = "unknown";
          if (status === "RFID Scanned") {
            statusType = "rfid";
          } else if (action === "Entry") {
            statusType = "entry";
          } else if (action === "Exit") {
            statusType = "exit";
          }
          
          newStatus[stagePart] = { 
            active: true, 
            type: statusType, 
            timeoutId 
          };
          
          return newStatus;
        });
        
        // Add transaction to the list
        const newId = Date.now();
        setTransactions(prev => [
          {
            id: newId,
            stage: stageName,
            status,
            action,
            rfidTag,
            carPart,
            orderId,
            timestamp: new Date().toLocaleString()
          },
          ...prev.slice(0, 19)
        ]);
        
        setFlashId(newId);
        setTimeout(() => setFlashId(null), 1000);
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
        carRef.current.style.transition = "left 1s ease-in-out";
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
  
      // Update WebSocket message handler to parse messages from ESP32
      socket.onmessage = (event) => {
        const message = event.data;
        console.log("Received message:", message);
        
        // Process the message
        handleStageUpdate(message);
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
      "Entry": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "RFID Scanned": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "Exit": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "Caution": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
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
    <div className="mb-6">
      <Card className="flex flex-col bg-[#E7FFFE] dark:bg-primary/5">
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
        <CardContent className="p-4">
          {/* Current Order ID Display */}
          {currentOrderId && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm font-medium">Current Order: <span className="font-semibold">{currentOrderId}</span></p>
            </div>
          )}
          
          {/* Production Line Animation */}
          <div className="border border-backlighter rounded-lg p-3 sm:p-6 mb-4 relative bg-zinc-800">
            <div className="h-48 relative">
              {/* Animated dashed line */}
              <div className="absolute z-1 top-1/2 left-0 right-0 h-1 bg-transparent transform -translate-y-1/2">
                <div className="moving-dashes"></div>
              </div>
              
              {/* Production Stages */}
              <div className={`absolute z-2 bg-red-300/50 border-gray-300 top-1/2 left-[25%] transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 md:w-40 h-20 sm:h-24 md:h-28 border rounded-lg flex items-start justify-center text-xl font-bold ${getStageClass("S1")}`}>
                Store
              </div>
              <div className={`absolute z-2 bg-purple-300/50 top-1/2 left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 md:w-40 h-20 sm:h-24 md:h-28 border rounded-lg flex items-start justify-center text-xl font-bold ${getStageClass("S2")}`}>
                Sub-Assembly
              </div>
              <div className={`absolute z-2 bg-green-300/50 top-1/2 left-[75%] transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 md:w-40 h-20 sm:h-24 md:h-28 border rounded-lg flex items-start justify-center text-xl font-bold ${getStageClass("S3")}`}>
                Design
              </div>
              
              {/* Car */}
              <div 
                ref={carRef} 
                className="absolute z-3 top-1/2 transform -translate-y-1/2 w-16 sm:w-24"
                style={{ 
                  transition: "left 1s ease-in-out",
                  left: currentStage ? `${stagePositions[currentStage]}%` : "0%"
                }}
              >
                <img 
                  src="/car.png" 
                  alt="Car" 
                  className="w-full rotate-90" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.outerHTML = '<div style="width: 48px; height: 24px; background-color: red; transform: rotate(90deg);"></div>';
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
                    <TableHead className="w-[180px] bg-slate-200 dark:bg-primary/5">Stage</TableHead>
                    <TableHead className="w-[120px] bg-slate-200 dark:bg-primary/5">Status</TableHead>
                    <TableHead className="w-[120px] bg-slate-200 dark:bg-primary/5">RFID Tag</TableHead>
                    <TableHead className="w-[120px] bg-slate-200 dark:bg-primary/5">Car Part</TableHead>
                    <TableHead className="w-[120px] bg-slate-200 dark:bg-primary/5">Order ID</TableHead>
                    <TableHead className="w-[180px] bg-slate-200 dark:bg-primary/5">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <TableRow 
                        key={tx.id}
                        className={cn(
                          tx.id === flashId ? "animate-flash" : "",
                          tx.status === "Caution" ? "bg-orange-50 dark:bg-orange-900/20" : ""
                        )}
                      >
                        <TableCell className="font-medium truncate max-w-[180px]">
                          {tx.status === "Caution" ? (
                            <div className="flex items-center">
                              <AlertTriangle className="mr-1 h-4 w-4 text-orange-500" />
                              <span>{tx.stage}</span>
                            </div>
                          ) : (
                            tx.stage
                          )}
                        </TableCell>
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
                        <TableCell className="truncate max-w-[120px]">{tx.carPart}</TableCell>
                        <TableCell className="truncate max-w-[120px] font-medium">
                          {tx.orderId || "-"}
                        </TableCell>
                        <TableCell className="truncate max-w-[180px]">{tx.timestamp}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 h-32">
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
          animation: ${wsStatus === "disconnected" ? "none" : "dashMove 1s linear infinite"};
        }
        
        @keyframes blinkGreen {
          0%, 100% { background-color: inherit; }
          50% { background-color: rgba(74, 222, 128, 0.8); }
        }
        
        @keyframes blinkOrange {
          0%, 100% { background-color: inherit; }
          50% { background-color: rgba(251, 146, 60, 0.8); }
        }
        
        @keyframes blinkRed {
          0%, 100% { background-color: inherit; }
          50% { background-color: rgba(248, 113, 113, 0.8); }
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

        /* For smaller screens */
        @media (max-width: 640px) {
          .moving-dashes {
            background-size: 15px 100%;
          }
        }

        /* For very small screens */
        @media (max-width: 480px) {
          .moving-dashes {
            background-size: 10px 100%;
          }
        }
      `}</style>
    </div>
  );
}