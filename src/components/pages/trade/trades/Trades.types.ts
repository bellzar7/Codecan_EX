export type TickerProps = {};

export interface Trade {
  id: string;
  price: number;
  amount: number;
  time: string;
  side: "buy" | "sell";
}
