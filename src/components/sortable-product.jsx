import { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical, Edit2, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CSS } from "@dnd-kit/utilities";

const SortableProduct = ({
  product,
  onRemove,
  onToggleVariants,
  onDiscountChange,
  expanded,
  children,
  onEdit,
}) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState(
    product?.discount || { type: "flat", value: 0 }
  );

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

  const handleDiscountChange = (field, value) => {
    const updatedDiscount = { ...discount, [field]: value };
    setDiscount(updatedDiscount);
    onDiscountChange(product.id, updatedDiscount);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-x-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="text-gray-400" size={20} />
        </div>
        <div className="flex-1 border rounded-lg px-4 py-2 text-sm bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <span className="font-medium">{product.title}</span>
            </div>
            <button className="p-1 hover:text-blue-500" onClick={onEdit}>
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        {!showDiscount && (
          <Button
            variant="outline"
            onClick={() => setShowDiscount(!showDiscount)}
          >
            Add Discount
          </Button>
        )}
        {showDiscount && (
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={discount.value}
              onChange={(e) => handleDiscountChange("value", e.target.value)}
              className="p-2 border rounded w-20"
              placeholder="Value"
            />

            <Select
              value={discount.type}
              onValueChange={(value) => handleDiscountChange("type", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="percentage">% Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <button
          onClick={() => onRemove(product.id)}
          className="p-1 hover:text-red-500"
        >
          <X size={16} />
        </button>
      </div>
      {product.variants?.length > 1 && (
        <button
          onClick={() => onToggleVariants(product.id)}
          className="p-1 flex gap-x-1 items-center ml-auto hover:text-blue-500 text-sm"
        >
          {expanded ? "Hide variants" : "Show variants"}

          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      {expanded && children}
    </div>
  );
};

export default SortableProduct;
