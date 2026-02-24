import type React from "react";
import Card from "@/components/elements/base/card/Card";
import Portal from "@/components/elements/portal";

interface ExpiryModalProps {
  expirations: Array<{
    minutes: number;
    expirationTime: Date;
  }>;
  expiry: {
    minutes: number;
    expirationTime: Date;
  };
  setExpiry: (exp: { minutes: number; expirationTime: Date }) => void;
  setIsModalOpen: (open: boolean) => void;
  formatTime: (timeLeft: number) => string;
  t: (key: string) => string;
}

const ExpiryModal: React.FC<ExpiryModalProps> = ({
  expirations,
  expiry,
  setExpiry,
  setIsModalOpen,
  formatTime,
  t,
}) => {
  return (
    <Portal onClose={() => setIsModalOpen(false)}>
      <Card className="max-w-md p-5">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold text-lg text-muted-700 dark:text-muted-300">
            {t("Expiry Time")}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {expirations.map((exp) => {
            const timeLeft = Math.round(
              (exp.expirationTime.getTime() - Date.now()) / 1000
            );
            const isDisabled = timeLeft < 50;

            return (
              <button
                className={`mb-2 flex w-full min-w-64 justify-between rounded border p-2 text-left text-md transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed border-danger-500 text-danger-500 dark:border-danger-500 dark:text-danger-500"
                    : "border-muted-200 text-muted-700 hover:bg-muted-100 dark:border-muted-700 dark:text-muted-200 dark:hover:bg-muted-700"
                } ${
                  expiry.minutes === exp.minutes
                    ? "bg-muted-200 dark:bg-muted-700"
                    : ""
                }`}
                disabled={isDisabled}
                key={exp.minutes}
                onClick={() => {
                  if (!isDisabled) {
                    setExpiry(exp);
                    setIsModalOpen(false);
                  }
                }}
                type="button"
              >
                <span>
                  {exp.minutes} {t("min")}
                </span>
                <span>({formatTime(timeLeft)})</span>
              </button>
            );
          })}
        </div>
      </Card>
    </Portal>
  );
};

export default ExpiryModal;
