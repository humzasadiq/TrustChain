"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  Clock,
  Tag,
  Layers,
  FileText,
  FileIcon as FilePdf,
  FileJson,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useTheme } from "next-themes"

// Import jsPDF for PDF export
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export default function Logging() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Mock data with more entries for better visualization
  const [transactions, setTransactions] = useState([
    {
      id: "1",
      stage: "Stage 1",
      status: "Entry",
      rfidTag: "A1B2C3D4",
      carPart: "Engine",
      timestamp: "2025-05-10 09:30:45",
      action: "Entry",
    },
    {
      id: "2",
      stage: "Stage 2",
      status: "RFID Scanned",
      rfidTag: "E5F6G7H8",
      carPart: "Transmission",
      timestamp: "2025-05-10 09:35:22",
      action: "Entry",
    },
    {
      id: "3",
      stage: "Stage 3",
      status: "Exit",
      rfidTag: "I9J0K1L2",
      carPart: "Chassis",
      timestamp: "2025-05-10 09:40:18",
      action: "Exit",
    },
    {
      id: "4",
      stage: "Stage 1",
      status: "Entry",
      rfidTag: "M3N4O5P6",
      carPart: "Brake System",
      timestamp: "2025-05-10 09:45:33",
      action: "Entry",
    },
    {
      id: "5",
      stage: "Stage 2",
      status: "RFID Scanned",
      rfidTag: "Q7R8S9T0",
      carPart: "Steering Wheel",
      timestamp: "2025-05-10 09:50:12",
      action: "Entry",
    },
    {
      id: "6",
      stage: "Stage 3",
      status: "Exit",
      rfidTag: "U1V2W3X4",
      carPart: "Dashboard",
      timestamp: "2025-05-10 09:55:47",
      action: "Exit",
    },
  ])

  const [flashId, setFlashId] = useState(null)
  const [wsStatus, setWsStatus] = useState("disconnected")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [activeFilters, setActiveFilters] = useState({
    status: "All Events",
    stage: null,
    dateRange: "All Time",
  })
  const tableRef = useRef(null)

  // Function to fetch logs from database (to be implemented)
  const fetchLogs = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // In a real implementation, you would fetch from your database
      setIsLoading(false)
    }, 800)
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.carPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.timestamp.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (activeFilters.status !== "All Events") {
      filtered = filtered.filter((tx) => {
        if (activeFilters.status === "Entry Events") return tx.status === "Entry"
        if (activeFilters.status === "RFID Scanned") return tx.status === "RFID Scanned"
        if (activeFilters.status === "Exit Events") return tx.status === "Exit"
        return true
      })
    }

    // Apply stage filter
    if (activeFilters.stage) {
      filtered = filtered.filter((tx) => tx.stage === activeFilters.stage)
    }

    // Apply date filter
    if (activeFilters.dateRange !== "All Time") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const yesterday = new Date(today - 86400000).getTime()
      const lastWeek = new Date(today - 7 * 86400000).getTime()
      const lastMonth = new Date(today - 30 * 86400000).getTime()

      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.timestamp.replace(/-/g, "/")).getTime()

        if (activeFilters.dateRange === "Today") {
          return txDate >= today
        } else if (activeFilters.dateRange === "Yesterday") {
          return txDate >= yesterday && txDate < today
        } else if (activeFilters.dateRange === "Last 7 days") {
          return txDate >= lastWeek
        } else if (activeFilters.dateRange === "Last 30 days") {
          return txDate >= lastMonth
        }
        return true
      })
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, transactions, activeFilters])

  // Initial data load
  useEffect(() => {
    fetchLogs()
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    fetchLogs()

    // Flash effect on refresh
    if (tableRef.current) {
      tableRef.current.classList.add("table-refresh-flash")
      setTimeout(() => {
        tableRef.current.classList.remove("table-refresh-flash")
      }, 500)
    }
  }

  // Export logs as CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Stage", "Status", "RFID Tag", "Car Part", "Timestamp"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx) => [tx.stage, tx.status, tx.rfidTag, tx.carPart, tx.timestamp].join(",")),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `production_logs_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export logs as PDF
  const handleExportPDF = () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(16)
      doc.text("Production Events Log", 14, 15)

      // Add timestamp
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22)

      // Create table with autotable plugin
      doc.autoTable({
        startY: 30,
        head: [["Stage", "Status", "RFID Tag", "Car Part", "Timestamp"]],
        body: filteredTransactions.map((tx) => [tx.stage, tx.status, tx.rfidTag, tx.carPart, tx.timestamp]),
        theme: isDarkMode ? "dark" : "striped",
        headStyles: {
          fillColor: isDarkMode ? [30, 41, 59] : [52, 73, 94],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: isDarkMode ? [17, 24, 39] : [240, 240, 240],
        },
      })

      // Save the PDF
      doc.save(`production_logs_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    }
  }

  // Export logs as JSON
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredTransactions, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `production_logs_${new Date().toISOString().split("T")[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Status colors for both light and dark modes
  const statusColors = {
    Entry: "bg-green-500 text-white",
    "RFID Scanned": "bg-amber-500 text-black dark:text-white",
    Exit: "bg-red-500 text-white",
  }

  const statusIcons = {
    Entry: <Clock className="h-3 w-3 mr-1" />,
    "RFID Scanned": <Tag className="h-3 w-3 mr-1" />,
    Exit: <Clock className="h-3 w-3 mr-1" />,
  }

  const stageColors = {
    "Stage 1": "bg-blue-500",
    "Stage 2": "bg-purple-500",
    "Stage 3": "bg-orange-500",
  }

  return (
    <div className="bg-[#F2FDFF] dark:bg-primary/2">
    <div className="container mx-auto py-6 pt-20 ">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 ">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              Logs
            </h1>
            <p className="text-muted-foreground mt-1">Production line event history</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Export Logs</DialogTitle>
                  <DialogDescription>Choose a format to export your log data</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                  <Button onClick={handleExportCSV} variant="outline" className="flex justify-start items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span>CSV Format</span>
                      <span className="text-xs text-muted-foreground">Export as comma-separated values</span>
                    </div>
                  </Button>

                  <Button onClick={handleExportPDF} variant="outline" className="flex justify-start items-center gap-3">
                    <FilePdf className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span>PDF Format</span>
                      <span className="text-xs text-muted-foreground">Export as a formatted document</span>
                    </div>
                  </Button>

                  <Button
                    onClick={handleExportJSON}
                    variant="outline"
                    className="flex justify-start items-center gap-3"
                  >
                    <FileJson className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span>JSON Format</span>
                      <span className="text-xs text-muted-foreground">Export as structured data</span>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-2 bg-white dark:bg-primary/0.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {activeFilters.status !== "All Events" || activeFilters.stage
                    ? activeFilters.stage || activeFilters.status
                    : "Filter"}
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, status: "All Events", stage: null }))}
                >
                  All Events
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, status: "Entry Events" }))}
                >
                  Entry Events
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, status: "RFID Scanned" }))}
                >
                  RFID Scanned
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, status: "Exit Events" }))}
                >
                  Exit Events
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, stage: "Stage 1" }))}
                >
                  Stage 1
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, stage: "Stage 2" }))}
                >
                  Stage 2
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, stage: "Stage 3" }))}
                >
                  Stage 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {activeFilters.dateRange !== "All Time" ? activeFilters.dateRange : "Date"}
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, dateRange: "All Time" }))}
                >
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, dateRange: "Today" }))}
                >
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, dateRange: "Yesterday" }))}
                >
                  Yesterday
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, dateRange: "Last 7 days" }))}
                >
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, dateRange: "Last 30 days" }))}
                >
                  Last 30 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <Card className=" shadow-sm border-slate-200 dark:border-slate-800 bg-[#E7FFFE] dark:bg-primary/5 ">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center ">
              <div >
                <CardTitle className="text-lg ">Production Events Log</CardTitle>
                <CardDescription>Historical record of all production line events</CardDescription>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium">
                {filteredTransactions.length} entries
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-350px)] overflow-hidden">
              <div className="h-full overflow-auto">
                <Table className="relative" ref={tableRef}>
                  <TableHeader className="sticky top-0 bg-[#E7FFFE] bg-[#E7FFF] dark:bg-slate-950 z-10">
                    <TableRow className="hover:bg-slate-100  dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800">
                      <TableHead className="w-[200px] font-semibold py-4 pl-4">Stage</TableHead>
                      <TableHead className="w-[150px] font-semibold py-4 pl-5">Status</TableHead>
                      <TableHead className="w-[150px] font-semibold py-4 pl-4">RFID Tag</TableHead>
                      <TableHead className="w-[150px] font-semibold py-4 pl-4">Car Part</TableHead>
                      <TableHead className="w-[200px] font-semibold py-4 pl-4">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <TableRow
                          key={tx.id}
                          className={cn(
                            "hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors border-slate-200 dark:border-slate-800",
                            tx.id === flashId ? "animate-flash" : "",
                          )}
                        >
                          <TableCell className="font-medium py-3 px-4">
                            <div className="flex items-center">
                              <div
                                className={cn("w-2 h-2 rounded-full mr-2", stageColors[tx.stage] || "bg-slate-500")}
                              ></div>
                              {tx.stage}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <span
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center min-w-[100px] justify-center",
                                statusColors[tx.status] ||
                                  "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200",
                              )}
                            >
                              {statusIcons[tx.status]}
                              {tx.status}
                              {tx.status === "RFID Scanned" && ` (${tx.action})`}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm bg-slate-50/50 dark:bg-slate-900/50 py-3 px-4">
                            {tx.rfidTag || "-"}
                          </TableCell>
                          <TableCell className="py-3 px-4">{tx.carPart}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 py-3 px-4">{tx.timestamp}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableCell colSpan={5} className="text-center py-10 h-32">
                          <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-lg font-medium">No matching logs found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
</div>
      <style jsx global>{`
        @keyframes flash {
          0%, 100% { background-color: inherit; }
          50% { background-color: rgba(99, 102, 241, 0.2); }
        }
        
        .animate-flash {
          animation: flash 0.3s ease-in-out 2;
        }
        
        @keyframes tableRefreshFlash {
          0% { background-color: rgba(99, 102, 241, 0.05); }
          100% { background-color: inherit; }
        }
        
        .table-refresh-flash {
          animation: tableRefreshFlash 0.5s ease-out;
        }
        
        /* Improve scrollbar appearance */
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        
        /* Dark mode scrollbar */
        .dark .overflow-auto::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        
        .dark .overflow-auto::-webkit-scrollbar-thumb {
          background-color: rgba(71, 85, 105, 0.5);
        }
        
        .dark .overflow-auto::-webkit-scrollbar-thumb:hover {
          background-color: rgba(100, 116, 139, 0.6);
        }
      `}</style>
    </div>
  )
}
