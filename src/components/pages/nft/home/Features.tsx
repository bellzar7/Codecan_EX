import { Icon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import { Hexagon } from "react-feather";

const NEXT_PUBLIC_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;
const Feature: React.FC = () => {
  return (
    <div className="relative z-10 px-16 py-8">
      <div className="mb-12 grid grid-cols-1 text-center">
        <h3 className="mb-4 font-semibold text-2xl text-muted-900 leading-snug md:text-3xl md:leading-snug dark:text-muted-100">
          Why Choose Us?
        </h3>
        <p className="mx-auto max-w-xl text-muted-400">
          We are a huge marketplace dedicated to connecting great artists of all
          kinds with collectors and buyers. We are a platform that allows you to
          create, collect, and sell your NFTs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          description={`Create your unique NFT collection on ${NEXT_PUBLIC_SITE_NAME}: unleash your creativity now`}
          icon={<Icon icon="mdi:sitemap" />}
          title="Create Item"
        />
        <FeatureCard
          description="Collect your favorite items now! Trade Now and Explore Collections"
          icon={<Icon icon="mdi:layers-outline" />}
          title="Collect"
        />
        <FeatureCard
          description="Sell your NFTs on our platform and earn money. We provide a secure and easy way to sell your NFTs."
          icon={<Icon icon="mdi:camera-plus-outline" />}
          title="Sell Item"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
}) => (
  <div className="group relative overflow-hidden rounded-xl border border-muted-200 bg-white p-12 text-center transition-all duration-300 ease-in-out hover:shadow-lg dark:border-muted-900 dark:bg-muted-900 dark:shadow-muted-700">
    <div className="relative -m-3 mb-6 flex justify-center overflow-hidden text-transparent">
      <Hexagon className="size-28 rotate-[30deg] fill-violet-600/5 dark:fill-violet-500/5" />
      <div className="absolute inset-0 flex items-center justify-center text-5xl text-violet-600 dark:text-violet-500">
        {icon}
      </div>
    </div>

    <div className="mt-4">
      <Link
        className="font-semibold text-lg text-muted-800 transition-colors duration-300 hover:text-violet-600 dark:text-muted-100 dark:hover:text-violet-500"
        href="#"
      >
        {title}
      </Link>
      <p className="mt-2 text-muted-500 dark:text-muted-400">{description}</p>
    </div>
  </div>
);

export default Feature;
