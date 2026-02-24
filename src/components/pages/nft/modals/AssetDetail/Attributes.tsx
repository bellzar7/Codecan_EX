import type React from "react";

interface Attribute {
  trait_type: string;
  value: string;
}

interface AssetAttributesProps {
  attributes: Attribute[];
}

const AssetAttributes: React.FC<AssetAttributesProps> = ({ attributes }) => {
  if (!attributes || attributes.length === 0)
    return <p>No attributes found.</p>;

  return (
    <div className="space-y-4 rounded-lg bg-muted-100 p-4 shadow-md dark:bg-muted-800">
      <h2 className="font-medium text-lg text-muted-900 dark:text-white">
        Attributes
      </h2>
      <ul className="space-y-2">
        {attributes.map((attr, index) => (
          <li
            className="flex justify-between text-muted-700 text-sm dark:text-muted-300"
            key={index}
          >
            <span>{attr.trait_type}</span>
            <span className="font-semibold">{attr.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssetAttributes;
