export type TickerProps = {};

export interface Trade {
  price: number;
  amount: number;
  time: string;
  side: "buy" | "sell";
}
