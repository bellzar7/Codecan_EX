import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useTranslation } from "next-i18next";
import type { FC, ReactNode } from "react";
import Heading from "@/components/elements/base/heading/Heading";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Tag from "@/components/elements/base/tag/Tag";

type BinaryOrder = {
  id: string;
  symbol: string;
  side: string;
  status: string;
  amount: number;
  profit: number;
  createdAt: string;
};

type Props = {
  shape?: "straight" | "rounded-sm" | "curved" | "full";
  positions: BinaryOrder[];
};

const getStatusColor = (
  status: string
): "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "WIN":
      return "success";
    case "PENDING":
      return "warning";
    case "LOSS":
    case "CANCELLED":
    case "REJECTED":
      return "danger";
    case "DRAW":
      return "info";
    default:
      return "info";
  }
};

const getProfitContent = (item: BinaryOrder): ReactNode => {
  const [, pair] = item.symbol.split("/") || [];
  const basePair = pair || "";

  if (item.status === "PENDING") {
    return <span className="text-warning-500">Pending</span>;
  }

  let profitValue = 0;
  let classColor = "text-muted";

  if (item.status === "WIN") {
    profitValue = item.amount * (item.profit / 100);
    classColor = "text-success-500";
  } else if (item.status === "LOSS") {
    profitValue = -item.amount;
    classColor = "text-danger-500";
  } else if (item.status === "DRAW") {
    profitValue = 0;
    classColor = "text-muted";
  }

  return (
    <span className={classColor}>
      {profitValue > 0 ? `+${profitValue}` : profitValue} {basePair}
    </span>
  );
};

const BinaryList: FC<Props> = ({ shape = "rounded-sm", positions }) => {
  const { t } = useTranslation();

  return (
    <div className="slimscroll xs:h-64 w-full overflow-y-auto sm:h-80">
      <div className="space-y-6 pr-2">
        {positions.map((item) => (
          <div className="flex items-center gap-2" key={item.id}>
            <IconBox
              color={item.side === "RISE" ? "success" : "danger"}
              icon={`ph:trend-${item.side === "RISE" ? "up" : "down"}-duotone`}
              shape={"rounded-sm"}
              size="md"
              variant="pastel"
            />
            <div>
              <Heading
                as="h3"
                className="text-md text-muted-800 dark:text-muted-100"
                weight="medium"
              >
                {item.symbol}
              </Heading>
              <span className="text-muted-400 text-sm">
                {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <div className="ms-auto">
              <Tag color={getStatusColor(item.status)} variant="pastel">
                {getProfitContent(item)}
              </Tag>
            </div>
          </div>
        ))}
        {positions.length === 0 && (
          <div className="flex xs:h-64 w-full flex-col items-center justify-center text-gray-500 sm:h-80 dark:text-gray-500">
            <Icon className="h-16 w-16" icon="ph:files-thin" />
            {t("No Positions Found")}
          </div>
        )}
      </div>
    </div>
  );
};

export default BinaryList;
