import type React from "react";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Select from "@/components/elements/form/select/Select";

interface PaginationControlsProps {
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      currentPage: number;
      perPage: number;
      totalItems: number;
    }>
  >;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  setPagination,
}) => {
  // Handle page change
  const changePage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  return (
    <div
      className={
        "mt-4 flex w-full flex-col justify-between gap-4 rounded-lg border border-muted-200 bg-muted-50 p-2 md:flex-row md:items-center dark:border-muted-800 dark:bg-muted-900"
      }
    >
      <div className="w-full md:w-auto md:max-w-[164px]">
        <Select
          color="contrast"
          name="pageSize"
          onChange={(e) =>
            setPagination({
              ...pagination,
              perPage: Number.parseInt(e.target.value, 10),
              currentPage: 1, // Reset to first page when items per page changes
            })
          }
          options={[
            { value: "5", label: "5 per page" },
            { value: "10", label: "10 per page" },
            { value: "15", label: "15 per page" },
            { value: "20", label: "20 per page" },
          ]}
          value={pagination.perPage.toString()}
        />
      </div>
      <Pagination
        buttonSize={"md"}
        currentPage={pagination.currentPage}
        onPageChange={changePage}
        pageSize={pagination.perPage}
        totalCount={pagination.totalItems}
      />
    </div>
  );
};

export default PaginationControls;
