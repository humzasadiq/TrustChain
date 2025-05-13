"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Calendar, Clock, Package, Cog, CheckCircle2, AlertCircle, Printer, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import jobServices from "../services/api"
import QRCode from 'react-qr-code'

export default function Details({ type }) {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const printRef = useRef(null)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        let result
        if (type === "order") {
          // Fetch order items
          const orderItemsResult = await jobServices.fetchOrderById(id)
          if (!orderItemsResult) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }

          // Fetch order details
          const orderDetailsResult = await jobServices.fetchOrderDetails(id)
          if (!orderDetailsResult || !orderDetailsResult.success) {
            throw new Error(`Failed to fetch order details for ID: ${id}`)
          }

          // Combine the data
          result = {
            items: orderItemsResult.items,
            orderDetails: orderDetailsResult.details,
            // Calculate completion rate based on items stages
            completionRate: calculateCompletionRate(orderItemsResult.items),
          }
        } else if (type === "part") {
          result = await jobServices.fetchPartById(id)
          if (!result) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }
        }

        setData(result)
      } catch (error) {
        toast.error(error.message)
        setTimeout(() => navigate("/dashboard"), 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, type, navigate])

  const calculateCompletionRate = (items) => {
    if (!items || items.length === 0) return 0

    // Count items that have completed stages
    const completedItems = items.filter((item) => item.stage && item.stage.toLowerCase().includes("complete")).length

    return Math.round((completedItems / items.length) * 100)
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const printReport = () => {
    var body = document.getElementById("body").innerHTML
    var content = document.getElementById("report-container").innerHTML
    document.getElementById("body").innerHTML = content
    window.print()
    document.getElementById("body").innerHTML = body
  }

  const renderPartReport = (data) => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Part Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Part ID</span>
                <span className="font-medium">{data.partInfo.id}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">RFID UID</span>
                <span className="font-medium break-all">{data.partInfo.uid}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Part Name</span>
                <span className="font-medium">{data.partInfo.name}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{data.partInfo.category || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium">{data.partInfo.dimensions || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium">{data.partInfo.description || "N/A"}</span>
              </div>
              {data.partInfo.img && (
                <div className="flex justify-center flex-wrap">
                  <img src={data.partInfo.img || "/placeholder.svg"} alt="Part Image" className="w-full rounded-lg" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {!data.partorderInfo || data.partorderInfo === "No order related Information" ? (
              <div className="flex flex-col justify-center items-center h-40">
                <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
                <p className="text-lg text-center">This part is not assigned to any order yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{data.partorderInfo.order_id}</span>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Current Stage</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    {data.partorderInfo.stage}
                  </Badge>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Installation Date</span>
                  <span className="font-medium">{formatTimestamp(data.partorderInfo.timestamp)}</span>
                </div>
                {data.partorderInfo.transaction_address && (
                  <div className="flex justify-between flex-wrap items-center gap-2">
                    <span className="text-muted-foreground">Blockchain Transaction Address</span>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-medium text-xs break-all">{data.partorderInfo.transaction_address}</span>
                      <div className="p-2 bg-white rounded-md">
                        <QRCode 
                          value={`https://sepolia.etherscan.io/tx/${data.partorderInfo.transaction_address}`}
                          size={300}
                          level="M"
                        />
                        <button 
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${data.partorderInfo.transaction_address}`, '_blank')}
                        >
                          View on Etherscan <ExternalLink className="h-3 w-3" />
                      </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderOrderReport = (data) => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{id}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Total Parts</span>
                <span className="font-medium">{data.items ? data.items.length : 0}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{formatDate(data.orderDetails.started_at)}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-medium">{formatDate(data.orderDetails.created_at)}</span>
              </div>
              {data.orderDetails.finished_at && (
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Finished At</span>
                  <span className="font-medium">{formatDate(data.orderDetails.finished_at)}</span>
                </div>
              )}
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`${
                    data.orderDetails.status === "complete" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                  } hover:bg-blue-50`}
                >
                  {data.orderDetails.status}
                </Badge>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium">{data.orderDetails.description || "N/A"}</span>
              </div>
              {data.orderDetails.transaction_address && (
                <div className="flex justify-between flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Blockchain Transaction</span>
                  <div className="flex justify-center flex-wrap items-center gap-2">
                    <span className="font-medium text-xs break-all">{data.orderDetails.transaction_address}</span>
                    <div className="p-2 bg-white rounded-md">
                      <QRCode 
                        value={`https://sepolia.etherscan.io/tx/${data.orderDetails.transaction_address}`}
                        size={300}
                        level="M"
                      />
                      <button 
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${data.orderDetails.transaction_address}`, '_blank')}
                      >
                        View on Etherscan <ExternalLink className="h-3 w-3" />
                    </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Car RFID</span>
                <span className="font-medium break-all">{data.orderDetails.car_rfid}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{data.orderDetails.name || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Brand</span>
                <span className="font-medium">{data.orderDetails.brand || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Engine Type</span>
                <span className="font-medium">{data.orderDetails.engine_type || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Engine CC</span>
                <span className="font-medium">{data.orderDetails.engine_cc || "N/A"}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Body Type</span>
                <span className="font-medium">{data.orderDetails.body_type || "N/A"}</span>
              </div>
              {data.orderDetails.image && (
                <div className="flex justify-center mt-4">
                  <img
                    src={data.orderDetails.image || "/placeholder.svg"}
                    alt="Vehicle"
                    className="rounded-md w-full object-cover w-full"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assembly Progress</CardTitle>
        </CardHeader>
        <CardContent>

          <div className="relative border-l border-gray-200 ml-3 pl-8 py-2 space-y-8 mt-6">
            <div className="relative">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
              </div>
              <h3 className="font-medium">Order Created</h3>
              <p className="text-sm text-muted-foreground">{formatDate(data.orderDetails.created_at)}</p>
              <p className="text-sm mt-1">Order #{id} created and parts requisitioned</p>
            </div>

            {data.items && data.items.length > 0 && (
              <div className="relative">
                <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
                </div>
                <h3 className="font-medium">Parts Assignment</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(Math.min(...data.items.map((item) => new Date(item.timestamp)))))}
                </p>
                <p className="text-sm mt-1">Parts assigned to this order</p>
              </div>
            )}

            {data.orderDetails.status !== "complete" ? (
              <div className="relative">
                <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Cog className="h-4 w-4 text-black dark:text-white animate-spin-slow" />
                </div>
                <h3 className="font-medium">Assembly In Progress</h3>
                <p className="text-sm text-muted-foreground">Current Stage</p>
                <p className="text-sm mt-1">Vehicle assembly in progress</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
                </div>
                <h3 className="font-medium">Order Completed</h3>
                <p className="text-sm text-muted-foreground">{formatDate(data.orderDetails.finished_at)}</p>
                <p className="text-sm mt-1">Vehicle assembly completed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Parts List</CardTitle>
          <CardDescription>All parts associated with this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item ID</TableHead>
                  <TableHead>RFID UID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Installation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items && data.items.length > 0 ? (
                  data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="whitespace-normal break-all max-w-[150px]">{item.item_uid}</TableCell>
                      <TableCell>{item.stage}</TableCell>
                      <TableCell className="whitespace-normal">{formatTimestamp(item.timestamp)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            item.stage.toLowerCase().includes("complete")
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {item.stage.toLowerCase().includes("complete") ? "Installed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.transaction_address && (
                          <div className="flex flex-col gap-2 items-center">
                            <div className="p-1 bg-white rounded-md">
                              <QRCode 
                                value={`https://sepolia.etherscan.io/tx/${item.transaction_address}`}
                                size={80}
                                level="M"
                              />
                            </div>
                            <button 
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${item.transaction_address}`, '_blank')}
                            >
                              View <ExternalLink className="h-3 w-3 inline" />
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No parts have been assigned to this order yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              <p className="text-lg">Loading report data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-lg">No data found for this {type}</p>
              <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4" id="body">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{type === "part" ? "Part Details Report" : "Order Details Report"}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={printReport} disabled={isPdfGenerating}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div id="report-container" ref={printRef} className="p-6 rounded-lg border">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center">
            <div className="bg-green-600 text-black dark:text-white p-2 rounded-md mr-3 ">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-700">RFID Tracking System</h2>
              <p className="text-sm text-muted-foreground">
                {type === "part" ? "Part Details Report" : "Order Details Report"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground flex items-center justify-end">
              <Calendar className="h-4 w-4 mr-1" />
              Generated on {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground flex items-center justify-end">
              <Clock className="h-4 w-4 mr-1" />
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        {type === "part" ? renderPartReport(data) : renderOrderReport(data)}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex justify-between">
            <div>
              <p>RFID Tracking System Report</p>
              <p>
                Report ID: {type}-{id}-{new Date().toISOString().split("T")[0]}
              </p>
            </div>
            <div className="text-right">
              <p>Generated by: Assembly Line Management System</p>
              <p>© {new Date().getFullYear()} Automotive Assembly Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
