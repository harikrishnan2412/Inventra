import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const Orders = () => {
  const [orders] = useState([
    { id: '#ORD001', customer: 'Hari', status: 'completed', amount: 299.99, date: '2024-01-15' },
    { id: '#ORD002', customer: 'ashwin', status: 'pending', amount: 149.50, date: '2024-01-14' },
    { id: '#ORD003', customer: 'Suhana', status: 'processing', amount: 599.99, date: '2024-01-13' }
  ]);

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
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Recent Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.amount}</p>
                  <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'default' as any}>
                    {order.status}
                  </Badge>
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