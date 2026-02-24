// src/components/twelvedata/TwdMarkets.tsx

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";

// import { debounce } from "lodash"; // не використовується — можна видалити

import MarketsPagination from "@/components/pages/user/markets/MarketsPagination";
import MarketsTable from "@/components/pages/user/markets/MarketsTable";
import MarketsToolbar from "@/components/pages/user/markets/MarketsToolbar";

import {
  getTwdTickers,
  mapTwdToMarketItems,
  twdGetDefaults,
  twdGetSummary,
  twdGetWatchlist,
} from "@/services/twelvedata";

type Kind = "forex" | "indices" | "stocks";

type Props = {
  kind?: Kind;
  symbols?: string[];
  pollMs?: number;
};

const DEFAULT_BY_KIND: Record<Kind, string[]> = {
  forex: ["EUR/USD", "GBP/USD", "USD/JPY"],
  indices: ["SPX", "NDX", "DJI"],
  stocks: ["AAPL:NASDAQ", "TSLA:NASDAQ", "QQQ:NASDAQ"],
};

export default function TwdMarkets({
  kind = "forex",
  symbols,
  pollMs = 3000,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const [baseItems, setBaseItems] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sorted, setSorted] = useState<{ field: string; rule: "asc" | "desc" }>(
    { field: "", rule: "asc" }
  );
  const [pages, setPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 0,
    currentPage: 1,
    from: 1,
    to: 25,
  });

  const [finalSymbols, setFinalSymbols] = useState<string[]>([]);

  const resolveSymbols = useCallback(async () => {
    if (symbols?.length) {
      setFinalSymbols(symbols);
      return;
    }

    const defaults = await twdGetDefaults();
    let list = defaults && defaults.length ? defaults : DEFAULT_BY_KIND[kind];

    if (kind === "stocks") {
      list = list.filter((s) => !s.includes("/"));
    } else if (kind === "forex") {
      list = list.filter((s) => s.includes("/"));
    } else if (kind === "indices") {
      list = list.filter((s) => !s.includes("/"));
    }

    setFinalSymbols(list);
  }, [kind, symbols]);

  const loadWatchlist = useCallback(async () => {
    const wl = await twdGetWatchlist();
    setWatchlist(wl);
  }, []);

  const loadTickers = useCallback(async () => {
    if (!finalSymbols.length) return;

    const [{ items }, summary] = await Promise.all([
      getTwdTickers(finalSymbols),
      twdGetSummary(finalSymbols),
    ]);

    const base = mapTwdToMarketItems(items); // зараз вертає {symbol, price, ...}

    // змерджимо change/percentage/high/low у формат MarketsTable
    const merged = base.map((row) => {
      const s = summary[row.symbol];
      return s
        ? {
            ...row,
            change: Number(s.change.toFixed(2)),
            percentage: Number(s.percentage.toFixed(2)),
            high: s.high,
            low: s.low,
            // обидва volume не заповнюємо (див. нижче)
            baseVolume: undefined,
            quoteVolume: undefined,
          }
        : row;
    });

    setBaseItems(merged);
  }, [finalSymbols]);

  useEffect(() => {
    resolveSymbols();
  }, [resolveSymbols]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    loadTickers();
    if (pollMs > 0) {
      const id = setInterval(loadTickers, pollMs);
      return () => clearInterval(id);
    }
  }, [loadTickers, pollMs]);

  const compareOnKey = useCallback((key: string, rule: "asc" | "desc") => {
    return (a: any, b: any) => {
      const A = a[key] ?? null;
      const B = b[key] ?? null;
      if (typeof A === "string" && typeof B === "string") {
        return rule === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }
      if (typeof A === "number" && typeof B === "number") {
        return rule === "asc" ? A - B : B - A;
      }
      return 0;
    };
  }, []);

  useEffect(() => {
    let next = [...baseItems];
    if (searchQuery)
      next = next.filter((i) =>
        i.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (sorted.field) next.sort(compareOnKey(sorted.field, sorted.rule));
    setItems(next);
  }, [baseItems, searchQuery, sorted, compareOnKey]);

  const updatePagination = useCallback(
    (total: number, per: number, page: number) => {
      const lastPage = Math.ceil(total / per) || 1;
      const from = (page - 1) * per + 1;
      const to = Math.min(page * per, total);
      setPagination({ total, lastPage, currentPage: page, from, to });

      const totalPages = Math.ceil(total / per);
      const newPages = Array.from({ length: totalPages }, (_, i) => i + 1);
      setPages(newPages);
    },
    []
  );

  useEffect(() => {
    updatePagination(items.length, perPage, currentPage);
  }, [items.length, perPage, currentPage, updatePagination]);

  const changePage = useCallback((p: number) => setCurrentPage(p), []);
  const changePerPage = useCallback((pp: number) => {
    setPerPage(pp);
    setCurrentPage(1);
  }, []);
  const sortData = useCallback((field: string, rule: "asc" | "desc") => {
    setSorted({ field, rule });
    setCurrentPage(1);
  }, []);
  const onSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const handleNavigation = useCallback(
    (symbol: string) => {
      router.push(`/trade/${symbol.replace("/", "_")}`);
    },
    [router]
  );

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, currentPage, perPage]);

  return (
    <main id="datatable">
      <MarketsToolbar onSearch={onSearch} t={t} />

      <MarketsTable
        handleNavigation={handleNavigation}
        isDark={false}
        items={pagedItems}
        pagination={pagination}
        perPage={perPage}
        sort={sortData}
        sorted={sorted}
        t={t}
      />

      <MarketsPagination
        changePage={changePage}
        changePerPage={changePerPage}
        currentPage={currentPage}
        pages={pages}
        pagination={pagination}
        perPage={perPage}
        t={t}
      />
    </main>
  );
}
