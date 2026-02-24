import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import HeadCell from "@/components/pages/user/markets/HeadCell";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import IconButton from "../button-icon/IconButton";
import { Tooltip } from "../tooltips/Tooltip";

type PaginationType = {
  totalItems: number;
  totalPages: number;
  perPage: number;
  currentPage: number;
  from: number;
  to: number;
};

type ObjectTableBaseProps = {
  title?: string;
  items: any[];
  setItems?: (items: any[]) => void;
  shape?: "straight" | "rounded-sm";
  navSlot?: React.ReactNode;
  columnConfig: ColumnConfigType[];
  filterField?: string;
  size?: "xs" | "sm" | "md" | "lg";
  border?: boolean;
  initialPerPage?: number;

  // New props for expansion
  expandable?: boolean;
  renderExpandedContent?: (item: any) => React.ReactNode;
  expansionMode?: "dropdown" | "modal";
};

const ObjectTableBase: React.FC<ObjectTableBaseProps> = ({
  title = "",
  items,
  setItems,
  shape = "rounded-md",
  navSlot,
  columnConfig,
  filterField,
  size = "md",
  border = true,
  initialPerPage = 5,
  expandable = false,
  renderExpandedContent,
  expansionMode = "dropdown",
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sorted, setSorted] = useState<{ field: string; rule: "asc" | "desc" }>(
    { field: "", rule: "asc" }
  );
  const [pagination, setPagination] = useState<PaginationType>({
    totalItems: 0,
    totalPages: 0,
    perPage: initialPerPage,
    currentPage: 1,
    from: 1,
    to: initialPerPage,
  });

  const [expandedItem, setExpandedItem] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId(); // For stable layoutIds

  const startIndex = (currentPage - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const filteredItems =
    (items &&
      items.length > 0 &&
      items.filter((item) => {
        const filterLower = filter.toLowerCase();
        return columnConfig.some((col) => {
          const value = item[col.field]?.toString().toLowerCase() || "";
          return value.includes(filterLower);
        });
      })) ||
    [];

  const pageItems = filteredItems.slice(startIndex, endIndex) || [];

  const changePage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.totalPages) {
        setCurrentPage(page);
        const newFrom = (page - 1) * pagination.perPage + 1;
        const newTo = page * pagination.perPage;
        setPagination((p) => ({
          ...p,
          currentPage: page,
          from: newFrom,
          to: newTo,
        }));
      }
    },
    [pagination.totalPages, pagination.perPage]
  );

  const sort = (field: string, rule: "asc" | "desc") => {
    const copy = [...items];
    copy.sort((a, b) => {
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return rule === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      if (Array.isArray(a[field]) && Array.isArray(b[field])) {
        return rule === "asc"
          ? a[field].length - b[field].length
          : b[field].length - a[field].length;
      }
      return rule === "asc" ? a[field] - b[field] : b[field] - a[field];
    });
    setItems?.(copy);
    setSorted({ field, rule });
  };

  useEffect(() => {
    setPagination((p) => ({
      ...p,
      totalItems: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / p.perPage),
    }));
  }, [items, filter, pagination.perPage, filteredItems.length]);

  useEffect(() => {
    const newFrom = (currentPage - 1) * pagination.perPage + 1;
    const newTo = currentPage * pagination.perPage;
    setPagination((p) => ({
      ...p,
      from: newFrom,
      to: newTo,
    }));
  }, [currentPage, pagination.perPage]);

  const handleRowClick = (item: any) => {
    if (!expandable) return;
    if (expansionMode === "dropdown") {
      setExpandedItem((prev) => (prev?.id === item.id ? null : item));
    } else {
      // modal mode
      setExpandedItem(item);
    }
  };

  useOnClickOutside(modalRef, () => {
    if (expansionMode === "modal") setExpandedItem(null);
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && expansionMode === "modal")
        setExpandedItem(null);
    }

    if (expandedItem && expansionMode === "modal") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedItem, expansionMode]);

  return (
    <div className="relative h-full">
      <div
        className={`flex items-center justify-between ${
          shape === "straight" && "px-4"
        } ${(title || navSlot || filterField) && "py-3"}`}
      >
        {title && (
          <h2 className="text-lg text-muted-800 dark:text-muted-200">
            {title}
          </h2>
        )}
        {(navSlot || filterField) && (
          <div className="flex items-center gap-4">
            {filterField && (
              <Input
                className="max-w-xs"
                color="contrast"
                icon="lucide:search"
                onChange={(e) => setFilter(e.target.value)}
                placeholder={`Search ${title}`}
                value={filter}
              />
            )}
            {navSlot}
          </div>
        )}
      </div>

      <div
        className={`flex w-full flex-col overflow-x-auto ltablet:overflow-x-visible lg:overflow-x-visible ${
          shape !== "straight" && "rounded-lg"
        }`}
      >
        <table
          className={`mb-16 bg-white font-sans dark:bg-muted-900 ${
            shape !== "straight" && "table-rounded"
          } ${border && "border border-muted-200 dark:border-muted-800"}`}
        >
          <thead className="border-fade-grey-2 border-b dark:border-muted-800">
            <tr className="divide-x divide-muted-200 dark:divide-muted-800">
              {columnConfig.map((col) => (
                <th className="p-4" key={col.field}>
                  <HeadCell
                    label={col.label}
                    sortable={col.sortable}
                    sorted={sorted}
                    sortField={col.field}
                    sortFn={sort}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageItems.map((item, i) => {
              const layoutId = `item-${item.id}-${uniqueId}`;
              return (
                <React.Fragment key={i}>
                  <motion.tr
                    animate={{}}
                    className={`text-${size} border-muted-200 border-b text-muted-800 transition-colors duration-300 last:border-none hover:bg-muted-200/40 dark:border-muted-800 dark:text-muted-200 dark:hover:bg-muted-950/60 ${expandable ? "cursor-pointer" : ""}`}
                    initial={false}
                    layoutId={layoutId} // needed to prevent layout animation issues
                    onClick={() => handleRowClick(item)}
                  >
                    {columnConfig.map((col) => (
                      <td className="px-4 py-3 align-middle" key={col.field}>
                        {col.type === "actions"
                          ? col.actions?.map((action, index) => {
                              return action.condition &&
                                action.condition(item) ? null : (
                                <Tooltip content={action.tooltip} key={index}>
                                  <IconButton
                                    color={action.color}
                                    disabled={action.disabled}
                                    key={index}
                                    loading={action.loading}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(item);
                                    }}
                                    size={action.size}
                                    variant="pastel"
                                  >
                                    <Icon
                                      className="h-5 w-5"
                                      icon={action.icon}
                                    />
                                  </IconButton>
                                </Tooltip>
                              );
                            })
                          : col.renderCell
                            ? col.renderCell(item)
                            : col.getValue
                              ? col.getValue(item)
                              : item[col.field]}
                      </td>
                    ))}
                  </motion.tr>

                  {/* Dropdown Expansion */}
                  {expandable &&
                    expansionMode === "dropdown" &&
                    expandedItem?.id === item.id &&
                    renderExpandedContent && (
                      <tr className="border-muted-200 border-b dark:border-muted-800">
                        <td
                          className="bg-muted-50 p-4 dark:bg-muted-900"
                          colSpan={columnConfig.length}
                        >
                          <AnimatePresence>
                            <motion.div
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              initial={{ height: 0, opacity: 0 }}
                              key={item.id}
                              transition={{ duration: 0.2 }}
                            >
                              {renderExpandedContent(item)}
                            </motion.div>
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              );
            })}
            {!pagination.totalItems && (
              <tr>
                <td className="py-3 text-center" colSpan={columnConfig.length}>
                  <div className="py-32">
                    <Icon
                      className="mx-auto h-20 w-20 text-muted-400"
                      icon="arcticons:samsung-finder"
                    />
                    <h3 className="mb-2 font-sans text-muted-700 text-xl dark:text-muted-200">
                      {t("Nothing found")}
                    </h3>
                    <p className="mx-auto max-w-[280px] font-sans text-md text-muted-400">
                      {t(
                        "Sorry, looks like we couldn't find any matching records. Try different search terms."
                      )}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className={`absolute flex w-full items-start gap-4 ${
            shape === "straight" ? "bottom-0" : "-bottom-5"
          }`}
          exit={{ y: 50, opacity: 0 }}
          initial={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`flex w-full flex-col justify-between gap-4 p-2 md:flex-row md:items-center ${
              shape !== "straight" &&
              "rounded-lg border border-muted-200 dark:border-muted-800"
            } bg-muted-50 dark:bg-muted-900`}
          >
            <div className="w-full md:w-auto md:max-w-[164px]">
              <Select
                color="contrast"
                name="pageSize"
                onChange={(e) =>
                  setPagination({
                    ...pagination,
                    perPage: Number.parseInt(e.target.value, 10),
                  })
                }
                options={[
                  {
                    value: "5",
                    label: "5 per page",
                  },
                  {
                    value: "10",
                    label: "10 per page",
                  },
                  {
                    value: "25",
                    label: "25 per page",
                  },
                  {
                    value: "50",
                    label: "50 per page",
                  },
                  {
                    value: "100",
                    label: "100 per page",
                  },
                  {
                    value: "250",
                    label: "250 per page",
                  },
                  {
                    value: "500",
                    label: "500 per page",
                  },
                  {
                    value: "1000",
                    label: "1000 per page",
                  },
                ]}
                value={pagination.perPage}
              />
            </div>
            <Pagination
              buttonSize={"md"}
              currentPage={pagination.currentPage}
              onPageChange={(page) => changePage(page)}
              pageSize={pagination.perPage}
              totalCount={pagination.totalItems}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal Expansion */}
      {expandable && expansionMode === "modal" && (
        <AnimatePresence>
          {expandedItem && (
            <>
              {/* Faded background with blur */}
              <motion.div
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 h-full w-full bg-black/20 backdrop-blur-xs backdrop-filter"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              />

              <div className="fixed inset-0 z-[100] grid place-items-center">
                <motion.button
                  animate={{ opacity: 1 }}
                  className="absolute top-2 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white"
                  exit={{ opacity: 0, transition: { duration: 0.05 } }}
                  initial={{ opacity: 0 }}
                  key={`close-button-${expandedItem.id}`}
                  layout
                  onClick={() => setExpandedItem(null)}
                >
                  <Icon className="text-neutral-600" icon="mdi:close" />
                </motion.button>

                <motion.div
                  className="flex h-full w-full max-w-[600px] flex-col overflow-hidden border border-muted-100 bg-white sm:rounded-xl md:h-fit md:max-h-[90%] dark:border-muted-900 dark:bg-muted-950"
                  initial={false}
                  layoutId={`item-${expandedItem.id}-${uniqueId}`}
                  ref={modalRef} // needed for layout transitions
                >
                  {/* Render expanded content inside modal */}
                  <div className="overflow-auto p-4">
                    {renderExpandedContent &&
                      renderExpandedContent(expandedItem)}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export const ObjectTable = memo(ObjectTableBase);
