import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Switch } from "@/components/elements/base/datatable/Switch";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import { MashImage } from "@/components/elements/MashImage";
import Rating from "@/components/elements/structures/Rating";
import { useDataTable } from "@/stores/datatable";
import { getAdjustedActionsForItem, getNestedValue } from "@/utils/datatable";
import IconButton from "../../button-icon/IconButton";
import ActionItem from "../../dropdown-action/ActionItem";
import DropdownAction from "../../dropdown-action/DropdownAction";
import Tag from "../../tag/Tag";
import type { RowProps } from "./Row.types";

// Top-level regex for path value extraction
const PATH_KEY_REGEX = /\[(.*?)\]/;

// biome-ignore lint/suspicious/noExplicitAny: DataTable items are dynamic based on endpoint
const getPathValue = (item: any, path: string): string => {
  let updatedPath = path;
  let match: RegExpMatchArray | null = updatedPath.match(PATH_KEY_REGEX);
  // Use a loop to replace all instances of `[key]`
  while (match) {
    const pathKey = match[1];
    const pathValue = getNestedValue(item, pathKey);
    if (pathValue === undefined) {
      console.error(
        `Path key "${pathKey}" not found in item in ${updatedPath}`
      );
      return path;
    }
    updatedPath = updatedPath.replace(`[${pathKey}]`, pathValue);
    match = updatedPath.match(PATH_KEY_REGEX);
  }
  return updatedPath;
};

