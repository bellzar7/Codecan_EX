import type { GetServerSideProps } from "next";
import type React from "react";
import { useEffect } from "react";
import BannerSection from "@/components/pages/nft/collection/BannerSection";
import Links from "@/components/pages/nft/collection/elements/Links";
import InfoSection from "@/components/pages/nft/collection/InfoSection";
import Tabs from "@/components/pages/nft/collection/Tabs";
import AssetDetailModal from "@/components/pages/nft/modals/AssetDetailModal";
import Layout from "@/layouts/Nav";
import { useNftStore } from "@/stores/nft";
import { $serverFetch } from "@/utils/api";

interface CollectionProps {
  initialCollection: any;
}

const CollectionPage: React.FC<CollectionProps> = ({ initialCollection }) => {
  // Zustand Store Actions and State
  const {
    collection,
    setCollection,
    selectedAssetIndex,
    closeModal,
    goToPrevAsset,
    goToNextAsset,
    assets,
  } = useNftStore();

  // Set the initial collection data from server-side props
  useEffect(() => {
    if (initialCollection) {
      setCollection(initialCollection);
    }
  }, [initialCollection, setCollection]);

  return (
    <Layout color="muted" horizontal>
      {collection ? (
        <div className="w-full">
          {/* Banner Section */}
          <BannerSection />

          {/* Social Links and Buttons */}
          <Links />

          {/* Collection Info Section */}
          <InfoSection />

          {/* Collection Tabs */}
          <Tabs />

          {/* Asset Modal */}
          {selectedAssetIndex !== null && (
            <AssetDetailModal
              asset={assets[selectedAssetIndex]}
              isVisible={selectedAssetIndex !== null}
              onClose={closeModal}
              onNext={goToNextAsset}
              onPrev={goToPrevAsset}
            />
          )}
        </div>
      ) : (
        <p className="text-center font-semibold text-lg">Loading...</p>
      )}
    </Layout>
  );
};

export default CollectionPage;

// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const collectionResponse = await $serverFetch(context, {
      url: `/api/ext/nft/collection/${id}`,
    });

    return {
      props: {
        initialCollection: collectionResponse.data || null,
      },
    };
  } catch (error) {
    console.error("Error fetching collection data:", error);
    return {
      props: {
        initialCollection: null,
      },
    };
  }
};
