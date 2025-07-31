import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const Orders = () => {
  const [orders, setOrders] = useState([
    { id: '#ORD001', customer: 'Hari', status: 'completed', amount: 299.99, date: '2024-01-15' },
    { id: '#ORD002', customer: 'ashwin', status: 'pending', amount: 149.50, date: '2024-01-14' },
    { id: '#ORD003', customer: 'Suhana', status: 'cancelled', amount: 599.99, date: '2024-01-13' },
    { id: '#ORD004', customer: 'nikith', status: 'pending', amount: 75.00, date: '2024-01-12' }
  ]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "cancelled">("all");

  const handleUpdateOrderStatus = (orderId: string, newStatus: "completed" | "cancelled") => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            Orders
          </h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
            >
              All Orders
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === "cancelled" ? "default" : "outline"}
              onClick={() => setFilterStatus("cancelled")}
            >
              Cancelled
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Orders ({orders.filter(order => filterStatus === "all" ? true : order.status === filterStatus).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.filter(order => filterStatus === "all" ? true : order.status === filterStatus).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.amount}</p>
                  <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'destructive' as any}>
                    {order.status}
                  </Badge>
                  {order.status === "pending" && (
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;