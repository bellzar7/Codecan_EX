import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect } from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { useNftStore } from "@/stores/nft";
import Attributes from "./AssetDetail/Attributes";
import ModalHeader from "./AssetDetail/Header";
import Info from "./AssetDetail/Info";
import DetailsTabs from "./AssetDetail/Tabs";
import PurchaseModal from "./PurchaseModal";

interface AssetDetailModalProps {
  asset: any;
  isVisible: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isVisible,
  onClose,
  onPrev,
  onNext,
}) => {
  const { collection, isPurchaseModalVisible, closePurchaseModal } =
    useNftStore();

  // Disable body scroll when the modal is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Reset scrolling
    }

    // Cleanup to reset the scroll style when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!(isVisible && collection)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-muted-900">
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <IconButton color="muted" onClick={onClose}>
            <Icon icon="mdi:close" />
          </IconButton>
        </div>

        {/* Modal Scrollable Content */}
        <div className="custom-scroll h-[80vh] max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col overflow-hidden md:flex-row">
            {/* Asset Image Section */}
            <div className="flex items-center justify-center p-6 md:w-1/2">
              <img
                alt={asset.name}
                className="h-auto w-full rounded-lg object-cover"
                src={asset.image}
              />
            </div>

            {/* Right Section - Scrollable Content */}
            <div className="flex flex-col justify-between space-y-6 p-6 md:w-1/2">
              <ModalHeader
                index={asset.index}
                onNext={onNext}
                onPrev={onPrev}
              />
              <Info asset={asset} collection={collection} />
            </div>
          </div>

          {/* Scrollable Additional Sections */}
          <div className="flex gap-6 px-6 pb-6">
            {/* Attributes Section */}
            <div className="hidden md:block md:w-1/3">
              <Attributes attributes={asset.attributes?.attributes} />
            </div>

            {/* Details Tabs */}
            <div className="w-full">
              <DetailsTabs asset={asset} collection={collection} />
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal
        asset={asset}
        chain={collection.chain}
        isVisible={isPurchaseModalVisible}
        onClose={closePurchaseModal}
      />
    </div>
  );
};

export default AssetDetailModal;
