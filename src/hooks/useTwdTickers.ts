// src/hooks/useTwdTickers.ts
import * as React from "react";
import { getTwdTickers, type TWDPrice } from "@/services/twelvedata";

export function useTwdTickers(symbols: string[], intervalMs = 3000) {
  const [items, setItems] = React.useState<TWDPrice[]>([]);
  const [missing, setMissing] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const load = React.useCallback(async () => {
    const { items, missing } = await getTwdTickers(symbols);
    setItems(items);
    setMissing(missing || []);
    setLoading(false);
  }, [symbols]);

  React.useEffect(() => {
    let id: any;
    load();
    if (intervalMs > 0) id = setInterval(load, intervalMs);
    return () => id && clearInterval(id);
  }, [load, intervalMs]);

  return { items, missing, loading };
}
