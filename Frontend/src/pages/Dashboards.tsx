// src/pages/Dashboards.tsx

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  FileDown,
  Clock
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";

interface Order {
  id: string;
  customer: string;
  status: "pending" | "completed" | "processing" | "cancelled";
  amount: number;
  time: string;
}

interface LowStockItem {
  name: string;
  stock: number;
  threshold: number;
}

interface DashboardsProps {
  userRole: string;
}

const Dashboards = ({ userRole }: DashboardsProps) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getStats();
      const data = response.data;
      
      setStats({
        totalProducts: data.stats.totalProducts || 0,
        totalOrders: data.stats.totalOrders || 0,
      });
      
      setOrders(data.recentOrders || []);
      setLowStockItems(data.lowStockItems || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setStats({
        totalProducts: 0,
        totalOrders: 0,
      });
      setOrders([]);
      setLowStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExportOrderBill = (orderId: string) => {
    console.log(`Exporting bill for order ${orderId}`);
  };

  const getStatusColor = (status: Order['status']) => {
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
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-9 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-9 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-9 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage orders and monitor inventory. (Role: {userRole})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="animate-slide-up shadow-elegant hover:shadow-lg transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up shadow-elegant" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View, update, and export recent customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-medium">₹{order.amount.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                         <Badge variant={getStatusColor(order.status) as any}>
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.time}
                        </span>
                        <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => handleExportOrderBill(order.id)}>
                          <FileDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up shadow-elegant" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products running low on inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: <span className="font-bold text-red-600">{item.stock}</span> / Threshold: {item.threshold}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No low stock alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboards;
