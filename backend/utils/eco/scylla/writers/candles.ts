import client, { scyllaKeyspace } from "@b/utils/eco/scylla/client";

export interface CandleRow {
  symbol: string;
  interval: string;
  createdAt: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
}

const insertCandle = (keyspace: string) => `
  INSERT INTO ${keyspace}.candles
    (symbol, interval, "createdAt", open, high, low, close, volume, "updatedAt")
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, toTimestamp(now()));
`;

export async function upsertCandles(
  rows: CandleRow[],
  keyspace: string = scyllaKeyspace
) {
  if (!rows.length) {
    return;
  }
  const query = insertCandle(keyspace);
  const batch = rows.map((r) => ({
    query,
    params: [
      r.symbol,
      r.interval,
      r.createdAt,
      Number(r.open),
      Number(r.high),
      Number(r.low),
      Number(r.close),
      r.volume == null ? null : Number(r.volume),
    ],
  }));
  await client.batch(batch, { prepare: true });
}
