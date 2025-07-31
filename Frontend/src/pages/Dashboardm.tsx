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
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface DashboardmProps {
  userRole: string;
}

const Dashboardm = ({ userRole }: DashboardmProps) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalCustomers: 0
  });

  const [salesData] = useState([
    { name: "Mon", sales: 4000, orders: 24 },
    { name: "Tue", sales: 3000, orders: 18 },
    { name: "Wed", sales: 5000, orders: 32 },
    { name: "Thu", sales: 2780, orders: 15 },
    { name: "Fri", sales: 6890, orders: 42 },
    { name: "Sat", sales: 8390, orders: 54 },
    { name: "Sun", sales: 3490, orders: 28 }
  ]);

  const [categoryData] = useState([
    { name: "Electronics", value: 400, color: "#3b82f6" },
    { name: "Clothing", value: 300, color: "#ef4444" },
    { name: "Food", value: 300, color: "#22c55e" },
    { name: "Books", value: 200, color: "#f59e0b" }
  ]);

  const [recentOrders] = useState([
    { id: "#ORD001", customer: "John Doe", status: "completed", amount: 299.99, time: "2 hours ago" },
    { id: "#ORD002", customer: "Jane Smith", status: "pending", amount: 149.5, time: "4 hours ago" },
    { id: "#ORD003", customer: "Bob Johnson", status: "processing", amount: 599.99, time: "6 hours ago" },
    { id: "#ORD004", customer: "Alice Brown", status: "completed", amount: 79.99, time: "8 hours ago" }
  ]);

  const [lowStockItems] = useState([
    { name: "prod1", stock: 5, threshold: 10 },
    { name: "prod2", stock: 3, threshold: 5 },
    { name: "prod3", stock: 8, threshold: 15 },
    { name: "prod4", stock: 2, threshold: 8 }
  ]);

  useEffect(() => {
    setStats({
      totalProducts: 1247,
      totalOrders: 892,
      totalRevenue: 125340,
      lowStockProducts: 4,
      pendingOrders: 23,
      totalCustomers: 456
    });
  }, []);

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
    <div className="p-6 space-y-6 animate-fade-in">
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
                    <p className={`text-sm ${stat.changeType === "increase" ? "text-green-600" : stat.changeType === "warning" ? "text-red-600" : "text-muted-foreground"}`}>
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

        {(userRole === "admin" || userRole === "manager") && (
          <Card className="animate-slide-up shadow-elegant">
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
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
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.amount}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.time}
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
                        Stock: {item.stock} / Threshold: {item.threshold}
                      </p>
                    </div>
                    <Button size="sm" variant="destructive">
                      Reorder
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboardm;
