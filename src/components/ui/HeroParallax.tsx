"use client";
import {
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import React from "react";
import { MashImage } from "@/components/elements/MashImage";

export const HeroParallax = ({
  title,
  description,
  items,
}: {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  items: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const rows = Math.ceil(items.length / 5);
  const firstRow = items.slice(0, 5);
  const secondRow = items.slice(5, 10);
  const thirdRow = items.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      className={`h-[${
        rows * 100
      }vh] relative flex flex-col self-auto overflow-hidden py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]`}
      ref={ref}
    >
      <Header description={description} title={title} />
      <motion.div
        className=""
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {firstRow.map((item) => (
            <ItemCard item={item} key={item.title} translate={translateX} />
          ))}
        </motion.div>
        <motion.div className="mb-20 flex flex-row space-x-20">
          {secondRow.map((item) => (
            <ItemCard
              item={item}
              key={item.title}
              translate={translateXReverse}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
          {thirdRow.map((item) => (
            <ItemCard item={item} key={item.title} translate={translateX} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = ({
  title,
  description,
}: {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
}) => {
  return (
    <div className="relative top-0 left-0 mx-auto w-full max-w-7xl px-4 py-20 md:py-40">
      <h1 className="font-bold text-2xl md:text-7xl dark:text-white">
        {title}
      </h1>
      <p className="mt-8 max-w-2xl text-base md:text-xl dark:text-neutral-200">
        {description}
      </p>
    </div>
  );
};

export const ItemCard = ({
  item,
  translate,
}: {
  item: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      className="group/item relative h-96 w-[30rem] shrink-0"
      key={item.title}
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
    >
      <Link className="block group-hover/item:shadow-2xl" href={item.link}>
        <MashImage
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover object-left-top"
          height={600}
          src={item.thumbnail}
          width={600}
        />
      </Link>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/item:opacity-80" />
      <h2 className="absolute bottom-4 left-4 text-white opacity-0 group-hover/item:opacity-100">
        {item.title}
      </h2>
    </motion.div>
  );
};
