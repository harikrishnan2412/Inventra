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
  Image as ImageIcon
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  code: string;
  quantity_in_stock: number;
  price: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  created_at: string;
}

interface Category {
  id: number;
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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    quantity_in_stock: 0,
    price: 0,
    category_id: "",
    image_url: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setProducts([
      {
        id: 1,
        name: "iPhone 15 Pro",
        code: "IPH15PRO",
        quantity_in_stock: 5,
        price: 999.99,
        category_id: 1,
        category_name: "Electronics",
        image_url: "",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        name: "MacBook Air M2",
        code: "MBA-M2",
        quantity_in_stock: 3,
        price: 1199.99,
        category_id: 1,
        category_name: "Electronics",
        image_url: "",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        name: "Nike Air Force 1",
        code: "NAF1-WHT",
        quantity_in_stock: 25,
        price: 129.99,
        category_id: 2,
        category_name: "Footwear",
        image_url: "",
        created_at: "2024-01-03"
      }
    ]);
  };

  const fetchCategories = async () => {
    setCategories([
      { id: 1, name: "Electronics" },
      { id: 2, name: "Footwear" },
      { id: 3, name: "Clothing" },
      { id: 4, name: "Accessories" }
    ]);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      const newProduct = {
        id: Date.now(),
        ...formData,
        quantity_in_stock: Number(formData.quantity_in_stock),
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        category_name: categories.find(c => c.id === Number(formData.category_id))?.name || "",
        created_at: new Date().toISOString()
      };
      
      setProducts([...products, newProduct]);
      setIsAddModalOpen(false);
      resetForm();
      
      toast({
        title: "Product added",
        description: "New product has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
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
      const updatedProducts = products.map(product =>
        product.id === editingProduct.id
          ? {
              ...product,
              ...formData,
              quantity_in_stock: Number(formData.quantity_in_stock),
              price: Number(formData.price),
              category_id: Number(formData.category_id),
              category_name: categories.find(c => c.id === Number(formData.category_id))?.name || ""
            }
          : product
      );
      
      setProducts(updatedProducts);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
      
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setProducts(products.filter(product => product.id !== productId));
      
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      quantity_in_stock: 0,
      price: 0,
      category_id: "",
      image_url: ""
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      quantity_in_stock: product.quantity_in_stock,
      price: product.price,
      category_id: product.category_id.toString(),
      image_url: product.image_url
    });
    setIsEditModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id.toString() === selectedCategory;
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
                <div className="space-y-2">
                  <Label htmlFor="code">Product Code (SKU)</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Enter product code"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity_in_stock}
                      onChange={(e) => setFormData({...formData, quantity_in_stock: Number(e.target.value)})}
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
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
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
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.quantity_in_stock);
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
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.quantity_in_stock < 10 && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                        {product.quantity_in_stock}
                      </div>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
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
              })}
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
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Enter product code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity_in_stock}
                  onChange={(e) => setFormData({...formData, quantity_in_stock: Number(e.target.value)})}
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
              <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
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