import { Icon } from "@iconify/react";
import { useSwiper } from "swiper/react";

export default function SwiperNavigation() {
  const swiper = useSwiper();

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center justify-between">
      <button
        className="relative z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-s-lg border border-muted-200 bg-white text-muted-500 transition-colors duration-300 ease-in-out active:enabled:bg-muted-50 hover:enabled:bg-muted-100 hover:enabled:text-muted-700 dark:border-muted-800 dark:bg-muted-950 dark:active:enabled:bg-muted-800 dark:hover:enabled:bg-muted-900 dark:hover:enabled:text-muted-100"
        onClick={() => swiper.slidePrev()}
        type="button"
      >
        <Icon className="h-4 w-4" icon="lucide:arrow-left" />
      </button>
      <button
        className="relative z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-e-lg border border-muted-200 bg-white text-muted-500 transition-colors duration-300 ease-in-out active:enabled:bg-muted-50 hover:enabled:bg-muted-100 hover:enabled:text-muted-700 dark:border-muted-800 dark:bg-muted-950 dark:active:enabled:bg-muted-800 dark:hover:enabled:bg-muted-900 dark:hover:enabled:text-muted-100"
        onClick={() => swiper.slideNext()}
        type="button"
      >
        <Icon className="h-4 w-4" icon="lucide:arrow-right" />
      </button>
    </div>
  );
}
