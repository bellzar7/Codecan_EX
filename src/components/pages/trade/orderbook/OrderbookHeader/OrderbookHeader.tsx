import { memo } from "react";
import { PercentageBar } from "../PercentageBar";
import { VisibilityControls } from "../VisibilityControls";

const OrderbookHeaderBase = ({
  visible,
  setVisible,
  askPercentage,
  bidPercentage,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-2">
      <VisibilityControls setVisible={setVisible} visible={visible} />
      <PercentageBar
        askPercentage={askPercentage}
        bidPercentage={bidPercentage}
      />
    </div>
  );
};

export const OrderbookHeader = memo(OrderbookHeaderBase);
