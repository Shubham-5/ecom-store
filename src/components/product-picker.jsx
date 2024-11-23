import { useEffect, useState } from "react";
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
  const [selectedVariants, setSelectedVariants] = useState(new Map());

  useEffect(() => {
    if (open) {
      setSelectedProducts(new Set());
      setSelectedVariants(new Map());
    }
  }, [open]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setProducts([]);
  };

  const toggleProductSelection = (productId) => {
    const newSelectedProducts = new Set(selectedProducts);
    const newSelectedVariants = new Map(selectedVariants);

    if (newSelectedProducts.has(productId)) {
      newSelectedProducts.delete(productId);
      newSelectedProducts.delete(productId);
    } else {
      newSelectedProducts.add(productId);
      const product = products.find((p) => p.id === productId);
      const allVariantIds = new Set(
        product.variants.map((variant) => variant.id)
      );
      newSelectedVariants.set(productId, allVariantIds);
    }

    setSelectedProducts(newSelectedProducts);
    setSelectedVariants(newSelectedVariants);
  };

  const toggleVariantSelection = (variantId, productId) => {
    setSelectedVariants((prev) => {
      const newSelectedVariants = new Map(prev);

      const productVariants = new Set(newSelectedVariants.get(productId) || []);

      if (productVariants.has(variantId)) {
        productVariants.delete(variantId);

        if (productVariants.size === 0) {
          newSelectedVariants.delete(productId);
          setSelectedProducts((prevProducts) => {
            const newProducts = new Set(prevProducts);
            newProducts.delete(productId);
            return newProducts;
          });
        } else {
          newSelectedVariants.set(productId, productVariants);
        }
      } else {
        productVariants.add(variantId);
        newSelectedVariants.set(productId, productVariants);

        setSelectedProducts((prevProducts) => {
          const newProducts = new Set(prevProducts);
          newProducts.add(productId);
          return newProducts;
        });
      }

      return newSelectedVariants;
    });
  };

  const isVariantSelected = (variantId, productId) => {
    return selectedVariants.get(productId)?.has(variantId) || false;
  };

  const handleSubmit = () => {
    const selectedProductsList = products
      .filter((product) => selectedProducts.has(product.id))
      .map((product) => ({
        ...product,
        variants: product.variants.filter((variant) =>
          selectedVariants.get(product.id)?.has(variant.id)
        ),
      }));
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
            <div key={product.id} className="flex flex-col gap-4 p-2">
              <div className="flex items-center gap-x-4">
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => toggleProductSelection(product.id)}
                />
                <img
                  src={product.image.src}
                  alt={product.title}
                  width={50}
                  height={50}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{product.title}</h4>
                </div>
              </div>
              <div>
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex ml-12 items-center gap-x-4"
                  >
                    <Checkbox
                      checked={isVariantSelected(variant.id, product.id)}
                      onCheckedChange={() =>
                        toggleVariantSelection(variant.id, product.id)
                      }
                    />
                    <p className="text-sm flex-1">{variant.title}</p>
                    <span> ${variant.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="flex items-center">
          <p className="flex-1">{selectedProducts.size} products selected</p>
          <div className="flex items-center justify-end gap-x-4">
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
