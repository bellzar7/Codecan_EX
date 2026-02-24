// backend/integrations/twelvedata/prime.ts
import { putTicker } from "./store";

const REST_URL = "https://api.twelvedata.com/price";
const API_KEY = process.env.TWD_API_KEY!;

export async function primeByRest(symbols: string[]) {
  if (!symbols.length) {
    return;
  }

  // TwelveData дозволяє батч через comma: symbol=AAPL,TSLA,EUR/USD
  const url = `${REST_URL}?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TWD REST ${res.status}`);
  }

  // Відповідь у батч-режимі — об’єкт із ключами-символами
  const data = await res.json();

  const now = Date.now();
  for (const s of symbols) {
    const node = data[s]; // { price: "123.45", ... } або { code, message }
    if (node?.price) {
      const price = Number(node.price);
      if (Number.isFinite(price)) {
        await putTicker(s, price, now);
      }
    }
  }
}
