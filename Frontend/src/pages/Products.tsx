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
  FileText
} from "lucide-react";
import { inventoryAPI } from "@/lib/api";
import { pdfReportGenerator } from "@/lib/pdfReport";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    category: "",
    image_url: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const generateAlphanumericCode = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
      };
      
      const response = await inventoryAPI.create(productData);
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
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
      };
      
      await inventoryAPI.update(editingProduct.id, productData);
      await fetchProducts(); // Refresh the list
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
      
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await inventoryAPI.delete(productId);
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

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      await pdfReportGenerator.generateDetailedReport();
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

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      category: "",
      image_url: ""
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
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
    if (quantity === 0) return { label: "Out of Stock", variant: "destructive" };
    if (quantity < 10) return { label: "Low Stock", variant: "warning" };
    return { label: "In Stock", variant: "success" };
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Generate a comprehensive PDF report of all your business data including orders, products, and analytics.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={isGeneratingReport}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGeneratingReport ? "Generating..." : "Download Report"}
                  {isGeneratingReport && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
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
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="mt-2">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No products found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
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
                      <TableCell className="font-mono">{product.id}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.stock_quantity < 10 && (
                            <AlertTriangle className="w-4 h-4 text-warning" />
                          )}
                          {product.stock_quantity}
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant as any}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
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
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Product Code (SKU)</Label>
              <Input
                id="edit-code"
                value={formData.id}
                onChange={(e) => setFormData({...formData, id: e.target.value})}
                placeholder="Enter product code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
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
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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