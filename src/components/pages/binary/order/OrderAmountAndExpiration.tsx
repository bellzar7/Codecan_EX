import type React from "react";
import type { Dispatch, SetStateAction } from "react";
import Input from "@/components/elements/form/input/Input";
import { ClientTime } from "./ClientTime";

interface OrderAmountAndExpirationProps {
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  balance: number;
  minAmount: number;
  maxAmount: number;
  expiry: any; // Adjust with proper type if available
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  t?: (key: string) => string; // from useTranslation
}

const OrderAmountAndExpiration: React.FC<OrderAmountAndExpirationProps> = ({
  amount,
  setAmount,
  balance,
  minAmount,
  maxAmount,
  expiry,
  isModalOpen,
  setIsModalOpen,
  t = (key) => key,
}) => {
  return (
    <div className="flex items-end gap-3 md:flex-col">
      <div className="w-full">
        <Input
          disabled={balance <= 0}
          label={t("Amount")}
          max={maxAmount}
          min={minAmount}
          onChange={(e) => setAmount(Number(e.target.value))}
          shape={"rounded-sm"}
          step={minAmount}
          type="number"
          value={amount}
        />
      </div>

      <div className="relative w-full">
        <label className="font-sans text-[.68rem] text-muted-400">
          {t("Expiration")}
        </label>
        <button
          className="w-full rounded-md border border-muted-200 bg-white p-2 text-left text-muted-700 text-sm dark:border-muted-700 dark:bg-muted-800 dark:text-muted-200"
          onClick={() => setIsModalOpen(!isModalOpen)}
          type="button"
        >
          <ClientTime expiry={expiry} />
        </button>
      </div>
    </div>
  );
};

export default OrderAmountAndExpiration;
