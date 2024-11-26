import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

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
    <div
      className="flex items-center gap-x-2 text-sm"
      ref={setNodeRef}
      style={style}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="text-gray-400" size={16} />
      </div>
      <div className="flex-1 items-center gap-4 p-2 border rounded-2xl">
        <div className="flex-1 px-2">
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

export default SortableVariant;
