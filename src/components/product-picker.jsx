import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";

const MOCK_DATA = [
  {
    id: 77,
    title: "Fog Linen Chambray Towel - Beige Stripe",
    variants: [
      {
        id: 1,
        product_id: 77,
        title: "XS / Silver",
        price: "49",
      },
      {
        id: 2,
        product_id: 77,
        title: "S / Silver",
        price: "49",
      },
      {
        id: 3,
        product_id: 77,
        title: "M / Silver",
        price: "49",
      },
    ],
    image: {
      id: 266,
      product_id: 77,
      src: "https://cdn11.bigcommerce.com/s-p1xcugzp89/products/77/images/266/foglinenbeigestripetowel1b.1647248662.386.513.jpg?c=1",
    },
  },
  {
    id: 80,
    title: "Orbit Terrarium - Large",
    variants: [
      {
        id: 64,
        product_id: 80,
        title: "Default Title",
        price: "109",
      },
    ],
    image: {
      id: 272,
      product_id: 80,
      src: "https://cdn11.bigcommerce.com/s-p1xcugzp89/products/80/images/272/roundterrariumlarge.1647248662.386.513.jpg?c=1",
    },
  },
];

export function ProductPicker({ open, onOpenChange, onProductsSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(MOCK_DATA);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  // const [page, setPage] = useState(0);
  // const [loading, setLoading] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  // const observerTarget = useRef(null);

  // const fetchProducts = useCallback(async () => {
  //   if (loading || !hasMore) return;

  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `http://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}&page=${page}&limit=10`,
  //       {
  //         headers: {
  //           "x-api-key": import.meta.env.VITE_API_KEY || "",
  //         },
  //       }
  //     );
  //     const data = await response.json();

  //     if (data.length < 10) {
  //       setHasMore(false);
  //     }

  //     setProducts((prev) => [...prev, ...data]);
  //     setPage((prev) => prev + 1);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting) {
  //         fetchProducts();
  //       }
  //     },
  //     { threshold: 1.0 }
  //   );

  //   if (observerTarget.current) {
  //     observer.observe(observerTarget.current);
  //   }

  //   return () => observer.disconnect();
  // }, [page, searchQuery]);

  useEffect(() => {
    if (open) {
      // setProducts([]);
      // setPage(0);
      // setHasMore(true);
      setSelectedProducts(new Set());
    }
  }, [open]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setProducts([]);
    // setPage(0);
    // setHasMore(true);
  };

  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSubmit = () => {
    const selectedProductsList = products.filter((product) =>
      selectedProducts.has(product.id)
    );
    onProductsSelect(selectedProductsList);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 border-b p-4"
            >
              <Checkbox
                checked={selectedProducts.has(product.id)}
                onCheckedChange={() => handleProductSelect(product.id)}
              />
              <img
                src={product.image.src}
                alt={product.title}
                width={50}
                height={50}
                className="rounded-md object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium">{product.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {product.variants.length} variants
                </p>
              </div>
            </div>
          ))}
          {/* <div ref={observerTarget} className="h-4" />
          {loading && <div className="p-4 text-center">Loading...</div>} */}
        </div>
        <DialogFooter>
          <p>1 product selected</p>
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
