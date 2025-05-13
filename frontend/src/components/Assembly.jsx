"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "../lib/utils"
import ToggleSwitch from "./ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "@/components/ui/badge"

export default function ManufacturingFloorLayout() {
  const [demoActive, setDemoActive] = useState(false)
  const intervalRef = useRef(null)
  const [activePoints, setActivePoints] = useState({})
  const [flashPoint, setFlashPoint] = useState(null)

  // Define all entry/exit points in the layout
  const allPoints = {
    // Sub assembly area
    "sub-assembly-entry": { type: "Entry", area: "Sub Assembly", position: "top-left" },
    "sub-assembly-exit": { type: "Exit", area: "Sub Assembly", position: "top-left" },

    // Store area
    "store-entry-top": { type: "Entry", area: "Store", position: "left" },
    "store-exit-top": { type: "Exit", area: "Store", position: "left" },
    "store-entry-bottom": { type: "Entry", area: "Store", position: "left-bottom" },
    "store-exit-bottom": { type: "Exit", area: "Store", position: "left-bottom" },

    // Manufacturing departments
    "dept1-entry": { type: "Entry", area: "Dept1", position: "top" },
    "dept1-exit": { type: "Exit", area: "Dept1", position: "top" },
    "dept2-entry": { type: "Entry", area: "Dept2", position: "top" },
    "dept2-exit": { type: "Exit", area: "Dept2", position: "top" },
    "dept3-entry": { type: "Entry", area: "Dept3", position: "top" },
    "dept3-exit": { type: "Exit", area: "Dept3", position: "top" },

    // Packaging/Shipping
    "packaging-entry-top": { type: "Entry", area: "Packaging", position: "right-top" },
    "packaging-exit-top": { type: "Exit", area: "Packaging", position: "right-top" },
    "packaging-entry-middle": { type: "Entry", area: "Packaging", position: "right-middle" },
    "packaging-exit-bottom": { type: "Exit", area: "Shipping", position: "right-bottom" },

    // Inbound/Outbound
    "inbound-entry": { type: "Entry", area: "Inbound", position: "bottom-left" },
    "inbound-exit": { type: "Exit", area: "Inbound", position: "bottom-left" },
    "outbound-entry": { type: "Entry", area: "Outbound", position: "bottom-right" },
    "outbound-exit": { type: "Exit", area: "Outbound", position: "bottom-right" },
  }

  // Demo data generator
  useEffect(() => {
    if (!demoActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setActivePoints({})
      return
    }

    // Start generating demo data
    intervalRef.current = setInterval(() => {
      // Generate a random event
      const pointIds = Object.keys(allPoints)
      const randomPointId = pointIds[Math.floor(Math.random() * pointIds.length)]
      const point = allPoints[randomPointId]

      // Determine if this will be an RFID scan (20% chance)
      const isRfidScan = Math.random() < 0.2

      // Create a fake RFID tag for RFID scans
      let rfidTag = null
      if (isRfidScan) {
        // Generate a fake RFID tag (4 bytes in hex)
        rfidTag = Array.from({ length: 4 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0"),
        ).join(" ")

        // For RFID scans, we'll flash the whole area instead of just the point
        setFlashPoint(point.area)
      } else {
        // For regular entry/exit, just flash the point
        setFlashPoint(randomPointId)
      }

      // Update active points
      setActivePoints((prev) => ({
        ...prev,
        [randomPointId]: {
          ...point,
          active: true,
          rfidTag,
          timestamp: new Date(),
        },
      }))

      // Clear flash effect after 1 second
      setTimeout(() => setFlashPoint(null), 1000)

      // Clear the active status after 3 seconds
      setTimeout(() => {
        setActivePoints((prev) => ({
          ...prev,
          [randomPointId]: {
            ...prev[randomPointId],
            active: false,
          },
        }))
      }, 3000)
    }, 2000) // Generate a new event every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [demoActive])

  const handleToggle = (checked) => {
    setDemoActive(checked)
  }

  // Helper function to get status color
  const getStatusColor = (status, isActive = true) => {
    if (!isActive) return "bg-gray-200"

    switch (status) {
      case "Entry":
        return "bg-green-500"
      case "Exit":
        return "bg-red-500"
      case "RFID Scanned":
        return "bg-orange-300"
      default:
        return "bg-gray-200"
    }
  }

  // Helper function to get badge variant based on status
  const getBadgeVariant = (type) => {
    switch (type) {
      case "Entry":
        return "success"
      case "Exit":
        return "destructive"
      case "RFID Scanned":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="mt-6 mb-6">
      <Card className="flex flex-col h-[calc(120vh-300px)] overflow-hidden bg-[#E7FFFE] dark:bg-primary/5">
        <CardHeader className="border-b ">
          <div className="flex justify-between items-center ">
            <div>
              <CardTitle>Manufacturing Floor Status</CardTitle>
              <CardDescription>Interactive floor plan with real-time activity tracking</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm", demoActive ? "text-green-500" : "text-red-500")}>
                {demoActive ? "DEMO ACTIVE" : "DEMO INACTIVE"}
              </span>
              <ToggleSwitch checked={demoActive} onChange={handleToggle} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Manufacturing Floor Layout */}
            <div className="lg:col-span-2 overflow-auto">
              <div className="border rounded-lg shadow-sm bg-card p-4 h-full dark:border-white/45 border-black/45 ">
                <h3 className="font-medium mb-4">Manufacturing Floor Layout</h3>

                {/* Layout Grid */}
                <div className="grid grid-cols-12 grid-rows-6 gap-2 h-[500px] ">
                  {/* Sub Assembly Area - Top Left */}
                  <div
                    className={cn(
                      "col-span-4 row-span-2 border rounded-lg p-2 relative dark:border-white/45 border-black/45",
                      flashPoint === "Sub Assembly" ? "bg-orange-300 animate-pulse" : "",
                    )}
                  >
                    <div className="font-medium text-sm mb-1">Sub Assembly Area</div>
                    

                    <div className="absolute bottom-2 left-2 flex space-x-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["sub-assembly-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "sub-assembly-entry" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["sub-assembly-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "sub-assembly-exit" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>
                  </div>

                  {/* Manufacturing Departments - Top Right */}
                  <div className="col-span-8 row-span-2 border rounded-lg p-2 relative dark:border-white/45 border-black/45">
                    <div className="font-medium text-sm mb-1">Manufacturing</div>

                    <div className="grid grid-cols-3 gap-2 mt-2 h-[80%]">
                      {/* Dept 1 */}
                      <div
                        className={cn(
                          "border rounded-lg p-2 relative",
                          flashPoint === "Dept1" ? "bg-orange-300 animate-pulse" : "",
                        )}
                      >
                        <div className="text-xs font-medium">Dept 1</div>
                        <div className="absolute bottom-2 left-2 flex space-x-1">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept1-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                              flashPoint === "dept1-entry" ? "animate-pulse" : "",
                            )}
                            title="Entry"
                          ></div>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept1-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                              flashPoint === "dept1-exit" ? "animate-pulse" : "",
                            )}
                            title="Exit"
                          ></div>
                        </div>
                      </div>

                      {/* Dept 2 */}
                      <div
                        className={cn(
                          "border rounded-lg p-2 relative",
                          flashPoint === "Dept2" ? "bg-orange-300 animate-pulse" : "",
                        )}
                      >
                        <div className="text-xs font-medium">Dept 2</div>
                        <div className="absolute bottom-2 left-2 flex space-x-1">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept2-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                              flashPoint === "dept2-entry" ? "animate-pulse" : "",
                            )}
                            title="Entry"
                          ></div>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept2-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                              flashPoint === "dept2-exit" ? "animate-pulse" : "",
                            )}
                            title="Exit"
                          ></div>
                        </div>
                      </div>

                      {/* Dept 3 */}
                      <div
                        className={cn(
                          "border rounded-lg p-2 relative",
                          flashPoint === "Dept3" ? "bg-orange-300 animate-pulse" : "",
                        )}
                      >
                        <div className="text-xs font-medium">Dept 3</div>
                        <div className="absolute bottom-2 left-2 flex space-x-1">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept3-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                              flashPoint === "dept3-entry" ? "animate-pulse" : "",
                            )}
                            title="Entry"
                          ></div>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              activePoints["dept3-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                              flashPoint === "dept3-exit" ? "animate-pulse" : "",
                            )}
                            title="Exit"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Area - Left Middle */}
                  <div
                    className={cn(
                      "col-span-3 row-span-3 border rounded-lg p-2 relative dark:border-white/45 border-black/45",
                      flashPoint === "Store" ? "bg-orange-300 animate-pulse" : "",
                    )}
                  >

                    <div className="absolute top-10 left-2 flex flex-col space-y-2">
                    <div className="font-medium text-sm mb-1">Store</div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["store-entry-top"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "store-entry-top" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["store-exit-top"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "store-exit-top" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>

                    <div className="absolute bottom-10 right-2 flex flex-col space-y-2">
                    <div className="font-medium text-sm mb-1">Material Handling</div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["store-entry-bottom"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "store-entry-bottom" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["store-exit-bottom"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "store-exit-bottom" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>

                  </div>

                  {/* Warehouses - Center */}
                  <div className="col-span-6 row-span-3 border rounded-lg p-2 relative dark:border-white/45 border-black/45">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div
                        className={cn(
                          "border rounded-lg p-2 h-24",
                          flashPoint === "Consumable Warehouse" ? "bg-orange-300 animate-pulse" : "",
                        )}
                      >
                        <div className="text-xs font-medium">Consumable Warehouse</div>
                      </div>
                      <div
                        className={cn(
                          "border rounded-lg p-2 h-24",
                          flashPoint === "Bulk Raw Material Warehouse" ? "bg-orange-300 animate-pulse" : "",
                        )}
                      >
                        <div className="text-xs font-medium">Bulk Raw Material Warehouse</div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "border rounded-lg p-2 mt-2",
                        flashPoint === "Cross Dock Area" ? "bg-orange-300 animate-pulse" : "",
                      )}
                    >
                      <div className="text-xs font-medium">Cross Dock Area</div>
                    </div>
                  </div>

                  {/* Packaging/Shipping - Right Middle */}
                  <div
                    className={cn(
                      "col-span-3 row-span-3 border rounded-lg p-2 relative dark:border-white/45 border-black/45",
                      flashPoint === "Packaging" || flashPoint === "Shipping" ? "bg-orange-300 animate-pulse" : "",
                    )}
                  >

                    <div className="absolute top-10 left-2 flex flex-col space-y-2">
                    <div className="font-medium text-sm mb-1 justify-start">Packaging</div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["packaging-entry-top"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "packaging-entry-top" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["packaging-exit-top"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "packaging-exit-top" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>

                    <div className="absolute bottom-10 right-2 flex flex-col space-y-2">
                    <div className="font-medium text-sm mb-1 justify-end">Shipping</div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["packaging-entry-middle"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "packaging-entry-middle" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["packaging-exit-bottom"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "packaging-exit-bottom" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>
                  </div>
                  
                  {/* Inbound - Bottom Left */}
                  <div
                    className={cn(
                      "col-span-6 row-span-1 border rounded-lg p-2 relative dark:border-white/45 border-black/45",
                      flashPoint === "Inbound" ? "bg-orange-300 animate-pulse" : "",
                    )}
                  >
                    <div className="font-medium text-sm">Inbound</div>

                    <div className="absolute top-2 right-2 flex space-x-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["inbound-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "inbound-entry" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["inbound-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "inbound-exit" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>
                  </div>

                  {/* Outbound - Bottom Right */}
                  <div
                    className={cn(
                      "col-span-6 row-span-1 border rounded-lg p-2 relative dark:border-white/45 border-black/45",
                      flashPoint === "Outbound" ? "bg-orange-300 animate-pulse" : "",
                    )}
                  >
                    <div className="font-medium text-sm">Outbound</div>

                    <div className="absolute top-2 right-2 flex space-x-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["outbound-entry"]?.active ? getStatusColor("Entry") : "bg-gray-200",
                          flashPoint === "outbound-entry" ? "animate-pulse" : "",
                        )}
                        title="Entry"
                      ></div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          activePoints["outbound-exit"]?.active ? getStatusColor("Exit") : "bg-gray-200",
                          flashPoint === "outbound-exit" ? "animate-pulse" : "",
                        )}
                        title="Exit"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">Entry</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs">Exit</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-300 mr-2"></div>
                    <span className="text-xs">RFID Scan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="lg:col-span-1 h-full overflow-hidden">
              <div className="border rounded-lg shadow-sm bg-card p-4 h-full flex flex-col">
                <h3 className="font-medium mb-4">Activity Log</h3>
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {Object.entries(activePoints)
                    .filter(([_, point]) => point.timestamp)
                    .sort((a, b) => b[1].timestamp - a[1].timestamp)
                    .slice(0, 15)
                    .map(([id, point]) => (
                      <div
                        key={id + point.timestamp?.getTime()}
                        className={cn(
                          "p-2 border rounded-md",
                          point.active ? "border-l-4" : "border",
                          point.active && point.type === "Entry"
                            ? "border-l-green-500"
                            : point.active && point.type === "Exit"
                              ? "border-l-red-500"
                              : point.active && point.rfidTag
                                ? "border-l-orange-500"
                                : "",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <Badge variant={getBadgeVariant(point.rfidTag ? "RFID Scanned" : point.type)}>
                            {point.rfidTag ? "RFID Scan" : point.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{point.timestamp?.toLocaleTimeString()}</span>
                        </div>
                        <div className="mt-1 text-sm font-medium">{point.area}</div>
                        {point.rfidTag && (
                          <div className="mt-1 text-xs font-mono p-1 rounded">UID: {point.rfidTag}</div>
                        )}
                      </div>
                    ))}
                  {Object.keys(activePoints).filter((id) => activePoints[id].timestamp).length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-8">
                      No activity recorded yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse {
        animation: pulse 0.5s ease-in-out infinite;
      }
    `}</style>
    </div>
  )
}
