import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "./ui/button";
import { ProductPicker } from "./product-picker";
import SortableProduct from "./sortable-product";
import SortableVariant from "./sortable-variant";

const initialProduct = {
  id: Date.now(),
  title: "Select Product",
  variants: [],
};

const ProductManager = () => {
  const [state, setState] = useState({
    products: [initialProduct],
    expandedProducts: {},
    activeId: null,
    isPickerOpen: false,
    editingId: null,
  });

  const { products, expandedProducts, isPickerOpen } = state;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const productOperations = {
    add: useCallback(() => {
      setState((prev) => ({
        ...prev,
        products: [...prev.products, { ...initialProduct, id: Date.now() }],
      }));
    }, []),

    remove: useCallback((productId) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== productId),
        expandedProducts: {
          ...prev.expandedProducts,
          [productId]: undefined,
        },
      }));
    }, []),

    updateDiscount: useCallback((productId, discount) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product.id === productId ? { ...product, discount } : product
        ),
      }));
    }, []),

    toggleVariants: useCallback((productId) => {
      setState((prev) => ({
        ...prev,
        expandedProducts: {
          ...prev.expandedProducts,
          [productId]: !prev.expandedProducts[productId],
        },
      }));
    }, []),

    removeVariant: useCallback((productId, variantId) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((product) =>
          product.id === productId
            ? {
                ...product,
                variants: product.variants.filter((v) => v.id !== variantId),
              }
            : product
        ),
      }));
    }, []),
  };

  const pickerOperations = {
    open: useCallback((id) => {
      setState((prev) => ({
        ...prev,
        isPickerOpen: true,
        editingId: id,
      }));
    }, []),

    close: useCallback(() => {
      setState((prev) => ({
        ...prev,
        isPickerOpen: false,
        editingId: null,
      }));
    }, []),

    handleSelection: useCallback((selectedProducts) => {
      setState((prev) => {
        if (!prev.editingId) return prev;

        const index = prev.products.findIndex((p) => p.id === prev.editingId);
        if (index === -1) return prev;

        const newProducts = [...prev.products];
        newProducts.splice(index, 1, ...selectedProducts);

        return {
          ...prev,
          products: newProducts,
          editingId: null,
          isPickerOpen: false,
        };
      });
    }, []),
  };

  const dndHandlers = {
    onDragStart: useCallback((event) => {
      setState((prev) => ({ ...prev, activeId: event.active.id }));
    }, []),

    onDragEnd: useCallback((event) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setState((prev) => ({ ...prev, activeId: null }));
        return;
      }

      setState((prev) => {
        const newState = { ...prev, activeId: null };
        const activeType = active.id.toString().split("-")[0];

        if (activeType === "product") {
          const oldIndex = prev.products.findIndex(
            (p) => `product-${p.id}` === active.id
          );
          const newIndex = prev.products.findIndex(
            (p) => `product-${p.id}` === over.id
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            const newProducts = [...prev.products];
            const [movedProduct] = newProducts.splice(oldIndex, 1);
            newProducts.splice(newIndex, 0, movedProduct);
            newState.products = newProducts;
          }
        } else if (activeType === "variant") {
          const product = prev.products.find((p) =>
            p.variants.some((v) => `variant-${v.id}` === active.id)
          );

          if (product) {
            const oldIndex = product.variants.findIndex(
              (v) => `variant-${v.id}` === active.id
            );
            const newIndex = product.variants.findIndex(
              (v) => `variant-${v.id}` === over.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
              newState.products = prev.products.map((p) => {
                if (p.id === product.id) {
                  const newVariants = [...p.variants];
                  const [movedVariant] = newVariants.splice(oldIndex, 1);
                  newVariants.splice(newIndex, 0, movedVariant);
                  return { ...p, variants: newVariants };
                }
                return p;
              });
            }
          }
        }

        return newState;
      });
    }, []),
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="font-medium mb-4 text-lg">Add Products</h2>
      <div className="flex font-medium justify-between items-center">
        <h3 className="flex-1 ml-6">Product</h3>
        <h3 className="w-56">Discount</h3>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={dndHandlers.onDragStart}
        onDragEnd={dndHandlers.onDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={products.map((p) => `product-${p.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {products.map((product) => (
              <SortableProduct
                key={product.id}
                product={product}
                onRemove={productOperations.remove}
                onDiscountChange={productOperations.updateDiscount}
                onToggleVariants={productOperations.toggleVariants}
                expanded={expandedProducts[product.id]}
                onEdit={() => pickerOperations.open(product.id)}
              >
                {expandedProducts[product.id] &&
                  product.variants?.length > 0 && (
                    <div className="mt-4 ml-8 space-y-2">
                      <SortableContext
                        items={product.variants.map((v) => `variant-${v.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {product.variants.map((variant) => (
                          <SortableVariant
                            key={variant.id}
                            variant={variant}
                            productId={product.id}
                            onRemove={productOperations.removeVariant}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  )}
              </SortableProduct>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ProductPicker
        open={isPickerOpen}
        onOpenChange={pickerOperations.close}
        onProductsSelect={pickerOperations.handleSelection}
      />

      <Button
        onClick={productOperations.add}
        variant="outline"
        className="flex ml-auto mt-4 h-14 w-60"
      >
        Add Product
      </Button>
    </div>
  );
};

export default ProductManager;
