import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI, orderAPI, salesStatsAPI, stockMonitorAPI } from "@/lib/api";

interface DashboardmProps {
  userRole: string;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalCustomers: number;
}

interface SalesData {
  name: string;
  sales: number;
  orders: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface LowStockItem {
  name: string;
  stock_quantity: number;
  threshold: number;
}

const Dashboardm = ({ userRole }: DashboardmProps) => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalCustomers: 0
  });

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [categoryData] = useState([
    { name: "Electronics", value: 400, color: "#3b82f6" },
    { name: "Clothing", value: 300, color: "#ef4444" },
    { name: "Food", value: 300, color: "#22c55e" },
    { name: "Books", value: 200, color: "#f59e0b" }
  ]);

  const [view, setView] = useState<"daily" | "weekly">("daily");

  const dailyTopSoldProducts = [
    { name: "Wireless Mouse", amount: 120 },
    { name: "USB-C Hub", amount: 90 },
    { name: "Mechanical Keyboard", amount: 75 },
    { name: "Monitor Stand", amount: 60 },
    { name: "Webcam 1080p", amount: 50 },
  ];

  const weeklyTopSoldProducts = [
    { name: "Laptop Pro X", amount: 350 },
    { name: "External SSD 1TB", amount: 280 },
    { name: "Noise-Cancelling Headphones", amount: 220 },
    { name: "Smartwatch Series 5", amount: 180 },
    { name: "Gaming Chair", amount: 150 },
  ];

  const topSoldProducts = view === "daily" ? dailyTopSoldProducts : weeklyTopSoldProducts;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [productsResponse, ordersResponse, statsResponse, lowStockResponse] = await Promise.all([
        inventoryAPI.getAll(),
        orderAPI.getAll(),
        salesStatsAPI.getStats(),
        stockMonitorAPI.getLowStock()
      ]);

      const products = productsResponse.data;
      const orders = ordersResponse.data.orders || []; // Handle the { orders: [...] } structure
      const salesStats = statsResponse.data;
      const lowStockItems = lowStockResponse.data.items || []; // Handle the { items: [...] } structure

      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0);
      const lowStockProducts = lowStockItems.length;
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const totalCustomers = new Set(orders.map((order: any) => order.customer?.name || 'Unknown')).size;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        pendingOrders,
        totalCustomers
      });

      // Set recent orders (last 4)
      setRecentOrders(orders.slice(0, 4).map((order: any) => ({
        id: order.order_id || order.id,
        customer_name: order.customer?.name || 'Unknown',
        status: order.status,
        total_amount: order.total_price || 0,
        created_at: order.order_date || order.created_at
      })));

      // Set low stock items
      setLowStockItems(lowStockItems.map((item: any) => ({
        name: item.name,
        stock_quantity: item.quantity,
        threshold: 10 // Default threshold
      })));

      // Generate mock sales data for now (since we don't have detailed sales API)
      const mockSalesData = [
        { name: "Mon", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Tue", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Wed", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Thu", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Fri", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Sat", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 },
        { name: "Sun", sales: Math.floor(Math.random() * 5000) + 2000, orders: Math.floor(Math.random() * 30) + 15 }
      ];
      setSalesData(mockSalesData);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "pending": return "warning";
      case "processing": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+23%",
      changeType: "increase"
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "Critical",
      changeType: "warning"
    }
  ];

  const getVisibleStats = () => {
    if (userRole === "admin") return statCards;
    if (userRole === "manager") return statCards;
    if (userRole === "staff") return statCards.slice(0, 2);
    return statCards;
  };

  return (
    <div className="p-9 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Live View
          </Button>
          <Button variant="gradient">
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getVisibleStats().map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="animate-slide-up shadow-elegant hover:shadow-lg transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className={`text-sm ${stat.changeType === "increase" ? "text-green-600" : stat.changeType === "warning" ? "text-blue-600" : "text-muted-foreground"}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(userRole === "admin" || userRole === "manager") && (
              <Card className="animate-slide-up shadow-elegant">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Daily sales and order trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            <Card className="animate-slide-up shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Top Sold Products</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={view === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={view === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("weekly")}
                  >
                    Weekly
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSoldProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.amount} sold</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            





          </div>

          {/* Orders + Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="animate-slide-up shadow-elegant">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total_amount}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(order.status) as any}>
                            {order.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.created_at}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            {(userRole === "admin" || userRole === "manager") && (
              <Card className="animate-slide-up shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription>Products running low on inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {item.stock_quantity} / Threshold: {item.threshold}
                          </p>
                        </div>
                       
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboardm;