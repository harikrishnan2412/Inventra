// Products.jsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductDialog from "../components/ProductDialog";
import "../styles/products.css";

const mockProducts = [
  { id: 1, name: "Wireless Mouse", category: "Accessories", price: 25.99, stock: 15 },
  { id: 2, name: "Laptop Stand", category: "Accessories", price: 39.5, stock: 3 },
  { id: 3, name: "Mechanical Keyboard", category: "Peripherals", price: 79.99, stock: 0 },
];

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [filtered, setFiltered] = useState(mockProducts);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      products.filter((product) =>
        product.name.toLowerCase().includes(term)
      )
    );
  }, [search, products]);

  return (
    <div className="products-wrapper">
      <div className="products-header">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="products-search"
        />
        <Button onClick={() => setOpenDialog(true)} className="products-add-btn">
          <PlusCircle className="icon" /> Add Product
        </Button>
      </div>

      <div className="products-grid">
        {filtered.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
        {filtered.length === 0 && <p>No products found.</p>}
      </div>

      <ProductDialog open={openDialog} setOpen={setOpenDialog} />
    </div>
  );
}