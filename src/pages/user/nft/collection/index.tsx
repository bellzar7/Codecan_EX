import { Icon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Input from "@/components/elements/form/input/Input";
import PaginationControls from "@/components/pages/nft/collection/elements/PaginationControls";
import { SortableHeader } from "@/components/pages/trade/markets/SortableHeader";
import Layout from "@/layouts/Nav";
import $fetch from "@/utils/api";

const CollectionPage: React.FC = () => {
  const [collections, setCollections] = useState<NftCollection[]>([]);
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

  const fetchCollections = async () => {
    const params: Record<string, string | number | boolean> = {};

    if (search.trim()) params.search = search.trim();
    if (sortState.field) params.sortBy = sortState.field;
    if (sortState.rule) params.order = sortState.rule;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    params.limit = pagination.perPage;
    params.offset = (pagination.currentPage - 1) * pagination.perPage;

    const { data, error } = await $fetch({
      url: "/api/ext/nft/user/collection",
      params,
      silent: true,
    });

    if (!error) {
      const collectionsData = data as any;
      setCollections(collectionsData);
      setPagination((prev) => ({
        ...prev,
        totalItems: collectionsData.length,
      }));
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [
    search,
    sortState,
    minPrice,
    maxPrice,
    pagination.currentPage,
    pagination.perPage,
  ]);

  return (
    <Layout color="muted" horizontal title="User NFT Collections">
      <div className="p-8">
        {/* Search and Filters Row */}
        <div className="mb-4 flex items-end justify-between">
          {/* Search Bar */}
          <div className="w-64">
            <Input
              icon="mdi:magnify"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collections..."
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
                <IconButton onClick={fetchCollections}>
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

        {/* Collection List Table with Sortable Headers */}
        <div className="w-full text-muted-300">
          {viewMode === "list" && (
            <div className="mb-1 grid grid-cols-6 gap-4 rounded-lg bg-muted-150 py-3 text-muted-400 text-sm dark:bg-muted-900">
              <SortableHeader
                className="col-span-2 ps-4 text-muted-700 dark:text-muted-200"
                field="name"
                setSort={setSortState}
                size="sm"
                sort={sortState}
                title="Collection Name"
              />
              <SortableHeader
                className="text-muted-700 dark:text-muted-200"
                field="floorPrice"
                setSort={setSortState}
                size="sm"
                sort={sortState}
                title="Floor Price"
              />
              <SortableHeader
                className="text-muted-700 dark:text-muted-200"
                field="totalVolume"
                setSort={setSortState}
                size="sm"
                sort={sortState}
                title="Volume"
              />
              <SortableHeader
                className="text-muted-700 dark:text-muted-200"
                field="nftCount"
                setSort={setSortState}
                size="sm"
                sort={sortState}
                title="NFT Count"
              />
              <SortableHeader
                className="text-muted-700 dark:text-muted-200"
                field="createdAt"
                setSort={setSortState}
                size="sm"
                sort={sortState}
                title="Created At"
              />
            </div>
          )}

          <div className={viewMode === "grid" ? "grid grid-cols-4 gap-6" : ""}>
            {collections.map((collection, index) =>
              viewMode === "list" ? (
                <div
                  className="grid cursor-pointer grid-cols-6 items-center gap-4 border-muted-200 border-b py-3 transition hover:border-muted-100 hover:bg-muted-100 dark:border-muted-800 dark:hover:border-muted-800 dark:hover:bg-muted-800"
                  key={index}
                >
                  <div className="col-span-2 flex items-center">
                    <img
                      alt={collection.name}
                      className="mx-4 h-20 w-20 rounded-md"
                      src={collection.image}
                    />
                    <div>
                      <span className="font-semibold text-lg text-muted-800 dark:text-muted-200">
                        {collection.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted-800 dark:text-muted-200">
                    {collection.floorPrice || "N/A"}
                  </span>
                  <span className="text-muted-800 dark:text-muted-200">
                    {collection.totalVolume || "N/A"}
                  </span>
                  <span className="text-muted-800 dark:text-muted-200">
                    {collection.nftCount || 0}
                  </span>
                  <span className="text-muted-800 dark:text-muted-200">
                    {new Date(collection.createdAt).toDateString() || "N/A"}
                  </span>
                </div>
              ) : (
                <Link
                  className="group block overflow-hidden rounded-xl border border-muted-200 bg-muted-100 transition hover:border-purple-500 dark:border-muted-900 dark:bg-black"
                  href={`/nft/collection/${collection.id}`}
                  key={index}
                >
                  <div className="relative h-[18rem] w-full overflow-hidden">
                    <img
                      alt={collection.name}
                      className="h-full w-full transform object-cover transition-transform duration-300 group-hover:scale-110"
                      src={collection.image}
                    />
                  </div>
                  <div className="relative bg-muted-200 p-4 transition group-hover:shadow-lg dark:bg-muted-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-muted-900 dark:text-white">
                          {collection.name}
                        </h3>
                        <p className="text-muted-600 text-sm dark:text-muted-400">
                          Floor Price: {collection.floorPrice || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
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

export default CollectionPage;
