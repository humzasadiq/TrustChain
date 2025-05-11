"use client"

import { useState , useEffect, useRef, use } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import jobServices from "../services/api"
import { useAuth } from "../context/AuthContext"

import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  LayoutDashboard,
  BarChart3,
  LineChartIcon,
  PieChartIcon,
  Users,
  FileText,
  Settings,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronDown,
  ChevronRight,
  Home,
  Shield,
  MoveRight,
  ArrowRight,
  ExternalLink,
  Search,
  ShieldCheck
} from "lucide-react"

import { cn } from "../lib/utils"
import ToggleSwitch from "./ui/switch"
import TrustChainIOTReadings from "./Readings"
import LiveBlock from "./ui/liveblock"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import IPStatusMonitor from "./IpStatusMonitor"
import CountTransactions from "./CountTransactions"
import ManufacturingFloorLayout from "./Assembly"


// Sample data for charts
const lineChartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
  { name: "Jul", value: 1100 },
]

const barChartData = [
  { name: "Mon", value: 20 },
  { name: "Tue", value: 40 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 70 },
  { name: "Fri", value: 50 },
  { name: "Sat", value: 20 },
  { name: "Sun", value: 10 },
]

const pieChartData = [
  { name: "Bitcoin", value: 400, color: "#0088FE" },
  { name: "Ethereum", value: 300, color: "#00C49F" },
  { name: "Solana", value: 200, color: "#FFBB28" },
  { name: "Cardano", value: 100, color: "#FF8042" },
]

// Recent transactions data
const recentTransactions = [
  {
    id: "0x8f72d1",
    type: "Transfer",
    amount: "$1,234.56",
    status: "Completed",
    date: "2023-04-18",
  },
  {
    id: "0x3a9c7b",
    type: "Deposit",
    amount: "$890.00",
    status: "Pending",
    date: "2023-04-17",
  },
  {
    id: "0x2e5f8c",
    type: "Withdrawal",
    amount: "$500.25",
    status: "Completed",
    date: "2023-04-16",
  },
  {
    id: "0x7d1e4a",
    type: "Smart Contract",
    amount: "$2,100.00",
    status: "Processing",
    date: "2023-04-15",
  },
  {
    id: "0x9b3f2c",
    type: "Transfer",
    amount: "$750.50",
    status: "Completed",
    date: "2023-04-14",
  },
]

const SIDEBAR_KEYBOARD_SHORTCUT = "/"

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">Value: {payload[0].value}</p>
      </div>
    )
  }
  return null
}

function SearchInput({ selectedMode, setSelectedMode, searchString, setSearchString }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;

      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && !isInputActive) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchString || !selectedMode) {
      toast.error("Please enter a search term and select a mode");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedMode === 'order') {
        const result = await jobServices.fetchOrderById(searchString);
        if (result) {
          toast.success("Order found!");
          window.open(`/order/${searchString}`, '_blank', 'noopener,noreferrer');
        } else {
          setError(`No order found with ID: ${searchString}`);
        }
      } else if (selectedMode === 'part') {
        const result = await jobServices.fetchPartById(searchString);
        if (result) {
          toast.success("Part found!");
          window.open(`/part/${searchString}`, '_blank', 'noopener,noreferrer');
        } else {
          setError(`No part found with ID: ${searchString}`);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${selectedMode}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      toast.loading("Searching...", {
        id: "search-loading"
      });
    } else {
      toast.dismiss("search-loading");
    }
  }, [isLoading]);

  const isInputActive = useRef(false);

  useEffect(() => {
    const activeElement = document.activeElement;
    const isInputActive = activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement;
  },[]);

  // Add focus handlers
  const handleFocus = () => {
    setShowHint(false)
  }

  const handleBlur = () => {
    setShowHint(true)
  }

  return (
    <div className="space-y-2 bg-[#F2FDFF] dark:bg-primary/0.5">
      <form onSubmit={handleSearch} className="flex h-9 w-100">
        <div className={`flex flex-1 items-center rounded-l-md border shadow-sm border-r-0 border-gray-500 bg-background px-3 py-1 text-sm ring-offset-background relative`}>
          <input
            ref={inputRef}
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            placeholder=""
            type="text"
            disabled={isLoading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex w-full bg-transparent p-1 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          {showHint && !searchString && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none text-muted-foreground"
              style={{ zIndex: 1 }}
            >
              <span>
                Type{" "}
                <span className="border border-zinc-500/60 px-2 py-0.5 font-bold rounded">
                  /
                </span>{" "}
                to {selectedMode === "part" ? "Search Part" : "Search Order"}
              </span>
            </div>
          )}
        </div>
        <Select
          value={selectedMode || "part"}
          onValueChange={setSelectedMode}
          defaultValue="part"
          disabled={isLoading}
        >
          <SelectTrigger className="w-[90px] rounded-l-none border-l-0 rounded-r-none border border-gray-500">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Mode</SelectLabel>
              <SelectItem value="part">Part</SelectItem>
              <SelectItem value="order">Order</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className={"rounded-l-none border-l-0 border border-gray-500"} onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>
    </div>
  )
}

export default function Dashboard() {
  const { isAuthenticated, token } = useAuth()
  const [selectedMode, setSelectedMode] = useState(null)
  const [searchString, setSearchString] = useState("")
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState({
    analytics: true,
    management: false,
  })

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
      <div>
      {/* <div className="flex h-screen w-full"> */}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F2FDFF] dark:bg-primary/2">
          
          <div className="p-4 md:p-6 w-full">
            <div className="flex items-center justify-between mb-6 mt-16">
              
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              </div>
              
              {/* Only render SearchInput if authenticated */}
              {token && (
                <SearchInput 
                  selectedMode={selectedMode} 
                  setSelectedMode={setSelectedMode} 
                  searchString={searchString} 
                  setSearchString={setSearchString} 
                />
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 ">
            {/* <Card className={"p-0 m-0 dark:bg-black"}>
                <CardContent>
                  <img src="/loop.gif" alt="image" className="w-full h-full object-cover rounded-xl invert dark:invert-0 " />
                </CardContent>
              </Card> */}
              <CountTransactions/>
              <IPStatusMonitor/>
              
              
              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +18.2%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card> */}

              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-rose-500 flex items-center">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      -4.5%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card> */}
            </div>

            {/* Recent Transactions Table */}
            {/* <TrustChainIOTReadings /> */}
            {/* <ManufacturingFloorLayout/> */}
            <LiveBlock />
            
            
            

            {/* Charts */}
            {/* <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Overview</CardTitle>
                  <CardDescription>Transaction volume over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, style: { fill: "hsl(var(--primary))", opacity: 0.2 } }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className={"bg-[#E7FFFE] dark:bg-primary/5"}>
                <CardHeader>
                  <CardTitle>Distribution by Type</CardTitle>
                  <CardDescription>Transaction types breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div> */}

            {/* Weekly Activity Bar Chart */}
            {/* <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Transaction activity by day of week</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div> */}
          </div>
        </div>
      {/* </div> */}
      </div>
  )
}
