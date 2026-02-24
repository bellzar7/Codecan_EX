import { safeJSONParse } from "@/utils/datatable";
import Tag from "../../../tag/Tag";
import type { TagsProps } from "./Tags.types";

const TagsBase = ({ item, value }: TagsProps) => {
  let tags = value;
  if (typeof value === "string") {
    tags = safeJSONParse(value);
  }

  // Ensure tags is always treated as an iterable array
  let tagEntries;

  if (Array.isArray(tags)) {
    tagEntries = tags.map((tag) => [null, tag]);
  } else if (typeof tags === "object" && tags !== null) {
    tagEntries = Object.entries(tags);
  } else {
    tagEntries = [];
  }

  // Function to determine what to display in the tag
  const renderTagContent = (entry) => {
    if (entry && typeof entry === "object") {
      return `${(entry as any).duration} ${(entry as any).timeframe}`;
    }
    if (typeof entry === "object" && entry !== null) {
      return JSON.stringify(entry);
    }
    return entry;
  };

  return (
    <div className="card-dashed">
      <p className="mb-2 text-muted-400 text-sm dark:text-muted-600">
        {(item as any).label || (item as any).name}
      </p>
      <div className="flex flex-wrap gap-2">
        {tagEntries.map(([, value], index) => {
          const content = renderTagContent(value);
          return (
            <Tag color="default" key={index} shape="smooth" variant="outlined">
              {content}
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export const Tags = TagsBase;
