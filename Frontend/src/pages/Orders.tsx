import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateOrderBill } from "@/lib/pdfReport";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  Search, 
  FileText,
  Loader2,
  AlertTriangle,
  Plus,
  Minus,
  X,
  DollarSign,
  Package,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { orderAPI, inventoryAPI } from "@/lib/api";
import { pdfReportGenerator } from "@/lib/pdfReport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  order_id: number;
  customer: {
    id: number;
    name: string;
    phone_number: string;
  } | null;
  total_price: number;
  status: "pending" | "completed" | "cancelled";
  items: Array<{
    product_id: number;
    name: string;
    code: string;
    price: number;
    image_url?: string;
    quantity: number;
  }>;
  order_date: string;
}
// --- HELPER COMPONENT: ORDER DETAILS MODAL ---
const OrderDetailsModal = ({ order, onClose, onDownload }: { order: Order | null; onClose: () => void; onDownload: (order: Order) => void; }) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order Details #{order.order_id}</DialogTitle>
          <DialogDescription>
            Date: {new Date(order.order_date).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <p><strong>Name:</strong> {order.customer?.name || "N/A"}</p>
            <p><strong>Phone:</strong> {order.customer?.phone_number || "N/A"}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.items || []).map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end font-bold text-lg border-t pt-4">
            <span className="mr-4">Total:</span>
            <span>₹{order.total_price.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => onDownload(order)}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Create Order Form Component
