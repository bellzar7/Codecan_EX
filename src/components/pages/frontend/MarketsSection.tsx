import TrendingMarkets from "../user/markets/TrendingMarkets";

const MarketsSection = () => {
  return (
    <section className="relative mx-auto w-full bg-dot-black/[0.1] bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 dark:bg-black dark:bg-dot-white/[0.1]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black" />

      <div className="relative mx-auto max-w-7xl px-0 pt-6 lg:pt-0">
        <TrendingMarkets />
      </div>
    </section>
  );
};

export default MarketsSection;
