import { Icon } from "@iconify/react";
import Tag from "@/components/elements/base/tag/Tag";

const ClassNameTag = ({ name, onEdit, onRemove }) => (
  <Tag className="relative cursor-pointer" shape={"rounded-xs"}>
    <span onClick={onEdit}>{name}</span>
    <Icon
      className="absolute -top-1 -right-1 cursor-pointer text-red-500 hover:text-red-700"
      icon="carbon:close-filled"
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering onEdit
        onRemove();
      }}
    />
  </Tag>
);

export default ClassNameTag;