const CreateOrderForm = ({ onSubmit, isLoading, onCancel }: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [products, setProducts] = useState<Array<{
    code: string;
    quantity: number;
    price?: number;
    name?: string;
  }>>([]);
  const [availableProducts, setAvailableProducts] = useState<Array<{
    code: string;
    name: string;
    price: number;
    quantity: number;
  }>>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { toast } = useToast();

  // Fetch available products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await inventoryAPI.getAll();
        console.log('Raw inventory response:', response); // Debug log
        
        // Handle different possible response structures
        let productsData = [];
        if (response.data?.products) {
          productsData = response.data.products;
        } else if (response.data?.data) {
          productsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        } else {
          console.error('Unexpected response structure:', response.data);
        }
        
        console.log('Processed products data:', productsData); // Debug log
        
        // Filter for in-stock products and ensure they have required fields
        const validProducts = productsData.filter((p: any) => {
          const hasRequiredFields = p.code && p.name && p.price !== undefined;
          const hasStock = (p.quantity_in_stock || p.stock_quantity || p.quantity || 0) > 0;
          return hasRequiredFields && hasStock;
        }).map((p: any) => ({
          code: p.code,
          name: p.name,
          price: parseFloat(p.price),
          quantity: p.quantity_in_stock || p.stock_quantity || p.quantity || 0
        }));
        
        console.log('Valid products:', validProducts); // Debug log
        setAvailableProducts(validProducts);
        
        if (validProducts.length === 0) {
          toast({
            title: "No Products",
            description: "No products with stock available. Please add products to inventory first.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        console.error('Error response:', error.response); // Debug log
        toast({
          title: "Error",
          description: `Failed to load products: ${error.response?.data?.error || error.message}`,
          variant: "destructive",
        });
        setAvailableProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const addProduct = () => {
    setProducts([...products, { code: "", quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...products];
    if (field === 'code') {
      const selectedProduct = availableProducts.find(p => p.code === value);
      updated[index] = {
        ...updated[index],
        code: value,
        price: selectedProduct?.price || 0,
        name: selectedProduct?.name
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setProducts(updated);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => total + ((product.price || 0) * product.quantity), 0);
  };

  const handleSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim() || products.length === 0) {
      return;
    }

    // Validate all products have codes selected
    const hasInvalidProducts = products.some(p => !p.code);
    if (hasInvalidProducts) {
      toast({
        title: "Error",
        description: "Please select a product for all items.",
        variant: "destructive",
      });
      return;
    }

    // Validate stock availability
    const stockIssues = products.filter(p => {
      const availableProduct = availableProducts.find(ap => ap.code === p.code);
      return !availableProduct || p.quantity > availableProduct.quantity;
    });

    if (stockIssues.length > 0) {
      toast({
        title: "Stock Error",
        description: "Some products don't have enough stock available.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      name: customerName.trim(),
      phone_no: customerPhone.trim(),
      total_price: calculateTotal(),
      products: products.map(p => ({
        code: p.code,
        quantity: p.quantity
      }))
    };

    onSubmit(orderData);
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer Name *</label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <Input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter phone number (e.g., +91-1234567890)"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Products *</label>
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground">
                {isLoadingProducts ? "Loading..." : `${availableProducts.length} available`}
              </span>
              <Button type="button" size="sm" onClick={addProduct} disabled={isLoadingProducts || availableProducts.length === 0}>
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>
          </div>
          
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              {isLoadingProducts ? "Loading products..." : "No products added. Click \"Add Product\" to start."}
            </p>
          )}
          
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={index} className="border p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Product {index + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeProduct(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Product</label>
                    <Select
                      value={product.code}
                      onValueChange={(value) => updateProduct(index, 'code', value)}
                      disabled={isLoadingProducts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select product"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.length === 0 && !isLoadingProducts ? (
                          <div className="p-2 text-sm text-muted-foreground">No products available</div>
                        ) : (
                          availableProducts.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                              {p.name} - ₹{p.price} (Stock: {p.quantity})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Quantity</label>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateProduct(index, 'quantity', Math.max(1, product.quantity - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={availableProducts.find(p => p.code === product.code)?.quantity || 999}
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="mx-1 text-center"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const maxStock = availableProducts.find(p => p.code === product.code)?.quantity || 999;
                          updateProduct(index, 'quantity', Math.min(maxStock, product.quantity + 1));
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {product.price && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Subtotal: ₹{(product.price * product.quantity).toFixed(2)}
                    {product.code && (
                      <span className="ml-2">
                        (Available: {availableProducts.find(p => p.code === product.code)?.quantity || 0})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {products.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingProducts || !customerName.trim() || !customerPhone.trim() || products.length === 0 || products.some(p => !p.code)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};



const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { toast } = useToast();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      switch (reportType) {
        case 'summary':
          await pdfReportGenerator.generateSummaryReport();
          break;
        case 'available-stocks':
          await pdfReportGenerator.generateAvailableStocksReport();
          break;
        case 'cancelled-orders':
          await pdfReportGenerator.generateCancelledOrdersReport();
          break;
        case 'pending-orders':
          await pdfReportGenerator.generatePendingOrdersReport();
          break;
        default:
          await pdfReportGenerator.generateDetailedReport();
      }
      toast({
        title: "Report Generated",
        description: "PDF report has been generated and downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const fetchOrders = async () => {
    setIsFetching(true);
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data?.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
      setOrders([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    setIsCreatingOrder(true);
    try {
      await orderAPI.create(orderData);
      await fetchOrders();
      setIsCreateOrderOpen(false);
      
      toast({
        title: "Order created",
        description: "New order has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: "completed" | "cancelled") => {
    setIsLoading(true);
    try {
      if (newStatus === "completed") {
        await orderAPI.markCompleted(orderId);
      } else {
        await orderAPI.cancel({ order_id: orderId });
      }
      
      await fetchOrders();
      
      toast({
        title: "Order updated",
        description: `Order status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer?.phone_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.order_id?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'; // Green-ish
      case 'pending':
        return 'secondary'; // Yellow-ish
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
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
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Choose the type of report you want to generate and download.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleGenerateReport('summary')} 
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <DollarSign className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Summary Report</div>
                    <div className="text-xs text-muted-foreground">Executive summary</div>
                  </div>
                  {isGeneratingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('available-stocks')} 
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Package className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Available Stocks</div>
                    <div className="text-xs text-muted-foreground">Inventory table</div>
                  </div>
                  {isGeneratingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('cancelled-orders')} 
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <AlertTriangle className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Cancelled Orders</div>
                    <div className="text-xs text-muted-foreground">Cancelled orders table</div>
                  </div>
                  {isGeneratingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('pending-orders')} 
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Clock className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Pending Orders</div>
                    <div className="text-xs text-muted-foreground">Pending orders table</div>
                  </div>
                  {isGeneratingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Create a new order by selecting products and entering customer details.
                </DialogDescription>
              </DialogHeader>
              <CreateOrderForm 
                onSubmit={handleCreateOrder} 
                isLoading={isCreatingOrder}
                onCancel={() => setIsCreateOrderOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
            >
              All Orders
            </Button>
            <Button
              variant={selectedStatus === "pending" ? "default" : "outline"}
              onClick={() => setSelectedStatus("pending")}
            >
              Pending
            </Button>
            <Button
              variant={selectedStatus === "completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("completed")}
            >
              Completed
            </Button>
            <Button
              variant={selectedStatus === "cancelled" ? "default" : "outline"}
              onClick={() => setSelectedStatus("cancelled")}
            >
              Cancelled
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-2">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="w-10 h-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.order_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order : {order.order_id}</p>
                    <p className="text-sm text-muted-foreground">Customer : {order.customer?.name || "Guest Customer"}</p>
                    {order.customer?.phone_number && (
                      <p className="text-xs text-muted-foreground">Phone No. : {order.customer.phone_number}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(order.total_price || 0).toFixed(2)}</p>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer" 
                      onClick={() => setViewingOrder(order)}
                    >
                      View
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status || "unknown"}
                    </Badge>
                    {order.status === "pending" && (
                      <div className="flex gap-2 mt-2 justify-end">
                        <Badge
                          variant="outline"
                          className="cursor-pointer" 
                          onClick={() => handleUpdateOrderStatus(order.order_id, "completed")}
                        >
                          Complete
                        </Badge>
                        <Badge
                          variant="outline" 
                          onClick={() => handleUpdateOrderStatus(order.order_id, "cancelled")}
                          className="cursor-pointer text-destructive hover:text-destructive"
                        >
                          Cancel
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
            {/* --- RENDER THE MODAL --- */}
      <OrderDetailsModal 
        order={viewingOrder} 
        onClose={() => setViewingOrder(null)} 
        onDownload={generateOrderBill}
      />
    </div>
  );
};

export default Orders;