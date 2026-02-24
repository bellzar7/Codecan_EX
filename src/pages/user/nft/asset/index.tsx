import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useState } from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Input from "@/components/elements/form/input/Input";
import PaginationControls from "@/components/pages/nft/collection/elements/PaginationControls";
import AssetGridCard from "@/components/pages/nft/collection/tabs/asset/table/Grid";
import AssetTableHeader from "@/components/pages/nft/collection/tabs/asset/table/Header";
import AssetListRow from "@/components/pages/nft/collection/tabs/asset/table/List";
import Layout from "@/layouts/Nav";
import $fetch from "@/utils/api";

const AssetPage: React.FC = () => {
  const [assets, setAssets] = useState<NftAsset[]>([]);
  const [search, setSearch] = useState("");
  const [sortState, setSortState] = useState({
    field: "name",
    rule: "asc" as "asc" | "desc",
  });
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
  });

  const fetchAssets = async () => {
    const params: Record<string, string | number | boolean> = {};

    if (search.trim()) params.search = search.trim();
    if (sortState.field) params.sortBy = sortState.field;
    if (sortState.rule) params.order = sortState.rule;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    params.limit = pagination.perPage;
    params.offset = (pagination.currentPage - 1) * pagination.perPage;

    const { data, error } = await $fetch({
      url: "/api/ext/nft/user/asset",
      params,
      silent: true,
    });

    if (!error) {
      const assetsData = data as any;
      setAssets(assetsData);
      setPagination((prev) => ({ ...prev, totalItems: assetsData.length }));
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [
    search,
    sortState,
    minPrice,
    maxPrice,
    pagination.currentPage,
    pagination.perPage,
  ]);

  return (
    <Layout color="muted" horizontal title="User NFT Assets">
      <div className="p-8">
        {/* Search and Filters Row */}
        <div className="mb-4 flex items-end justify-between">
          {/* Search Bar */}
          <div className="w-64">
            <Input
              icon="mdi:magnify"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              type="text"
              value={search}
            />
          </div>

          <div className="flex items-end gap-4">
            {/* Filters */}
            <div className="flex items-end space-x-4 text-muted-400">
              <Input
                onChange={(e) => setMinPrice(Number(e.target.value))}
                placeholder="Min. value"
                type="number"
                value={minPrice !== undefined ? minPrice : ""}
              />
              <Input
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                placeholder="Max. value"
                type="number"
                value={maxPrice !== undefined ? maxPrice : ""}
              />
              <Tooltip content="Filter">
                <IconButton onClick={fetchAssets}>
                  <Icon icon="mdi:filter" />
                </IconButton>
              </Tooltip>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 border-muted-200 border-s ps-4 dark:border-muted-800">
              <Tooltip content="List View">
                <IconButton
                  color={viewMode === "list" ? "purple" : "muted"}
                  onClick={() => setViewMode("list")}
                >
                  <Icon icon="stash:list-ul" />
                </IconButton>
              </Tooltip>

              <Tooltip content="Grid View">
                <IconButton
                  color={viewMode === "grid" ? "purple" : "muted"}
                  onClick={() => setViewMode("grid")}
                >
                  <Icon icon="bitcoin-icons:grid-filled" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Asset List Table with Sortable Headers */}
        <div className="w-full text-muted-300">
          {viewMode === "list" && (
            <AssetTableHeader
              setSortState={setSortState}
              sortState={sortState}
            />
          )}

          <div className={viewMode === "grid" ? "grid grid-cols-4 gap-6" : ""}>
            {assets.map((asset, index) =>
              viewMode === "list" ? (
                <AssetListRow asset={asset} chain="ETH" key={index} />
              ) : (
                <AssetGridCard asset={asset} key={index} />
              )
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <PaginationControls
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </Layout>
  );
};

export default AssetPage;
