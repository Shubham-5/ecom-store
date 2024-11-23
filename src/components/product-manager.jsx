import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  GripVertical,
  X,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";

const SortableProduct = ({
  product,
  onRemove,
  onToggleVariants,
  expanded,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `product-${product.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-x-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="text-gray-400" size={20} />
        </div>
        <div className="flex-1 border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="font-medium">{product.title}</span>
            </div>
            <button className="p-1 hover:text-blue-500">
              <Edit2 size={16} />
            </button>
          </div>
        </div>
        <button
          onClick={() => onRemove(product.id)}
          className="p-1 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </div>
      <button
        onClick={() => onToggleVariants(product.id)}
        className="p-1 flex items-center ml-auto hover:text-blue-500"
      >
        {expanded ? "Hide variants" : "Show variants"}

        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && children}
    </div>
  );
};

const SortableVariant = ({ variant, productId, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `variant-${variant.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="flex items-center gap-x-2" ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="text-gray-400" size={16} />
      </div>
      <div className="flex-1 items-center gap-4 p-2 border rounded-lg">
        <div className="flex-1">
          <span>{variant.title}</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(productId, variant.id)}
        className="p-1 hover:text-red-500"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ProductManager = () => {
  const [products, setProducts] = useState([
    {
      id: 77,
      title: "Fog Linen Chambray Towel - Beige Stripe",
      variants: [
        { id: 1, product_id: 77, title: "XS / Silver", price: "49" },
        { id: 2, product_id: 77, title: "S / Silver", price: "49" },
        { id: 3, product_id: 77, title: "M / Silver", price: "49" },
      ],
    },
    {
      id: 80,
      title: "Orbit Terrarium - Large",
      variants: [
        { id: 64, product_id: 80, title: "Default Title", price: "109" },
      ],
    },
  ]);

  const [expandedProducts, setExpandedProducts] = useState({});
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      title: "New Product",
      variants: [],
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (productId) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  const toggleVariants = (productId) => {
    setExpandedProducts({
      ...expandedProducts,
      [productId]: !expandedProducts[productId],
    });
  };

  const removeVariant = (productId, variantId) => {
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            variants: product.variants.filter((v) => v.id !== variantId),
          };
        }
        return product;
      })
    );
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const isProduct = active.id.toString().startsWith("product-");
    const isVariant = active.id.toString().startsWith("variant-");

    if (isProduct) {
      const oldIndex = products.findIndex(
        (p) => `product-${p.id}` === active.id
      );
      const newIndex = products.findIndex((p) => `product-${p.id}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newProducts = [...products];
        const [movedProduct] = newProducts.splice(oldIndex, 1);
        newProducts.splice(newIndex, 0, movedProduct);
        setProducts(newProducts);
      }
    } else if (isVariant) {
      const productId = products.find((p) =>
        p.variants.some((v) => `variant-${v.id}` === active.id)
      )?.id;

      if (productId) {
        const product = products.find((p) => p.id === productId);
        const oldIndex = product.variants.findIndex(
          (v) => `variant-${v.id}` === active.id
        );
        const newIndex = product.variants.findIndex(
          (v) => `variant-${v.id}` === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newProducts = products.map((p) => {
            if (p.id === productId) {
              const newVariants = [...p.variants];
              const [movedVariant] = newVariants.splice(oldIndex, 1);
              newVariants.splice(newIndex, 0, movedVariant);
              return { ...p, variants: newVariants };
            }
            return p;
          });
          setProducts(newProducts);
        }
      }
    }

    setActiveId(null);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
                onRemove={removeProduct}
                onToggleVariants={toggleVariants}
                expanded={expandedProducts[product.id]}
              >
                {expandedProducts[product.id] && product.variants && (
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
                          onRemove={removeVariant}
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

      <Button
        onClick={addProduct}
        className="mb-4 flex ml-auto mt-4 items-center gap-2"
      >
        <Plus size={16} /> Add Product
      </Button>
    </div>
  );
};

export default ProductManager;
