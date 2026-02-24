import { Icon } from "@iconify/react";
import Link from "next/link";
import React from "react";
import Skeleton from "react-loading-skeleton";
import Avatar from "@/components/elements/base/avatar/Avatar";
import IconButton from "@/components/elements/base/button-icon/IconButton";

interface MarketRowProps {
  item: any;
  isDark: boolean;
  handleNavigation: (symbol: string) => void;
}

const MarketRow: React.FC<MarketRowProps> = ({
  item,
  isDark,
  handleNavigation,
}) => {
  return (
    <tr
      className={
        "cursor-pointer border-muted-200 border-b transition-colors duration-300 last:border-none hover:bg-muted-200/40 dark:border-muted-800 dark:hover:bg-muted-900/60"
      }
      onClick={() => handleNavigation(item.symbol)}
    >
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <Avatar
            size="xxs"
            src={item.icon || `/img/crypto/${item.currency.toLowerCase()}.webp`}
          />
          <span className="line-clamp-1 text-md text-muted-700 dark:text-muted-200">
            {item.symbol}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="line-clamp-1 text-md text-muted-700 dark:text-muted-200">
          {item.price || (
            <Skeleton
              baseColor={isDark ? "#27272a" : "#f7fafc"}
              height={10}
              highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
              width={40}
            />
          )}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <span
          className={`line-clamp-1 text-md text-${
            item.percentage >= 0
              ? item.percentage === 0
                ? "muted"
                : "success"
              : "danger"
          }-500`}
        >
          {item.percentage !== undefined && item.percentage !== null ? (
            `${item.percentage.toFixed(2)}%`
          ) : (
            <Skeleton
              baseColor={isDark ? "#27272a" : "#f7fafc"}
              height={10}
              highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
              width={40}
            />
          )}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        <div>
          <span className="line-clamp-1 text-md text-muted-700 dark:text-muted-200">
            {item.baseVolume !== undefined && item.baseVolume !== null ? (
              item.baseVolume
            ) : (
              <Skeleton
                baseColor={isDark ? "#27272a" : "#f7fafc"}
                height={10}
                highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                width={40}
              />
            )}{" "}
            <span className="text-muted-400 text-xs">({item.currency})</span>
          </span>
          <span className="line-clamp-1 text-md text-muted-700 dark:text-muted-200">
            {item.quoteVolume !== undefined && item.quoteVolume !== null ? (
              item.quoteVolume
            ) : (
              <Skeleton
                baseColor={isDark ? "#27272a" : "#f7fafc"}
                height={10}
                highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                width={40}
              />
            )}{" "}
            <span className="text-muted-400 text-xs">({item.pair})</span>
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-end align-middle">
        <Link href={`/trade/${item.symbol.replace("/", "_")}`}>
          <IconButton color="contrast" size="sm" variant="pastel">
            <Icon icon="akar-icons:arrow-right" width={16} />
          </IconButton>
        </Link>
      </td>
    </tr>
  );
};

export default React.memo(MarketRow);
