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
  PlusCircle,
  Clock
} from "lucide-react";

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

// --- FIX 1: Define an interface for the component's props ---
interface DashboardsProps {
  userRole: string;
}

// --- FIX 2: Update the component to accept the props ---
const Dashboards = ({ userRole }: DashboardsProps) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = () => {
      setStats({
        totalProducts: 1247,
        totalOrders: 892,
      });
      setRecentOrders([
        { id: "#ORD001", customer: "nikith", status: "completed", amount: 299.99, time: "2 hours ago" },
        { id: "#ORD002", customer: "suhana", status: "pending", amount: 149.5, time: "4 hours ago" },
        { id: "#ORD003", customer: "nikhil", status: "processing", amount: 599.99, time: "6 hours ago" },
        { id: "#ORD004", customer: "ashwin", status: "completed", amount: 79.99, time: "8 hours ago" },
        { id: "#ORD005", customer: "zara", status: "cancelled", amount: 39.00, time: "1 day ago" },
      ]);
      setLowStockItems([
        { name: "prod1", stock: 5, threshold: 10 },
        { name: "prod2", stock: 3, threshold: 5 },
        { name: "prod3", stock: 8, threshold: 15 },
        { name: "prod4", stock: 2, threshold: 8 },
      ]);
    };
    fetchDashboardData();
  }, []);

  const handleCreateOrder = () => {
    console.log("Navigate to create order form");
    alert("Navigating to the 'Create Order' page...");
  };

  const handleExportByDateRange = () => {
    console.log("Open date range picker for export");
    alert("Opening date range picker for bill export...");
  };

  const handleExportOrderBill = (orderId: string) => {
    console.log(`Exporting bill for order ${orderId}`);
    alert(`Exporting bill for order ${orderId}...`);
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

  return (
    <div className="p-9 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          {/* You can optionally display the role for confirmation */}
          <p className="text-muted-foreground">Manage orders and monitor inventory. (Role: {userRole})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportByDateRange}>
            <FileDown className="w-4 h-4 mr-2" />
            Export Bills by Date
          </Button>
          <Button variant="gradient" onClick={handleCreateOrder}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Order
          </Button>
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
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-medium">${order.amount}</p>
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
              ))}
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
              {lowStockItems.map((item, index) => (
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
                  <Button variant="secondary" size="sm">
                    View Product
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboards;