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
import { useGetProductList } from "@/hooks/useGetProductList";
import { useCallback } from "react";
import { useRef } from "react";

export function ProductPicker({ open, onOpenChange, onProductsSelect }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selections, setSelections] = useState({
    products: new Set(),
    variants: new Map(),
  });

  const {
    data: products = [],
    loading,
    error,
  } = useGetProductList(query, page, open);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSelections({ products: new Set(), variants: new Map() });
      setPage(1);
      setHasMore(true);
    }
  }, [open, query]);

  useEffect(() => {
    if (products?.length > 0) {
      setAllProducts((prev) => {
        const newProducts = products.filter(
          (product) => !prev.some((p) => p.id === product.id)
        );
        return [...prev, ...newProducts];
      });
    } else if (products?.length === 0) {
      setHasMore(false);
    }
  }, [products]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;

    if (isAtBottom) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [loading, hasMore]);

  const handleProductSelect = useCallback(
    (productId) => {
      setSelections((prev) => {
        const newSelections = { ...prev };
        const product = products.find((p) => p.id === productId);

        if (prev.products.has(productId)) {
          // remove or de-select product and its variant
          newSelections.products = new Set(
            [...prev.products].filter((id) => id !== productId)
          );
          newSelections.variants = new Map(
            [...prev.variants].filter(([id]) => id !== productId)
          );
        } else {
          // set all product and its variants
          newSelections.products = new Set([...prev.products, productId]);
          newSelections.variants = new Map(prev.variants);
          newSelections.variants.set(
            productId,
            new Set(product?.variants?.map((v) => v.id))
          );
        }

        return newSelections;
      });
    },
    [products]
  );

  const handleVariantSelect = useCallback((variantId, productId) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      const productVariants = new Set(prev.variants.get(productId) || []);

      if (productVariants.has(variantId)) {
        // remove variant if its selected
        productVariants.delete(variantId);
        if (productVariants.size === 0) {
          // remove product if variant is empty
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
  }, []);

  const handleSearchProducts = (e) => {
    setQuery(e.target.value);
    setAllProducts([]);
    setPage(1);
    setHasMore(true);
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

  const renderVariant = useCallback(
    (variant, productId) => (
      <div key={variant.id} className="flex ml-12 items-center gap-x-4">
        <Checkbox
          checked={selections.variants.get(productId)?.has(variant.id) || false}
          onCheckedChange={() => handleVariantSelect(variant.id, productId)}
        />
        <p className="text-sm flex-1">{variant.title}</p>
        <span>${variant.price}</span>
      </div>
    ),
    [handleVariantSelect, selections.variants]
  );

  const renderProduct = useCallback(
    (product) => (
      <div key={product.id} className="flex flex-col gap-4 p-2">
        <div className="flex items-center gap-x-4">
          <Checkbox
            checked={selections.products.has(product.id)}
            onCheckedChange={() => handleProductSelect(product.id)}
          />
          <img
            src={`${product.image.src} + &quality=1`}
            alt={product.title}
            loading="lazy"
            className="rounded-md object-cover w-10 h-10"
          />
          <h4 className="font-medium text-sm flex-1">{product.title}</h4>
        </div>
        <div>
          {product.variants?.map((variant) =>
            renderVariant(variant, product.id)
          )}
        </div>
      </div>
    ),
    [handleProductSelect, renderVariant, selections.products]
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
            type="search"
            value={query}
            onChange={handleSearchProducts}
            className="pl-8"
          />
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-[400px] overflow-y-auto"
        >
          {allProducts.map(renderProduct)}

          {loading && (
            <div className="text-center py-4">
              <p>Loading more products...</p>
            </div>
          )}

          {!hasMore && allProducts.length > 0 && (
            <div className="text-center py-4">
              <p>No more products to load</p>
            </div>
          )}

          {!loading && allProducts.length === 0 && (
            <div className="text-center py-4">
              <p>No products found</p>
            </div>
          )}
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
