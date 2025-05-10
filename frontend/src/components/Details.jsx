"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Download, Calendar, Clock, Package, Cog, CheckCircle2, AlertCircle, Printer } from "lucide-react"
import { toast } from "sonner"
import jobServices from "../services/api"

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
          result = await jobServices.fetchOrderById(id)
          if (!result) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }

          // Enhance with additional mock data for the report
          result.analytics = {
            totalParts: result.items?.length || 0,
            completionRate: 78,
            averageInstallTime: "47.2m",
            qualityScore: "9.3/10",
            startDate: new Date(Math.min(...result.items.map((item) => new Date(item.timestamp)))),
            estimatedCompletion: new Date(Date.now() + 86400000 * 2), // 2 days from now
            vehicleInfo: {
              make: "Toyota",
              model: "Camry",
              year: "2023",
              vin: "1HGCM82633A123456",
              color: "Midnight Blue",
            },
          }
        } else if (type === "part") {
          result = await jobServices.fetchPartById(id)
          if (!result) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }

          // Enhance with additional mock data for the report
          result.analytics = {
            installationSuccess: 98.5,
            averageLifespan: "5.2 years",
            failureRate: "1.2%",
            qualityScore: 9.1,
            manufacturerInfo: {
              name: "Premium Auto Parts Inc.",
              location: "Detroit, MI",
              supplierRating: "A+",
            },
            compatibleVehicles: ["Toyota Camry (2020-2023)", "Toyota Corolla (2019-2023)", "Lexus ES (2021-2023)"],
            materialComposition: {
              aluminum: "65%",
              steel: "25%",
              plastic: "10%",
            },
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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const downloadAsPDF = async () => {
    if (isPdfGenerating || !data) return

    // setIsPdfGenerating(true)
    toast.info("Preparing PDF download...")
  }

  const printReport = () => {
    var body = document.getElementById('body').innerHTML
    var content = document.getElementById("report-container").innerHTML
    document.getElementById('body').innerHTML = content
    window.print()
    document.getElementById('body').innerHTML = body
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
                <span className="font-medium">Engine Components</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">2.3 kg</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium">15 × 8 × 5 cm</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Quality Check</span>
                <Badge className="bg-green-500">Passed</Badge>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Warranty</span>
                <span className="font-medium">3 Years</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Part Performance Metrics</CardTitle>
          <CardDescription>Comparing actual vs expected performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Durability</TableCell>
                  <TableCell>85%</TableCell>
                  <TableCell>80%</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Above Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Efficiency</TableCell>
                  <TableCell>78%</TableCell>
                  <TableCell>75%</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Above Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Quality Score</TableCell>
                  <TableCell>92%</TableCell>
                  <TableCell>85%</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Above Target</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Installation Time</TableCell>
                  <TableCell>65 min</TableCell>
                  <TableCell>70 min</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Better</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Failure Rate</TableCell>
                  <TableCell>5%</TableCell>
                  <TableCell>10%</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Better</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Material Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Aluminum</span>
                <span className="font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Steel</span>
                <span className="font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Plastic</span>
                <span className="font-medium">10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Manufacturer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Premium Auto Parts Inc.</h4>
                <p className="text-sm text-muted-foreground">Detroit, MI</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Supplier Rating</span>
                  <span className="font-medium text-green-600">A+</span>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Quality Control</span>
                  <span className="font-medium">ISO 9001:2015</span>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Manufacturing Date</span>
                  <span className="font-medium">March 15, 2023</span>
                </div>
                <div className="flex justify-between flex-wrap">
                  <span className="text-muted-foreground">Batch Number</span>
                  <span className="font-medium">BP-2023-0342</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Compatible Vehicles</h4>
                <ul className="text-sm space-y-1">
                  <li>Toyota Camry (2020-2023)</li>
                  <li>Toyota Corolla (2019-2023)</li>
                  <li>Lexus ES (2021-2023)</li>
                </ul>
              </div>
            </div>
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
                <span className="font-medium">{data.analytics.totalParts}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{formatDate(data.analytics.startDate)}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Est. Completion</span>
                <span className="font-medium">{formatDate(data.analytics.estimatedCompletion)}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Avg. Install Time</span>
                <span className="font-medium">{data.analytics.averageInstallTime}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Parts Installed</span>
                <span className="font-medium">{data.analytics.totalParts}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  In Progress
                </Badge>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground text-center text-sm">Completion Rate</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{data.analytics.completionRate}%</span>
                  <Progress value={data.analytics.completionRate} className="h-2 ml-4 mt-2" />
                </div>
              </div>
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
                <span className="text-muted-foreground">Make & Model</span>
                <span className="font-medium">
                  {data.analytics.vehicleInfo.make} {data.analytics.vehicleInfo.model}
                </span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium">{data.analytics.vehicleInfo.year}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">VIN</span>
                <span className="font-medium break-all">{data.analytics.vehicleInfo.vin}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Color</span>
                <span className="font-medium">{data.analytics.vehicleInfo.color}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span className="text-muted-foreground">Assembly Line</span>
                <span className="font-medium">Line A-7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assembly Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-gray-200 ml-3 pl-8 py-2 space-y-8">
            <div className="relative">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
              </div>
              <h3 className="font-medium">Order Created</h3>
              <p className="text-sm text-muted-foreground">{formatDate(data.analytics.startDate)}</p>
              <p className="text-sm mt-1">Order #{id} created and parts requisitioned from inventory</p>
            </div>

            <div className="relative">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />
              </div>
              <h3 className="font-medium">Parts Preparation</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date(data.analytics.startDate.getTime() + 86400000))}
              </p>
              <p className="text-sm mt-1">All parts gathered and prepared for assembly</p>
            </div>

            <div className="relative">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Cog className="h-4 w-4 text-black dark:text-white animate-spin-slow" />
              </div>
              <h3 className="font-medium">Assembly In Progress</h3>
              <p className="text-sm text-muted-foreground">Current Stage</p>
              <p className="text-sm mt-1">Vehicle assembly in progress on Line A-7</p>
            </div>

            <div className="relative opacity-50">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-gray-500"></span>
              </div>
              <h3 className="font-medium">Quality Control</h3>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-sm mt-1">Final quality inspection and testing</p>
            </div>

            <div className="relative opacity-50">
              <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-gray-500"></span>
              </div>
              <h3 className="font-medium">Order Completed</h3>
              <p className="text-sm text-muted-foreground">
                Estimated: {formatDate(data.analytics.estimatedCompletion)}
              </p>
              <p className="text-sm mt-1">Vehicle ready for delivery</p>
            </div>
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
                  <TableHead>Part Name</TableHead>
                  <TableHead>RFID UID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Installation Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[150px]">
                      {item.id % 2 === 0 ? "Engine Control Module" : "Transmission Assembly"}
                    </TableCell>
                    <TableCell className="whitespace-normal break-all max-w-[150px]">{item.item_uid}</TableCell>
                    <TableCell>{item.stage}</TableCell>
                    <TableCell className="whitespace-normal">{formatTimestamp(item.timestamp)}</TableCell>
                    <TableCell>
                      {item.id % 3 === 0 ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Installed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
        <h1 className="text-2xl font-bold">{type === "part" ? "Part Analytics Report" : "Order Analytics Report"}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={printReport} disabled={isPdfGenerating}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {/* <Button onClick={downloadAsPDF} disabled={isPdfGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isPdfGenerating ? "Generating..." : "Download PDF"}
          </Button> */}
        </div>
      </div>

      <div id="report-container" ref={printRef} className="p-6 rounded-lg border">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center">
            <div className="bg-green-600 text-black dark:text-white p-2 rounded-md mr-3 ">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-700">Analytics Edge</h2>
              <p className="text-sm text-muted-foreground">
                {type === "part" ? "Part Analysis Report" : "Order Analysis Report"}
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
              <p>Analytics Edge Report</p>
              <p>
                Report ID: {type}-{id}-{new Date().toISOString().split("T")[0]}
              </p>
            </div>
            <div className="text-right">
              <p>Generated by: Assembly Line Management System</p>
              <p>© 2023 Automotive Assembly Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
