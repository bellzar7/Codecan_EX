"use client";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { capitalize } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadingRow } from "@/components/elements/base/datatable/LoadingRow";
import { NoItemsFound } from "@/components/elements/base/datatable/NoItemsFound";
import { Row } from "@/components/elements/base/datatable/Row";
import { useDataTable } from "@/stores/datatable";
import Select from "../../form/select/Select";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import IconButton from "../button-icon/IconButton";
import IconBox from "../iconbox/IconBox";
import Pagination from "../pagination/Pagination";
import { Tooltip } from "../tooltips/Tooltip";
import { BulkSelectionMessage } from "./BulkSelectionMessage";
import { ConfirmationModal } from "./ConfirmationModal";
import { FormModal } from "./FormModal";
import { Head } from "./Head";
import { NavActions } from "./NavActions";
import { View } from "./View";

const DataTableBase = ({
  title,
  endpoint,
  columnConfig = [],
  postTitle = "Manage",
  hasBreadcrumb = true,
  hasRotatingBackButton = true,
  hasStructure = true,
  isCrud = true,
  isParanoid = true,
  canView = true,
  canCreate = true,
  canImport = false,
  canEdit = true,
  canDelete = true,
  hasAnalytics = false,
  hasTitle = true,
  onlySingleActiveStatus = false,
  fixedPagination = false,
  paginationLocation = "floating",
  size = "sm",
  shape = "rounded-lg",
  navActionsSlot,
  navActionsConfig,
  dropdownActionsSlot,
  dropdownActionsConfig,
  formSize,
  viewPath,
  editPath,
  blank,
  navSlot,
}: DataTableProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentPath = useRef(router.asPath.split("?")[0]);
  const [isHovered, setIsHovered] = useState(false);
  const {
    items,
    selectedItems,
    isLoading,
    pagination,
    setDataTableProps,
    setPagination,
    actionConfigs,
    activeModal,
    modalAction,
    viewItem,
    showDeletedAction,
    setFilters,
    fetchData,
    clearFilters,
    clearDataTableProps,
    setParams,
  } = useDataTable((state) => state);
  const allowedKeys = useMemo(() => {
    return columnConfig.reduce((acc, column) => {
      acc.push(column.sortName || column.field);
      return acc;
    }, [] as string[]);
  }, [columnConfig]);
  const filterParams = useMemo(() => {
    const params = {};
    for (const key of Object.keys(router.query)) {
      if (allowedKeys.includes(key)) {
        params[key] = router.query[key];
      }
    }
    return params;
  }, [router.query, allowedKeys]);
  const otherParams = useMemo(() => {
    const params = {};
    for (const key of Object.keys(router.query)) {
      if (!allowedKeys.includes(key)) {
        params[key] = router.query[key];
      }
    }
    return params;
  }, [router.query, allowedKeys]);
  useEffect(() => {
    setDataTableProps({
      title,
      endpoint,
      hasStructure,
      isCrud,
      isParanoid,
      canView,
      canCreate,
      canImport,
      canEdit,
      canDelete,
      columnConfig,
      formSize,
      navActionsConfig: navActionsConfig as NavActionsConfig[],
      dropdownActionsConfig: dropdownActionsConfig as DropdownActionsConfig[],
      onlySingleActiveStatus,
    });
  }, []);
  useEffect(() => {
    if (router.isReady) {
      // Apply the filtered parameters as filters
      if (Object.keys(filterParams).length > 0) {
        setFilters(filterParams);
      }
      // Handle other parameters not included in the columnConfig
      if (Object.keys(otherParams).length > 0) {
        setParams(otherParams);
      }
      fetchData();
    }
  }, [router.isReady]);
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      const newPathname = new URL(url, window.location.href).pathname;
      if (newPathname !== currentPath.current) {
        setParams({});
        clearDataTableProps();
        clearFilters();
      }
    };
    const handleRouteChangeComplete = (url) => {
      currentPath.current = new URL(url, window.location.href).pathname;
    };
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, []);
  const breadcrumbItems = hasBreadcrumb
    ? currentPath.current
        .split("/")
        .filter((item) => item !== "")
        .map((item) => ({
          title: capitalize(item.replace(/-/g, " ").replace(/#/g, "")),
        }))
    : [];
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState<number | null>(null);
  const [dynamicColumnWidths, setDynamicColumnWidths] = useState<
    { width: number; minWidth: string }[]
  >([]);

  const measureTableWidth = useCallback(() => {
    if (tableRef.current) {
      const multiSelectWidth = canDelete ? 41.6 : 0;
      const actionsWidth =
        !!actionConfigs.dropdownActionsConfig || !!dropdownActionsSlot ? 64 : 0;
      const switchColumns = columnConfig.filter(
        (col) => col.type === "switch"
      ).length;
      const switchWidth = switchColumns * 64;
      const selectColumns = columnConfig.filter(
        (col) => col.type === "select"
      ).length;
      const selectWidth = selectColumns * 128;
      const dynamicColumns = columnConfig.filter(
        (col) => ["switch", "select"].includes(col.type) === false
      ).length;
      const totalFixedWidth =
        multiSelectWidth + actionsWidth + switchWidth + selectWidth;

      // Calculate dynamic widths considering the text width
      let dynamicColumnWidth: number | "auto" = "auto";
      if (tableWidth && dynamicColumns > 0) {
        const availableWidth = Number(tableWidth) - totalFixedWidth;
        dynamicColumnWidth = availableWidth / dynamicColumns;
      }

      // Measure text width
      const textWidths = columnConfig.map((col) => {
        const textElement = document.createElement("span");
        textElement.style.visibility = "hidden";
        textElement.style.whiteSpace = "nowrap";
        textElement.innerText = col.label || "";
        document.body.appendChild(textElement);
        const textWidth = textElement.offsetWidth;
        document.body.removeChild(textElement);
        return textWidth;
      });

      // Set the column widths considering the text width
      const adjustedColumnWidths = columnConfig.map((col, index) => {
        const minWidth = ["switch", "select"].includes(col.type)
          ? "80px"
          : "auto";
        const width =
          dynamicColumnWidth !== "auto"
            ? Math.max(dynamicColumnWidth, textWidths[index])
            : textWidths[index];
        return { width, minWidth };
      });

      setDynamicColumnWidths(adjustedColumnWidths);
      setTableWidth(tableRef.current.offsetWidth);
    }
  }, [
    canDelete,
    actionConfigs.dropdownActionsConfig,
    dropdownActionsSlot,
    columnConfig,
    tableWidth,
  ]);

  useEffect(() => {
    measureTableWidth();
  }, [measureTableWidth]);

  const basePathWithoutQuery = router.asPath.split("?")[0];
  const analysisPath = `${basePathWithoutQuery}/analysis`.replace("//", "/");
  const hasActions =
    !!actionConfigs.dropdownActionsConfig ||
    !!dropdownActionsSlot ||
    (isCrud && (canDelete || canEdit || canView));
  return (
    <div className="h-full" id="datatable">
      <AnimatePresence>
        {selectedItems.length > 0 && canDelete && isCrud && (
          <BulkSelectionMessage key="bulk-selection-message" />
        )}
      </AnimatePresence>
      {hasTitle && (
        <div
          className={`mb-2 ${
            hasBreadcrumb && "min-h-16"
          } flex w-full flex-col items-center justify-center gap-5 rounded-lg py-2 md:flex-row md:justify-between`}
        >
          <div className="flex items-center gap-4">
            {hasRotatingBackButton && (
              <IconBox
                className="cursor-pointer duration-300 hover:bg-black/10 hover:text-black hover:shadow-inner dark:hover:bg-white/20"
                color="muted"
                icon={
                  isHovered
                    ? "heroicons-solid:chevron-left"
                    : "material-symbols-light:app-badging-outline"
                }
                onClick={() => router.back()}
                onMouseLeave={() => setIsHovered(false)}
                onMouseOver={() => setIsHovered(true)}
                rotating={!isHovered}
                shape={"rounded"}
                size={"md"}
                variant={"pastel"}
              />
            )}
            <h2 className="font-light font-sans text-lg text-muted-700 uppercase tracking-wide dark:text-muted-300">
              {t(postTitle)} {t(title)}
              {hasBreadcrumb && (
                <Breadcrumb items={breadcrumbItems} separator="slash" />
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {navSlot}
            <NavActions navActionsSlot={navActionsSlot} />
            {hasAnalytics && (
              <Tooltip content={t("Analytics")}>
                <Link href={analysisPath}>
                  <IconButton
                    aria-label={t("Analytics")}
                    color="primary"
                    shape={"rounded"}
                    size={"lg"}
                    variant="pastel"
                  >
                    <Icon
                      className="h-6 w-6"
                      icon="solar:chart-2-bold-duotone"
                    />
                  </IconButton>
                </Link>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex w-full flex-col overflow-x-auto ltablet:overflow-x-visible lg:overflow-x-visible ${
          shape !== "straight" &&
          `border border-muted-200 dark:border-muted-800 ${shape}`
        }`}
      >
        <table
          className={`border border-muted-200 bg-white font-sans dark:border-muted-800 dark:bg-muted-900 ${
            shape !== "straight" && "table-rounded"
          }`}
          ref={tableRef}
        >
          <thead className="border-fade-grey-2 border-b dark:border-muted-800">
            <Head
              canDelete={isCrud && canDelete}
              columnConfig={columnConfig}
              dynamicColumnWidths={dynamicColumnWidths}
              hasActions={hasActions}
            />
          </thead>
          <tbody className={`text-${size}`}>
            {isLoading ? (
              <LoadingRow
                canDelete={canDelete}
                columnConfig={columnConfig}
                hasActions={hasActions}
                isCrud={isCrud}
              />
            ) : items?.length > 0 ? (
              items.map((item, index) => (
                <Row
                  blank={blank}
                  canDelete={isCrud && canDelete}
                  columnConfig={columnConfig}
                  dropdownActionsSlot={dropdownActionsSlot}
                  editPath={editPath}
                  hasActions={hasActions}
                  isParanoid={isParanoid}
                  item={item}
                  key={index}
                  viewPath={viewPath}
                />
              ))
            ) : (
              <NoItemsFound
                cols={
                  columnConfig.length +
                  (canDelete ? 1 : 0) +
                  (hasActions ? 1 : 0)
                }
              />
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedItems.length === 0 && (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className={
              paginationLocation === "floating"
                ? "fixed bottom-5 left-[5%] flex w-[90%] items-start gap-4 sm:left-[10%] sm:w-[80%] md:left-[15%] md:w-[70%] lg:left-[20%] lg:w-[60%]"
                : `${
                    fixedPagination && "absolute bottom-0"
                  } flex w-full items-start gap-4 ${
                    shape !== "straight" && "pt-5"
                  }`
            }
            exit={{ y: 50, opacity: 0 }}
            initial={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {showDeletedAction && (
              <div
                className={`"min-64 w-64 justify-between p-1.5 ${
                  shape !== "straight" && shape
                } border border-muted-200 bg-muted-50 dark:border-muted-800 dark:bg-muted-950`}
              >
                <NavActions navAction={showDeletedAction} />
              </div>
            )}
            <div
              className={`flex w-full flex-col justify-between gap-4 p-1.5 md:flex-row md:items-center ${
                shape !== "straight" &&
                `border border-muted-200 dark:border-muted-800 ${shape}`
              } bg-muted-50 ${
                paginationLocation === "floating"
                  ? "dark:bg-muted-950"
                  : "dark:bg-muted-900"
              }`}
            >
              <div className="w-full md:w-auto md:max-w-[164px]">
                <Select
                  aria-label={t("Items per page")}
                  color="contrast"
                  name="pageSize"
                  onChange={(e) =>
                    setPagination({
                      perPage: Number.parseInt(e.target.value),
                      currentPage: 1,
                    })
                  }
                  options={[
                    {
                      value: "10",
                      label: `10 ${t("per page")}`,
                    },
                    {
                      value: "25",
                      label: `25 ${t("per page")}`,
                    },
                    {
                      value: "50",
                      label: `50 ${t("per page")}`,
                    },
                    {
                      value: "100",
                      label: `100 ${t("per page")}`,
                    },
                    {
                      value: "250",
                      label: `250 ${t("per page")}`,
                    },
                  ]}
                  shape={"rounded-sm"}
                  value={pagination.perPage}
                />
              </div>
              <Pagination
                buttonShape={"rounded-sm"}
                buttonSize={"md"}
                currentPage={pagination.currentPage}
                onPageChange={(page) =>
                  pagination.currentPage !== page &&
                  setPagination({ currentPage: page })
                }
                pageSize={pagination.perPage}
                totalCount={pagination.totalItems}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCrud && modalAction?.modalType === "confirmation" && (
        <ConfirmationModal />
      )}
      {isCrud && activeModal === "FormModal" && <FormModal />}
      {isCrud && viewItem && <View title={title} />}
    </div>
  );
};
export const DataTable = DataTableBase;
