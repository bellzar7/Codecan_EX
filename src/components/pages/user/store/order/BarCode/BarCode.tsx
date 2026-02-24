import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import { MashImage } from "@/components/elements/MashImage";

const BarCodeBase = ({ id, date }) => {
  const { t } = useTranslation();
  const [barcodeSrc, setBarcodeSrc] = useState("");
  useEffect(() => {
    if (id) {
      const fetchBarcode = async () => {
        const apiUrl = `https://barcode.tec-it.com/barcode.ashx?data=${id}&code=Code128&translate-esc=true`;
        setBarcodeSrc(apiUrl);
      };
      fetchBarcode();
    }
  }, [id]);
  return (
    <>
      <div className="mt-5 flex flex-row justify-between">
        <div className="relative">
          <MashImage
            alt="barcode"
            className="dark:opacity-50 dark:invert"
            height={150}
            src={barcodeSrc}
            width={400}
          />
        </div>
      </div>
      <span className="mt-4 block text-muted-400 text-sm">
        {t("Issued on")}{" "}
        {formatDate(new Date(date || new Date()), "dd MMM yyyy")}
      </span>
    </>
  );
};
export const BarCode = memo(BarCodeBase);
