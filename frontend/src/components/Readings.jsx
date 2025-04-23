import { useState, useEffect, useRef } from "react"
import { cn } from "../lib/utils"
import ToggleSwitch from "./ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

export default function TrustChainIOTReadings() {
    const [wsStatus, setWsStatus] = useState("disconnected")
    const [transactions, setTransactions] = useState([])
    const wsRef = useRef(null)
    const tableContainerRef = useRef(null)
    const ESP_IP = "192.168.43.242"
    const [flashId, setFlashId] = useState(null)

    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    const connectWebSocket = () => {
        setWsStatus("connecting")
        const socket = new WebSocket(`ws://${ESP_IP}/ws`)
        wsRef.current = socket

        socket.onopen = () => {
            console.log("WebSocket connected")
            setWsStatus("connected")
        }

        socket.onmessage = (event) => {
            const message = event.data


            const idx = message.indexOf(' [')
            const stage = idx !== -1 ? message.substring(0, idx) : message


            let status = "Unknown"
            if (message.includes("UID:")) {
                status = "RFID Scanned"
            } else if (message.includes("[Entry]")) {
                status = "Entry"
            } else if (message.includes("[Exit]")) {
                status = "Exit"
            }


            const action = message.includes("[Exit]") ? "Exit" : "Entry"


            let rfidTag = ""
            if (message.includes("UID:")) {
                const parts = message.split("UID:")
                rfidTag = parts[1]?.trim() || ""
            }

            const newId = Date.now()
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
            ])
            
            setFlashId(newId)
            setTimeout(() => setFlashId(null), 1000)
        }

        socket.onclose = () => {
            console.log("WebSocket disconnected")
            setWsStatus("disconnected")
        }

        socket.onerror = (err) => {
            console.error("WebSocket error", err)
            socket.close()
        }
    }

    const handleToggle = (checked) => {
        if (checked) {
            connectWebSocket()
        } else {
            if (wsRef.current) {
                wsRef.current.close()
            }
            setWsStatus("disconnected")
        }
    }

    const statusColors = {
        Entry: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        "RFID Scanned": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        Exit: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }

    return (
        <div className="mt-6 mb-6">
            <Card className="h-[calc(100vh-300px)] flex flex-col">
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
                <CardContent className="flex-1 overflow-hidden p-0">
                    <div ref={tableContainerRef} className="h-full overflow-auto">
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
                                        <TableCell colSpan={5} className="text-center py-4 h-[calc(100vh-400px)]">
                                            {wsStatus === "connected"
                                                ? "Waiting for production events..."
                                                : "Connection to IoT device offline"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
            `}</style>
        </div>
    )
}