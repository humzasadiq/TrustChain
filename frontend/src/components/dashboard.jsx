"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
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
} from "lucide-react"

import { cn } from "../lib/utils"
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

export default function Dashboard() {
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">TrustChain</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                      <Link to="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Analytics Menu */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleMenu("analytics")} className="justify-between">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span>Analytics</span>
                      </div>
                      {openMenus.analytics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </SidebarMenuButton>

                    {openMenus.analytics && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/performance">
                              <LineChartIcon className="h-4 w-4" />
                              <span>Performance</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/revenue">
                              <CircleDollarSign className="h-4 w-4" />
                              <span>Revenue</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/distribution">
                              <PieChartIcon className="h-4 w-4" />
                              <span>Distribution</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Management Menu */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleMenu("management")} className="justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Management</span>
                      </div>
                      {openMenus.management ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </SidebarMenuButton>

                    {openMenus.management && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/users">
                              <Users className="h-4 w-4" />
                              <span>Users</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/reports">
                              <FileText className="h-4 w-4" />
                              <span>Reports</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link to="/dashboard/settings">
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              </div>
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,248</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +12.5%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">432</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +8.2%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
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
              </Card>
              <Card>
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
              </Card>
            </div>

            {/* Charts */}
            <div className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
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
              <Card>
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
            </div>

            {/* Weekly Activity Bar Chart */}
            <div className="mt-6">
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
            </div>

            {/* Recent Transactions Table */}
            <div className="mt-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest blockchain transactions</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                transaction.status === "Completed" &&
                                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                                transaction.status === "Pending" &&
                                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                                transaction.status === "Processing" &&
                                  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                              )}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
