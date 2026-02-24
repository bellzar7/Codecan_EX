import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { type FC, useEffect, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Table from "@/components/elements/base/table/Table";
import TD from "@/components/elements/base/table/TD";
import TH from "@/components/elements/base/table/TH";
import Tag from "@/components/elements/base/tag/Tag";
import Select from "@/components/elements/form/select/Select";
import $fetch from "@/utils/api";

interface TicketsTableProps {
  title?: string;
}
const TicketsTable: FC<TicketsTableProps> = ({ title = "Recent Tickets" }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    perPage: 10,
    totalPages: 0,
  });
  // Function to fetch tickets
  const fetchTickets = async () => {
    try {
      const { data, error } = await $fetch({
        url: "/api/user/support/ticket",
        silent: true,
      });
      if (error) {
        console.error("Failed to fetch tickets:", error);
      } else {
        setItems((data as any).items);
        setPagination((data as any).pagination);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };
  // Use effect to fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);
  const tagStatusMap = {
    OPEN: "primary",
    CLOSED: "muted",
    PENDING: "warning",
    REPLIED: "info",
  };
  const importanceStatusMap = (importance: string, status: string) => {
    if (status === "CLOSED") return "bg-muted-200 dark:bg-muted-800";
    if (importance === "LOW" && ["OPEN", "PENDING", "REPLIED"].includes(status))
      return "bg-success-500";
    if (
      importance === "MEDIUM" &&
      ["OPEN", "PENDING", "REPLIED"].includes(status)
    )
      return "bg-yellow-400";
    if (
      importance === "HIGH" &&
      ["OPEN", "PENDING", "REPLIED"].includes(status)
    )
      return "bg-danger-500";
    return "";
  };
  return (
    <div className="w-full">
      <Card className="overflow-x-auto p-6" color="contrast" shape="smooth">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-medium font-sans text-base text-muted-800 leading-tight tracking-wider dark:text-white">
            {title}
          </h3>
          <div className="flex">
            <Button
              className="h-9! min-w-[64px]! rounded-e-none!"
              color="primary"
              size="sm"
            >
              {t("All")}
            </Button>
            <Button className="h-9! min-w-[64px]! rounded-s-none!" size="sm">
              {t("Open")}
            </Button>
          </div>
        </div>
        <Table className="font-sans">
          <thead>
            <tr>
              <TH>{t("Title")}</TH>
              <TH>{t("Status")}</TH>
              <TH>{t("Priority")}</TH>
              <TH className="min-w-[180px]">{t("Customer")}</TH>
              <TH>{t("Date")}</TH>
              <TH className="ltablet:hidden">{t("Assignees")}</TH>
              <TH>{t("Action")}</TH>
            </tr>
          </thead>
          <tbody>
            {items.map((ticket, index) => (
              <tr
                className="transition-colors duration-300 hover:bg-muted-50 dark:hover:bg-muted-900"
                key={index}
              >
                <TD className="font-medium text-muted-800 text-sm dark:text-muted-100">
                  <span className="line-clamp-1">{ticket.subject}</span>
                </TD>
                <TD className="font-medium text-muted-500 text-sm dark:text-muted-400">
                  <Tag
                    color={(tagStatusMap[ticket.status] as any) || "default"}
                    variant={"pastel"}
                  >
                    {ticket.status}
                  </Tag>
                </TD>
                <TD className="font-medium text-muted-500 text-sm dark:text-muted-400">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${importanceStatusMap(ticket.importance, ticket.status)}
                    `}
                    />
                    <span className="font-sans text-muted-500 text-sm dark:text-muted-400">
                      {ticket.importance}
                    </span>
                  </div>
                </TD>
                <TD className="font-medium text-muted-800 text-sm dark:text-muted-100">
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="xxs"
                      src={
                        ticket.user?.avatar || "/img/avatars/placeholder.webp"
                      }
                    />
                    <div className="font-sans">
                      <p className="text-muted-800 text-sm leading-none dark:text-muted-100">
                        {ticket.user?.firstName} {ticket.user?.lastName}
                      </p>
                      <span className="block text-muted-400 text-xs">
                        {ticket.user?.email}
                      </span>
                    </div>
                  </div>
                </TD>
                <TD className="font-medium text-muted-500 text-xs dark:text-muted-400">
                  {formatDate(new Date(ticket.createdAt), "MMM dd, yyyy")}
                </TD>
                <TD className="ltablet:hidden">
                  <div className="flex items-center">
                    <Avatar
                      alt="product image"
                      overlaps
                      size="xxs"
                      src={
                        ticket.chat?.agent?.avatar ||
                        "/img/avatars/placeholder.webp"
                      }
                    />
                  </div>
                </TD>
                <TD className="font-medium text-muted-500 text-sm dark:text-muted-400">
                  <ButtonLink href="#" size="sm">
                    {t("Details")}
                  </ButtonLink>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <div className="mt-4 flex items-center justify-between gap-6">
        <div className="max-w-[180px]">
          <Select
            color="contrast"
            name="pageSize"
            onChange={(e) => {
              const pageSize = Number.parseInt(e.target.value);
              setPagination({ ...pagination, perPage: pageSize });
            }}
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
                value: "15",
                label: "15 per page",
              },
              {
                value: "20",
                label: "20 per page",
              },
            ]}
            value={pagination.perPage}
          />
        </div>
        <div>
          <Pagination
            buttonSize="sm"
            currentPage={pagination.currentPage}
            onPageChange={(page) => {
              setPagination({ ...pagination, currentPage: page });
            }}
            pageSize={pagination.perPage}
            totalCount={pagination.totalItems}
          />
        </div>
      </div>
    </div>
  );
};
export default TicketsTable;
