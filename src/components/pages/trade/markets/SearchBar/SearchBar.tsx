import { useTranslation } from "next-i18next";
import { memo } from "react";
import Input from "@/components/elements/form/input/Input";
import useMarketStore from "@/stores/trade/market";

const SearchBarBase = () => {
  const { t } = useTranslation();
  const { setSearchQuery } = useMarketStore();
  return (
    <Input
      icon={"bx:bx-search"}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder={t("Search pairs...")}
      shape={"rounded-xs"}
      size={"sm"}
      type="text"
      warning
    />
  );
};
export const SearchBar = memo(SearchBarBase);
