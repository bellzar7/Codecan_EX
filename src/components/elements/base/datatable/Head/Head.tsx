import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useMemo, useState } from "react";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import useEditState from "@/hooks/useEditState";
import { useDataTable } from "@/stores/datatable";
import { numberFilterOptions, stringFilterOptions } from "@/utils/datatable";
import { Tooltip } from "../../tooltips/Tooltip";
import type { HeadProps } from "./Head.types";
import HeadCell from "./HeadCell";

const getFilterKey = (columnConfig, field) => {
  return columnConfig.find((col) => col.field === field)?.sortName || field;
};
const HeadBase = ({
  columnConfig,
  hasActions,
  canDelete,
  dynamicColumnWidths,
}: HeadProps) => {
  const { t } = useTranslation();

  const {
    filter,
    setFilter,
    selectAllItems,
    clearSelection,
    filterOperator,
    isLoading,
    items,
    selectedItems,
  } = useDataTable((state) => state);

  const isAllSelected =
    selectedItems.length === items.length && items.length > 0;

  const { editState, enableEdit, handleEditChange, saveEdit, handleKeyPress } =
    useEditState(columnConfig, setFilter);
  const [isOperatorOpen, setIsOperatorOpen] = useState({});
  const renderEditInput = (column, value, onChange, onBlur, onKeyPress) => {
    switch (column.type) {
      case "text":
      case "tag":
      case "tags":
        return (
          <Input
            autoFocus
            icon="mdi:magnify"
            noPadding
            onBlur={onBlur}
            onChange={onChange}
            onKeyPress={onKeyPress}
            size="sm"
            type="text"
            value={value ?? ""}
          />
        );
      case "rating":
      case "number":
        return (
          <Input
            autoFocus
            icon="mdi:magnify"
            noPadding
            onBlur={onBlur}
            onChange={onChange}
            onKeyPress={onKeyPress}
            size="sm"
            type="number"
            value={value ?? ""}
          />
        );
      case "switch":
        return (
          <div className="flex items-center">
            <ToggleSwitch
              checked={value === "true"}
              color="success"
              onChange={onChange}
            />
            <Tooltip content={t("Clear filter")}>
              <Icon
                className="cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                icon="ph:x"
                onClick={() => saveEdit(editState.field, undefined, true)}
              />
            </Tooltip>
          </div>
        );
      case "select":
        return (
          <ListBox
            loading={isLoading}
            onClose={onBlur}
            options={[{ value: "", label: t("All") }, ...column.options]}
            selected={
              column.options.find((option) => option.value === value) || {
                label: "",
                value: "",
              }
            }
            setSelected={(e) => {
              onChange({ target: { value: e.value } });
            }}
            size="sm"
          />
        );
      default:
        return null;
    }
  };
  const handleFilterTypeChange = useCallback(
    (sortField, value) => {
      setFilter(sortField, filter[sortField], value);
    },
    [filter, setFilter]
  );

  const widthStyles = useMemo(() => {
    return columnConfig.reduce(
      (acc, column, index) => {
        const isSwitch = column.type === "switch";
        const isSelect = column.type === "select";
        const width = dynamicColumnWidths[index]?.width || "auto";
        acc[column.field] = {
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: typeof width === "number" ? `${width}px` : width,
          minWidth: isSwitch || isSelect ? "80px" : "auto",
        };
        return acc;
      },
      {} as Record<
        string,
        { width: string | number; maxWidth: string | number; minWidth: string }
      >
    );
  }, [columnConfig, dynamicColumnWidths]);

  const renderCellContent = useCallback(
    (column, currentFilterValue, isEditingThisField, filterKey) => {
      const { field, label, sortable, filterable, sortName, tooltip } = column;

      return isEditingThisField ? (
        renderEditInput(
          column,
          editState.value,
          handleEditChange,
          () => saveEdit(filterKey, editState.value),
          handleKeyPress
        )
      ) : isOperatorOpen[sortName || field] ? (
        <div className="flex items-center justify-between gap-4">
          <ListBox
            loading={isLoading}
            onClose={() =>
              setIsOperatorOpen({
                ...isOperatorOpen,
                [sortName || field]: false,
              })
            }
            options={
              ["number", "rating"].includes(column.type)
                ? numberFilterOptions
                : stringFilterOptions
            }
            selected={
              filterOperator[sortName || field] || {
                label: t("Select Operator"),
                value: "",
              }
            }
            setSelected={(e) => {
              handleFilterTypeChange(sortName || field, e);
              setIsOperatorOpen({
                ...isOperatorOpen,
                [sortName || field]: false,
              });
            }}
            size="sm"
          />
        </div>
      ) : sortable ? (
        <HeadCell
          filterable={filterable}
          isOperatorOpen={isOperatorOpen[sortName || field]}
          label={currentFilterValue ? `(${t(currentFilterValue)})` : t(label)}
          options={
            ["number", "rating"].includes(column.type)
              ? numberFilterOptions
              : stringFilterOptions
          }
          setIsOperatorOpen={(value) =>
            setIsOperatorOpen({
              ...isOperatorOpen,
              [sortName || field]: value,
            })
          }
          sortField={sortName || field}
          tooltip={`${t("Double click to filter by")} ${t(tooltip || field)}`}
        />
      ) : (
        <div className="flex items-center justify-between gap-4 font-sans">
          {filterable ? (
            <Tooltip content={`${t("Double-click to filter by")} ${t(label)}`}>
              <span className="cursor-help font-medium text-muted text-xs uppercase">
                {currentFilterValue
                  ? `${t(label)} (${t(currentFilterValue)})`
                  : t(label)}
              </span>
            </Tooltip>
          ) : (
            <span className="py-3 font-medium text-muted text-xs uppercase">
              {currentFilterValue
                ? `${t(label)} (${t(currentFilterValue)})`
                : t(label)}
            </span>
          )}
        </div>
      );
    },
    [
      editState.value,
      filterOperator,
      handleEditChange,
      handleFilterTypeChange,
      handleKeyPress,
      isLoading,
      isOperatorOpen,
      renderEditInput,
      saveEdit,
      t,
    ]
  );
  return (
    <tr className="divide-x divide-muted-200 dark:divide-muted-800">
      {canDelete && (
        <th className="w-[41.6px] min-w-[41.6px]">
          <div className="pt-2">
            <Checkbox
              aria-label={t("Select all items")}
              checked={isAllSelected}
              className="cursor-pointer"
              color="primary"
              onChange={(e) => {
                if (e.target.checked) {
                  selectAllItems();
                } else {
                  clearSelection();
                }
              }}
            />
          </div>
        </th>
      )}
      {columnConfig.map((column) => {
        const { field } = column;
        const filterKey = getFilterKey(columnConfig, field);
        const currentFilterValue = filter[filterKey];
        const isEditingThisField =
          editState.isEditing && editState.field === filterKey;

        return (
          <th
            className={`${!hasActions && ""} px-4`}
            key={field}
            onDoubleClick={() =>
              enableEdit(field, currentFilterValue, column.type)
            }
            style={widthStyles[field]}
          >
            {renderCellContent(
              column,
              currentFilterValue,
              isEditingThisField,
              filterKey
            )}
          </th>
        );
      })}

      {hasActions && (
        <th className="w-20 min-w-20">
          <div className="flex items-center justify-center gap-4 font-sans">
            <span className="font-medium text-muted text-xs uppercase">
              {t("Actions")}
            </span>
          </div>
        </th>
      )}
    </tr>
  );
};
export const Head = memo(HeadBase);
