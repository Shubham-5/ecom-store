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
import { MOCK_DATA } from "@/lib/data";

export function ProductPicker({ open, onOpenChange, onProductsSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState(MOCK_DATA);
  const [selections, setSelections] = useState({
    products: new Set(),
    variants: new Map(),
  });

  useEffect(() => {
    if (open) {
      setSelections({ products: new Set(), variants: new Map() });
    }
  }, [open]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (productId) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      const product = products.find((p) => p.id === productId);

      if (prev.products.has(productId)) {
        newSelections.products = new Set(
          [...prev.products].filter((id) => id !== productId)
        );
        newSelections.variants = new Map(
          [...prev.variants].filter(([id]) => id !== productId)
        );
      } else {
        newSelections.products = new Set([...prev.products, productId]);
        newSelections.variants = new Map(prev.variants);
        newSelections.variants.set(
          productId,
          new Set(product.variants.map((v) => v.id))
        );
      }

      return newSelections;
    });
  };

  const handleVariantSelect = (variantId, productId) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      const productVariants = new Set(prev.variants.get(productId) || []);

      if (productVariants.has(variantId)) {
        productVariants.delete(variantId);
        if (productVariants.size === 0) {
          newSelections.products = new Set(
            [...prev.products].filter((id) => id !== productId)
          );
          newSelections.variants = new Map(
            [...prev.variants].filter(([id]) => id !== productId)
          );
        } else {
          newSelections.variants = new Map(prev.variants);
          newSelections.variants.set(productId, productVariants);
        }
      } else {
        productVariants.add(variantId);
        newSelections.products = new Set([...prev.products, productId]);
        newSelections.variants = new Map(prev.variants);
        newSelections.variants.set(productId, productVariants);
      }

      return newSelections;
    });
  };

  const handleSubmit = () => {
    const selectedProducts = products
      .filter((product) => selections.products.has(product.id))
      .map((product) => ({
        ...product,
        variants: product.variants.filter((variant) =>
          selections.variants.get(product.id)?.has(variant.id)
        ),
      }));

    onProductsSelect(selectedProducts);
    onOpenChange(false);
  };

  const renderVariant = (variant, productId) => (
    <div key={variant.id} className="flex ml-12 items-center gap-x-4">
      <Checkbox
        checked={selections.variants.get(productId)?.has(variant.id) || false}
        onCheckedChange={() => handleVariantSelect(variant.id, productId)}
      />
      <p className="text-sm flex-1">{variant.title}</p>
      <span>${variant.price}</span>
    </div>
  );

  const renderProduct = (product) => (
    <div key={product.id} className="flex flex-col gap-4 p-2">
      <div className="flex items-center gap-x-4">
        <Checkbox
          checked={selections.products.has(product.id)}
          onCheckedChange={() => handleProductSelect(product.id)}
        />
        <img
          src={product.image.src}
          alt={product.title}
          width={50}
          height={50}
          className="rounded-md object-cover"
        />
        <h4 className="font-medium text-sm flex-1">{product.title}</h4>
      </div>
      <div>
        {product.variants.map((variant) => renderVariant(variant, product.id))}
      </div>
    </div>
  );

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {filteredProducts.map(renderProduct)}
        </div>

        <DialogFooter className="flex items-center">
          <p className="flex-1">{selections.products.size} products selected</p>
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
