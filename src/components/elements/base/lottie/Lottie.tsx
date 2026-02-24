import { DotLottiePlayer } from "@dotlottie/react-player";
import { memo } from "react";
import type { LottieProps } from "./Lottie.types";
import "@dotlottie/react-player/dist/index.css";
import { useDashboardStore } from "@/stores/dashboard";

const LottieBase = ({
  category,
  path,
  height,
  width,
  classNames,
  max,
}: LottieProps) => {
  const { settings } = useDashboardStore();
  const styles = {
    height,
    width,
  };

  const randomUrl = `/img/lottie/${category ? `${category}/` : ""}${path}${
    max ? `-${Math.floor(Math.random() * max) + 1}` : ""
  }.lottie`;

  if (settings?.lottieAnimationStatus !== "true") return null;

  return (
    <div>
      <DotLottiePlayer
        autoplay
        className={`${classNames}`}
        loop
        src={randomUrl}
        style={styles}
      />
    </div>
  );
};

export const Lottie = memo(LottieBase);
