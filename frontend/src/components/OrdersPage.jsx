import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "./ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Car, 
  Search, 
  Package, 
  Clock, 
  AlertCircle,
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  SortAsc, 
  SortDesc,
  Image as ImageIcon,
  Eye,
  Calendar
} from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/get-all-orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setError('No orders found or error in response');
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to orders
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }
    
    // Apply search query (search in name, description, brand, car_rfid)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (order.name && order.name.toLowerCase().includes(query)) ||
        (order.description && order.description.toLowerCase().includes(query)) ||
        (order.brand && order.brand.toLowerCase().includes(query)) ||
        (order.car_rfid && order.car_rfid.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) return 0;
    
    // Handle date fields
    if (sortField === "created_at" || sortField === "started_at" || sortField === "finished_at") {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      
      return sortDirection === "asc" 
        ? dateA - dateB 
        : dateB - dateA;
    }
    
    // Handle string fields
    const valueA = String(a[sortField]).toLowerCase();
    const valueB = String(b[sortField]).toLowerCase();
    
    return sortDirection === "asc" 
      ? valueA.localeCompare(valueB) 
      : valueB.localeCompare(valueA);
  });

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Toggle sort direction when clicking the same field again
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Render sort icon based on current sort
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg text-red-500">Error: {error}</p>
        <Button onClick={fetchOrders} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2FDFF] dark:bg-background flex flex-col pt-20">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">View and manage all vehicle orders</p>
          </div>
          <Link to="/sad">
            <Button className="mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Filters and search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={(value) => {
                setSortField(value);
                setSortDirection("asc");
              }}>
                <SelectTrigger className="w-full">
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="name">Car Model</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, sortedOrders.length)} of {sortedOrders.length} orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                          Car Model {renderSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("brand")}>
                          Brand {renderSortIcon("brand")}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("created_at")}>
                          Created {renderSortIcon("created_at")}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
                          Status {renderSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.order_id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              {order.image ? (
                                <img src={order.image} alt={order.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <Car className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{order.name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground">RFID: {order.car_rfid}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.brand || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.engine_type ? `${order.engine_type}cc` : "N/A"}
                            {order.body_type ? ` • ${order.body_type}` : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === "complete" ? "success" : "default"}>
                            {order.status === "complete" ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/order/${order.order_id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== "all" 
                    ? "Try adjusting your filters or search query" 
                    : "There are no orders in the system yet."}
                </p>
                <Link to="/sad">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Order
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          
          {/* Pagination */}
          {sortedOrders.length > 0 && (
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage; 