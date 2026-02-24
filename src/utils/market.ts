export const formatLargeNumber = (
  num: number | string,
  precision: number | null = null
) => {
  const parsedNum = typeof num === "number" ? num : Number.parseFloat(num);

  if (isNaN(parsedNum)) {
    return "0";
  }

  if (parsedNum >= 1_000_000_000) {
    return (parsedNum / 1_000_000_000).toFixed(2) + "B";
  }
  if (parsedNum >= 1_000_000) {
    return (parsedNum / 1_000_000).toFixed(2) + "M";
  }
  if (parsedNum >= 1000) {
    return (parsedNum / 1000).toFixed(2) + "K";
  }
  if (parsedNum >= 1) {
    return parsedNum.toFixed(2);
  }
  if (precision !== null) {
    return parsedNum.toFixed(precision);
  }

  return parsedNum.toString();
};

export const transformTickers = (data: Record<string, unknown>) => {
  return Object.entries(data).map(([symbol, ticker]: [string, any]) => ({
    currency: symbol.split("/")[0],
    pair: symbol.split("/")[1],
    name: symbol,
    price: ticker.last,
    change: ticker.change?.toFixed(2),
    baseVolume: formatLargeNumber(ticker.baseVolume),
    quoteVolume: formatLargeNumber(ticker.quoteVolume),
  }));
};
