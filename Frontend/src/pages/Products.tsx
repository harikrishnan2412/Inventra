import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Filter,
  Download,
  Image as ImageIcon,
  Loader2,
  FileText,
  DollarSign,
  Clock
} from "lucide-react";
import { inventoryAPI } from "@/lib/api";
import { pdfReportGenerator } from "@/lib/pdfReport";

// UPDATED INTERFACE
interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  quantity: number; // Changed from stock_quantity
  category?: string;
  image_url?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // UPDATED FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    quantity: 0,
    description: "",
    category: "",
    image_url: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
  const userDataString = localStorage.getItem('user');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    setUserRole(userData.role);
  }
  }, []);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const response = await inventoryAPI.getAll();
      setProducts(response.data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await inventoryAPI.getCategories();
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      // Fallback to mock categories if API fails
      setCategories([
        { id: "1", name: "Electronics" },
        { id: "2", name: "Footwear" },
        { id: "3", name: "Clothing" },
        { id: "4", name: "Accessories" }
      ]);
    }
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      // UPDATED PRODUCT DATA
      const productData = {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity), // Changed from stock_quantity
      };

      await inventoryAPI.create(productData);
      await fetchProducts(); // Refresh the list
      setIsAddModalOpen(false);
      resetForm();

      toast({
        title: "Product added",
        description: "New product has been successfully added.",
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      // The productData now only contains the editable fields
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      // The product's unique code is now passed in the URL
      await inventoryAPI.update(editingProduct.code, productData);
      
      await fetchProducts(); // Refresh the list
      setIsEditModalOpen(false);
      setEditingProduct(null);

      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
    } catch (error: any) {
      // ... (error handling remains the same)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productCode: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await inventoryAPI.delete(productCode);
      await fetchProducts(); // Refresh the list

      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  // UPDATED RESET FORM
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
      image_url: ""
    });
  };

  // UPDATED OPEN EDIT MODAL
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description || "",
      category: product.category || "",
      image_url: product.image_url || ""
    });
    setIsEditModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category?.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10) return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 p-3">
            <Package className="w-8 h-8" />
            Inventory
          </h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
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
          {userRole === 'manager' && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the product details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    {/* UPDATED ADD FORM INPUT */}
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Products Table */}
      <Card className="shadow-elegant p-6">
        <CardHeader>
          <CardTitle>Product List ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Manage your product inventory and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                {userRole === 'manager' && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="mt-2">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  // UPDATED TABLE LOGIC
                  const stockStatus = getStockStatus(product.quantity);
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{product.code}</TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.quantity < 10 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          {product.quantity}
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      {userRole === 'manager' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.code)} // Change to use code
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        </div>
                      </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>

          {/* The simplified form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;