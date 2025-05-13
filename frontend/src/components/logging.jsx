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
  ShieldCheck,
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

// Import jsPDF and jspdf-autotable correctly
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export default function Logging() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const [transactions, setTransactions] = useState([])
  const [flashId, setFlashId] = useState(null)
  const [wsStatus, setWsStatus] = useState("disconnected")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [activeFilters, setActiveFilters] = useState({
    status: "All Events",
    stage: null,
    dateRange: "All Time",
  })
  const tableRef = useRef(null)
  const [uniqueStages, setUniqueStages] = useState([])
  const [dateFilterDebug, setDateFilterDebug] = useState({
    enabled: false,
    timestamps: [],
    parsedDates: [],
  })

  // Function to fetch logs from database
  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      // Make API call to get stage events
      const response = await fetch("http://localhost:5000/api/get-stage-events")
      const data = await response.json()

      if (data.success && data.eventResult) {
        // Transform the data to match our component's expected format
        const formattedData = data.eventResult.map((event, index) => ({
          id: event.id || index.toString(),
          stage: event.stage || "Unknown",
          status: event.status || "Unknown",
          rfidTag: event.uid || "-",
          carPart: event.car_part || "Unknown", // This might need adjustment based on your actual data structure
          timestamp: event.timestamp || new Date().toLocaleString(),
          action: event.status === "Present" ? "Entry" : event.status === "Left" ? "Exit" : "Unknown",
          transaction_address: event.transaction_address || null,
        }))

        setTransactions(formattedData)

        // Extract unique stages for dynamic filtering
        const stages = [...new Set(formattedData.map((item) => item.stage))].filter(Boolean)
        setUniqueStages(stages)

        // Flash the newest entry if there is one
        if (formattedData.length > 0) {
          setFlashId(formattedData[0].id)
          setTimeout(() => setFlashId(null), 1000)
        }

        // Debug: Log timestamp formats
        const timestamps = formattedData.map((tx) => tx.timestamp).filter(Boolean)
        console.log("Sample timestamps:", timestamps.slice(0, 3))

        // Try to parse a few dates to see if they work
        const parsedDates = timestamps.slice(0, 3).map((ts) => {
          try {
            return {
              original: ts,
              parsed: new Date(ts.replace(/-/g, "/")).toISOString(),
              timestamp: new Date(ts.replace(/-/g, "/")).getTime(),
            }
          } catch (e) {
            return { original: ts, error: e.message }
          }
        })
        console.log("Parsed dates:", parsedDates)

        setDateFilterDebug({
          enabled: true,
          timestamps: timestamps.slice(0, 5),
          parsedDates,
        })
      } else {
        console.error("Failed to fetch logs:", data)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to safely parse dates
  const parseDate = (dateString) => {
    if (!dateString) return null

    try {
      // Try standard format first
      let date = new Date(dateString)

      // If invalid, try replacing dashes with slashes (helps with some formats)
      if (isNaN(date.getTime())) {
        date = new Date(dateString.replace(/-/g, "/"))
      }

      // If still invalid, try a more specific approach for SQL-like timestamps
      if (isNaN(date.getTime()) && dateString.includes("-")) {
        const parts = dateString.split(/[- :]/)
        // parts[0]=year, parts[1]=month, parts[2]=day, parts[3]=hour, parts[4]=minute, parts[5]=second
        if (parts.length >= 3) {
          date = new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0)
        }
      }

      return isNaN(date.getTime()) ? null : date
    } catch (e) {
      console.error("Date parsing error:", e, "for date:", dateString)
      return null
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions]
    console.log("Applying filters:", activeFilters)

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          (tx.stage && tx.stage.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.status && tx.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.rfidTag && tx.rfidTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.carPart && tx.carPart.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.timestamp && tx.timestamp.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (tx.transaction_address && tx.transaction_address.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply status filter
    if (activeFilters.status !== "All Events") {
      filtered = filtered.filter((tx) => {
        if (activeFilters.status === "Entry Events") return tx.status === "Present"
        // if (activeFilters.status === "RFID Scanned") return tx.status === "RFID Scanned"
        if (activeFilters.status === "Exit Events") return tx.status === "Left"
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

      console.log("Date filter:", activeFilters.dateRange)
      console.log("Reference dates:", {
        now: now.toISOString(),
        today: new Date(today).toISOString(),
        yesterday: new Date(yesterday).toISOString(),
        lastWeek: new Date(lastWeek).toISOString(),
        lastMonth: new Date(lastMonth).toISOString(),
      })

      filtered = filtered.filter((tx) => {
        if (!tx.timestamp) return false

        const parsedDate = parseDate(tx.timestamp)
        if (!parsedDate) return false

        const txTime = parsedDate.getTime()

        if (activeFilters.dateRange === "Today") {
          const result = txTime >= today
          console.log(`Date check for ${tx.timestamp}: ${result ? "PASS" : "FAIL"} (Today)`)
          return result
        } else if (activeFilters.dateRange === "Yesterday") {
          const result = txTime >= yesterday && txTime < today
          console.log(`Date check for ${tx.timestamp}: ${result ? "PASS" : "FAIL"} (Yesterday)`)
          return result
        } else if (activeFilters.dateRange === "Last 7 days") {
          const result = txTime >= lastWeek
          console.log(`Date check for ${tx.timestamp}: ${result ? "PASS" : "FAIL"} (Last 7 days)`)
          return result
        } else if (activeFilters.dateRange === "Last 30 days") {
          const result = txTime >= lastMonth
          console.log(`Date check for ${tx.timestamp}: ${result ? "PASS" : "FAIL"} (Last 30 days)`)
          return result
        }
        return true
      })
    }

    console.log("Filtered transactions:", filtered.length)
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
    try {
      // Create CSV content
      const headers = ["Stage", "Status", "RFID Tag", "Timestamp"]
      const csvContent = [
        headers.join(","),
        ...filteredTransactions.map((tx) =>
          [tx.stage || "Unknown", tx.status || "Unknown", tx.rfidTag || "-", tx.timestamp || ""].join(","),
        ),
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
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("There was an error exporting to CSV. Please try again.")
    }
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

      // Prepare data for the table
      const tableData = filteredTransactions.map((tx) => [
        tx.stage || "Unknown",
        tx.status || "Unknown",
        tx.rfidTag || "-",
        tx.timestamp || "",
        tx.transaction_address || "",
      ])

      // Use the imported autoTable function directly
      autoTable(doc, {
        startY: 30,
        head: [["Stage", "Status", "RFID Tag", "Timestamp", "Transaction Address"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
        },
        styles: {
          fontSize: 6,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      })

      // Save the PDF
      doc.save(`production_logs_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF: " + error.message)
    }
  }

  // Export logs as JSON
  const handleExportJSON = () => {
    try {
      const jsonContent = JSON.stringify(filteredTransactions, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `production_logs_${new Date().toISOString().split("T")[0]}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting JSON:", error)
      alert("There was an error exporting to JSON. Please try again.")
    }
  }

  // Status colors for both light and dark modes
  const statusColors = {
    Present: "bg-green-500 text-white",
    "RFID Scanned": "bg-amber-500 text-black dark:text-white",
    Left: "bg-red-500 text-white",
  }

  const statusIcons = {
    Present: <Clock className="h-3 w-3 mr-1" />,
    "RFID Scanned": <Tag className="h-3 w-3 mr-1" />,
    Left: <Clock className="h-3 w-3 mr-1" />,
  }

  const stageColors = {
    "Stage 1": "bg-blue-500",
    "Stage 2": "bg-purple-500",
    "Stage 3": "bg-orange-500",
  }

  // Debug function to check filter state
  const debugFilter = (filterType, value) => {
    console.log(`Setting ${filterType} filter to:`, value)
    setActiveFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value }
      console.log("New filters:", newFilters)
      return newFilters
    })
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
                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      className="flex justify-start items-center gap-3"
                    >
                      <FileText className="h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>CSV Format</span>
                        <span className="text-xs text-muted-foreground">Export as comma-separated values</span>
                      </div>
                    </Button>

                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      className="flex justify-start items-center gap-3"
                    >
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
                    onClick={() => {
                      setActiveFilters((prev) => ({ ...prev, status: "All Events", stage: null }))
                      console.log("Reset filters")
                    }}
                  >
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("status", "Entry Events")}>
                    Entry Events
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("status", "RFID Scanned")}>
                    RFID Scanned
                  </DropdownMenuItem> */}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("status", "Exit Events")}>
                    Exit Events
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueStages.length > 0 ? (
                    uniqueStages.map((stage) => (
                      <DropdownMenuItem
                        key={stage}
                        className="cursor-pointer"
                        onClick={() => {
                          debugFilter("stage", stage)
                          debugFilter("status", "All Events")
                        }}
                      >
                        {stage}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          debugFilter("stage", "Stage 1")
                          debugFilter("status", "All Events")
                        }}
                      >
                        Stage 1
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          debugFilter("stage", "Stage 2")
                          debugFilter("status", "All Events")
                        }}
                      >
                        Stage 2
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          debugFilter("stage", "Stage 3")
                          debugFilter("status", "All Events")
                        }}
                      >
                        Stage 3
                      </DropdownMenuItem>
                    </>
                  )}
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
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("dateRange", "All Time")}>
                    All Time
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("dateRange", "Today")}>
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("dateRange", "Yesterday")}>
                    Yesterday
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("dateRange", "Last 7 days")}>
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => debugFilter("dateRange", "Last 30 days")}>
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
                <div>
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
                        <TableHead className="w-[200px] font-semibold py-4 pl-4">Timestamp</TableHead>
                        <TableHead className="w-[200px] font-semibold py-4 pl-4">Transaction Address</TableHead>
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
                                {tx.stage || "Unknown"}
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
                                {statusIcons[tx.status] || <Clock className="h-3 w-3 mr-1" />}
                                {tx.status || "Unknown"}
                                {tx.status === "RFID Scanned" && tx.action && ` (${tx.action})`}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-sm bg-slate-50/50 dark:bg-slate-900/50 py-3 px-4">
                              {tx.rfidTag || "-"}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400 py-3 px-4">
                              {tx.timestamp || ""}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400 py-3 px-4">
                              {tx.transaction_address || ""}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-slate-200 dark:border-slate-800">
                          <TableCell colSpan={4} className="text-center py-10 h-32">
                            {isLoading ? (
                              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                <RefreshCw className="h-10 w-10 mb-2 animate-spin" />
                                <p className="text-lg font-medium">Loading logs...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                                <Search className="h-10 w-10 mb-2 opacity-20" />
                                <p className="text-lg font-medium">No matching logs found</p>
                                <p className="text-sm">Try adjusting your search or filters</p>
                              </div>
                            )}
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
      <footer className="bg-[#F2FDFF] dark:bg-primary/5 py-6 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <ShieldCheck className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium">TrustChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TrustChain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