const clampText = (
  text: string | undefined,
  maxLength: number | undefined
): string | undefined => {
  if (!(maxLength && text)) {
    return text;
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

// Top-level regex for path cleanup
const MULTIPLE_SLASHES_REGEX = /\/+/g;

// Utility to clean up path
const cleanPath = (path: string): string => {
  return path.replace(MULTIPLE_SLASHES_REGEX, "/");
};

const RowBase = ({
  item,
  columnConfig,
  dropdownActionsSlot,
  isParanoid,
  canDelete,
  hasActions,
  viewPath,
  editPath,
  blank: _blank,
}: RowProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    selectedItems,
    toggleItemSelection,
    updateItemStatus,
    actionConfigs,
    handleAction,
  } = useDataTable((state) => state);

  const dropdownActionsConfig = getAdjustedActionsForItem(
    isParanoid,
    actionConfigs?.dropdownActionsConfig,
    item
  );

  const renderCombinedActions = () => {
    const allActionItems = dropdownActionsConfig
      ?.map((action, _index) => {
        if (!(action && item)) {
          return null;
        }
        let link = action.link;
        if (viewPath && action.name === "View") {
          link = cleanPath(getPathValue(item, viewPath));
          return {
            ...action,
            link,
            onClick: () => router.push(link as string),
          };
        }

        if (editPath && action.name === "Edit") {
          link = cleanPath(getPathValue(item, editPath));
          if (!link) {
            return null;
          }
          return {
            ...action,
            link,
            onClick: () => router.push(link as string),
          };
        }

        return {
          ...action,
          link: link
            ? cleanPath(link.replace(":id", String(item.id)))
            : undefined,
          onClick: () =>
            link
              ? router.push(
                  cleanPath(link.replace(":id", String(item.id))) as string
                )
              : handleAction(action, item),
        };
      })
      .filter(Boolean) as Array<{
      onClick: () => undefined | Promise<boolean>;
      name: string;
      label?: string;
      icon: string;
      type: "link" | "modal" | "panel";
      modalType?: "form" | "confirmation";
      side?: "top" | "bottom" | "left" | "right";
      link?: string;
    }>; // Ensure correct type after filtering

    const customActions = dropdownActionsSlot
      ? dropdownActionsSlot(item)
      : null;

    if (allActionItems.length === 1) {
      // biome-ignore lint/style/noNonNullAssertion: Length check guarantees element exists
      const singleAction = allActionItems[0]!;
      return (
        <td className="px-4 py-3 align-middle">
          <div className="flex w-full justify-end">
            <IconButton
              aria-label={singleAction.name || ""}
              className="flex items-center justify-center p-2"
              color="primary"
              name={singleAction.name || ""}
              onClick={singleAction.onClick}
              variant="outlined"
            >
              <Icon className="h-4 w-4" icon={singleAction.icon} />
            </IconButton>
          </div>
        </td>
      );
    }

    return (
      <td className="px-4 py-3 align-middle">
        <div className="flex w-full justify-end">
          <DropdownAction aria-label={t("Actions")} canRotate orientation="end">
            <div className="py-2">
              {customActions}
              {allActionItems.map((action, index) => (
                <ActionItem
                  aria-label={action.name}
                  href={action.link}
                  icon={action.icon}
                  key={`${action.name}-${index}`}
                  onClick={action.onClick}
                  subtext={action.label || ""}
                  text={action.name}
                />
              ))}
            </div>
          </DropdownAction>
        </div>
      </td>
    );
  };

  const itemId = item.id as string | number;
  const isSelected = selectedItems.includes(itemId);

  return (
    <tr className="border-muted-200 border-b transition-colors duration-300 last:border-none hover:bg-muted-200/40 dark:border-muted-800 dark:hover:bg-muted-950/60">
      {canDelete && (
        <td className="pt-2 text-center">
          <Checkbox
            aria-label={t("Select item")}
            checked={isSelected}
            className="cursor-pointer"
            color="primary"
            onChange={() => toggleItemSelection(itemId)}
          />
        </td>
      )}
      {columnConfig.map(
        (
          {
            field,
            sublabel,
            type,
            active = true,
            disabled = false,
            api,
            hasImage,
            imageKey,
            placeholder,
            options,
            getValue,
            getSubValue,
            getImage,
            className,
            precision,
            color,
            path,
            subpath,
            maxLength,
            imageWidth,
            imageHeight,
          },
          index
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex rendering logic for various column types is intentional
        ) => {
          if (typeof active === "string") {
            active = active === "true";
          }
          if (typeof disabled === "string") {
            disabled = disabled === "false";
          }
          let value = item[field];
          if (type === "number" && precision) {
            const precisionValue =
              typeof precision === "function" ? precision(item) : precision;
            value = (item[field] as number | undefined)?.toFixed(
              precisionValue
            );
          }
          let content: React.ReactNode;
          switch (type) {
            case "switch":
              content = (
                <Switch
                  active={active}
                  disabled={disabled}
                  endpoint={api?.replace(":id", String(item.id)) || ""}
                  field={field}
                  initialState={Boolean(item[field])}
                  key={field}
                  onUpdate={(newStatus) =>
                    updateItemStatus(item.id as string | number, newStatus)
                  }
                />
              );
              break;
            case "select":
              content = (
                <Tag
                  color={
                    options?.find((opt) => opt.value === value)?.color ||
                    "warning"
                  }
                  key={field}
                  shape="smooth"
                  variant="pastel"
                >
                  {options?.find((opt) => opt.value === value)?.label ||
                    "Pending"}
                </Tag>
              );
              break;
            case "datetime":
              if (!value) {
                return <td key={field} />;
              }
              content = (
                <span
                  className="line-clamp-1 text-muted-800 dark:text-muted-100"
                  key={field}
                >
                  {new Date(value as string | number | Date).toLocaleString()}
                </span>
              );
              break;
            case "rating":
              if (!value) {
                return <td key={field} />;
              }
              content = (
                <Rating
                  key={field}
                  rating={getValue ? getValue(item) : value}
                />
              );
              break;
            case "tag":
              // biome-ignore lint/suspicious/noExplicitAny: Value type varies based on column config
              if (!value || (value as any).length === 0) {
                return <td key={field} />;
              }
              content = path ? (
                <Link href={cleanPath(getPathValue(item, path))} key={field}>
                  <Tag color={color || "muted"} shape="smooth" variant="pastel">
                    {getValue ? getValue(item) : value}
                  </Tag>
                </Link>
              ) : (
                <Tag
                  color={color || "muted"}
                  key={field}
                  shape="smooth"
                  variant="pastel"
                >
                  {getValue ? getValue(item) : value}
                </Tag>
              );
              break;
            case "tags": {
              // biome-ignore lint/suspicious/noExplicitAny: Value type varies based on column config
              const tagsValue = value as any;
              if (!tagsValue || tagsValue.length === 0) {
                return <td key={field} />;
              }
              content = (
                <div className="flex flex-wrap gap-1" key={field}>
                  {tagsValue
                    .slice(0, 2)
                    .map((tag: { name: string }, idx: number) => (
                      <Tag
                        color={color || "muted"}
                        key={`${tag.name}-${idx}`}
                        shape="smooth"
                        variant="pastel"
                      >
                        {tag.name}
                      </Tag>
                    ))}
                  {tagsValue.length > 2 && (
                    <Tag
                      color={color || "muted"}
                      key="more"
                      shape="smooth"
                      variant="pastel"
                    >
                      +{tagsValue.length - 2} {t("more")}
                    </Tag>
                  )}
                </div>
              );
              break;
            }
            case "image": {
              const imageLink = getImage ? getImage(item) : value;
              content = (
                <MashImage
                  alt={(value as string) || "image"}
                  className={`${className || "rounded-md"}`}
                  height={imageHeight || (item.height as number) || 32}
                  key={field}
                  src={imageLink || placeholder}
                  width={imageWidth || (item.width as number) || 32}
                />
              );
              break;
            }
            default: {
              const truncatedText = clampText(
                getValue ? getValue(item) : value,
                maxLength
              );
              const labelContent = (
                <span
                  className={`text-muted-900 dark:text-muted-100 line-clamp-${maxLength}`}
                  key={field}
                >
                  {truncatedText}
                </span>
              );
              const sublabelContent = sublabel && (
                <span
                  className="text-muted-500 dark:text-muted-400"
                  key={`${field}-sublabel`}
                >
                  {getSubValue ? getSubValue(item) : item[sublabel]}
                </span>
              );
              const imageContent = hasImage && imageKey && (
                <MashImage
                  alt={(value as string) || "image"}
                  className={`${className || "rounded-md"}`}
                  height={imageHeight || (item.height as number) || 32}
                  key={`${field}-image`}
                  src={
                    getImage
                      ? getImage(item)
                      : getNestedValue(item, imageKey) || placeholder
                  }
                  width={imageWidth || (item.width as number) || 32}
                />
              );
              content = (
                <div className="flex items-center gap-2" key={field}>
                  {path && hasImage && imageKey ? (
                    <Link href={cleanPath(getPathValue(item, path))}>
                      {imageContent}
                    </Link>
                  ) : (
                    imageContent
                  )}
                  <div className="line-clamp-1 flex flex-col">
                    {path ? (
                      <Link
                        className="text-purple-600 hover:underline dark:text-purple-400"
                        href={cleanPath(getPathValue(item, path))}
                      >
                        {labelContent}
                      </Link>
                    ) : (
                      labelContent
                    )}
                    {subpath ? (
                      <Link
                        className="text-purple-600 hover:underline dark:text-purple-400"
                        href={cleanPath(getPathValue(item, subpath))}
                      >
                        {sublabelContent}
                      </Link>
                    ) : (
                      sublabelContent
                    )}
                  </div>
                </div>
              );
              break;
            }
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Field names combined with index ensures unique keys
            <td className="px-4 py-3 align-middle" key={`${field}-${index}`}>
              {content}
            </td>
          );
        }
      )}
      {hasActions && renderCombinedActions()}
    </tr>
  );
};
export const Row = RowBase;
