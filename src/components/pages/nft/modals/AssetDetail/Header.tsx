import { Icon } from "@iconify/react";
import type React from "react";
import Button from "@/components/elements/base/button/Button";

interface ModalHeaderProps {
  onPrev: () => void;
  onNext: () => void;
  index: number;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onPrev, onNext, index }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button disabled={index === 1} onClick={onPrev} type="button">
          <Icon icon="mdi:arrow-left" /> Previous
        </Button>
        <Button onClick={onNext} type="button">
          Next <Icon icon="mdi:arrow-right" />
        </Button>
      </div>
    </div>
  );
};

export default ModalHeader;
