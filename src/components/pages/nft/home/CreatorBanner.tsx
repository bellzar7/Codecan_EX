import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useDashboardStore } from "@/stores/dashboard";

const NEXT_PUBLIC_SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME;
const CreatorBanner: React.FC = () => {
  const { isDark } = useDashboardStore();
  const bannerImage = isDark
    ? "/img/nft/creator.webp"
    : "/img/nft/creator_light.webp";

  return (
    <div className="relative z-0 mb-32 w-full px-16 py-12">
      {/* Right Glow Gradient */}
      <div className="absolute top-[-100px] right-[-400px] z-[-1] hidden h-[400px] w-[700px] rounded-full opacity-50 blur-[60px] [transform:translate3d(0,0,0)] md:block dark:opacity-100">
        <div className="h-full w-full rotate-[-30deg] bg-linear-to-l from-green-400 via-green-400/[0.5] to-transparent" />
      </div>

      {/* Left Glow Gradient (Positioned Below) */}
      <div className="absolute top-[150px] left-[-400px] z-[-1] h-[400px] w-[800px] rounded-full opacity-50 blur-[60px] [transform:translate3d(0,0,0)] dark:opacity-100">
        <div className="h-full w-full rotate-[30deg] bg-linear-to-r from-teal-400 via-teal-400/[0.5] to-transparent" />
      </div>

      {/* Content */}
      <div className="z-9 flex flex-col items-center justify-between gap-10 rounded-xl bg-purple-200 p-4 lg:flex-row dark:bg-black">
        {/* Image Section */}
        <div className="w-full overflow-hidden rounded-2xl bg-purple-300 lg:w-1/2 dark:bg-transparent">
          <div className="relative h-[300px] w-full overflow-hidden rounded-2xl md:h-[400px]">
            <Image
              alt="Create Unique Collection"
              className="rounded-2xl"
              fill
              src={bannerImage}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="w-full space-y-6 text-center lg:w-1/2 lg:text-left">
          <h2 className="font-extrabold text-4xl text-black md:text-5xl dark:text-white">
            Create your unique Collection
          </h2>
          <p className="text-lg text-muted-700 md:text-xl dark:text-muted-300">
            Create your unique NFT collection on {NEXT_PUBLIC_SITE_NAME}:
            unleash your creativity now
          </p>
          <Link
            className="inline-flex items-center rounded-md bg-lime-500 px-6 py-3 font-semibold text-lg text-white transition duration-300 ease-in-out hover:bg-lime-600 dark:text-black"
            href="/create"
            passHref
          >
            Create Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatorBanner;
