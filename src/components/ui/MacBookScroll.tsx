"use client";
import { Icon } from "@iconify/react";
import {
  type MotionValue,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MashImage } from "@/components/elements/MashImage";
import { cn } from "@/utils/cn";
export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
}: {
  src?: string;
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (window && window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);
  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1 : 1.5]
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.6, isMobile ? 1 : 1.5]
  );
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  return (
    <div
      className="flex min-h-[100vh] shrink-0 scale-[0.55] transform flex-col items-center justify-start py-0 [perspective:640px] sm:scale-50 md:min-h-[175vh] md:scale-100 md:pt-48 md:pb-20"
      ref={ref}
    >
      <motion.h2
        className="mb-20 text-center font-bold text-3xl text-neutral-800 dark:text-white"
        style={{
          translateY: textTransform,
          opacity: textOpacity,
        }}
      >
        {title || (
          <span>
            {t("This Macbook is built with Tailwindcss.")}
            <br />
            {t("No kidding.")}
          </span>
        )}
      </motion.h2>
      {/* Lid */}
      <Lid
        rotate={rotate}
        scaleX={scaleX}
        scaleY={scaleY}
        src={src}
        translate={translate}
      />
      {/* Base area */}
      <div className="relative -z-10 h-[17.6rem] w-[25.6rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]">
        {/* above keyboard bar */}
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>
        <div className="relative flex">
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
          <div className="mx-auto h-full w-[80%]">
            <Keypad />
          </div>
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
        </div>
        <Trackpad />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-xl rounded-tr-3xl bg-linear-to-t from-[#272729] to-[#050505]" />
        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-linear-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
        )}
        {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
      </div>
    </div>
  );
};
export const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
}: {
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotate: MotionValue<number>;
  translate: MotionValue<number>;
  src?: string;
}) => {
  return (
    <div className="relative [perspective:640px]">
      <div
        className="relative h-[9.6rem] w-[25.6rem] rounded-2xl bg-gray-950 p-2 dark:bg-muted-900"
        style={{
          transform: "perspective(640px) rotateX(-25deg) translateZ(0px)",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        }}
      />
      <motion.div
        className="absolute inset-0 h-[17.6rem] w-[25.6rem] rounded-2xl bg-gray-950 p-2 dark:bg-muted-900"
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: "preserve-3d",
          transformOrigin: "top",
        }}
      >
        <div className="absolute inset-0 rounded-lg bg-[#272729]" />
        <MashImage
          alt="aceternity logo"
          className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
          fill
          src={src as string}
        />
      </motion.div>
    </div>
  );
};
export const Trackpad = () => {
  return (
    <div
      className="mx-auto my-1 h-[5.12rem] w-[32%] rounded-xl"
      style={{
        boxShadow: "0px 0px 1px 1px #00000020 inset",
      }}
    />
  );
};
export const Keypad = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-1 h-full rounded-md bg-[#050505] p-1">
      {/* First Row */}
      <Row>
        <KBtn
          childrenClassName="items-start"
          className="w-10 items-end justify-start pb-[1.8px] pl-[3.2px]"
        >
          {t("esc")}
        </KBtn>
        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:sun-low" />
          <span className="mt-1 inline-block">F1</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:sun" />
          <span className="mt-1 inline-block">F2</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:table" />
          <span className="mt-1 inline-block">F3</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:search" />
          <span className="mt-1 inline-block">F4</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:microphone" />
          <span className="mt-1 inline-block">F5</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:moon" />
          <span className="mt-1 inline-block">F6</span>
        </KBtn>

        <KBtn>
          <Icon
            className="h-[4.8px] w-[4.8px]"
            icon="tabler:player-track-prev"
          />
          <span className="mt-1 inline-block">F7</span>
        </KBtn>

        <KBtn>
          <Icon
            className="h-[4.8px] w-[4.8px]"
            icon="tabler:player-skip-forward"
          />
          <span className="mt-1 inline-block">F8</span>
        </KBtn>

        <KBtn>
          <Icon
            className="h-[4.8px] w-[4.8px]"
            icon="tabler:player-track-next"
          />
          <span className="mt-1 inline-block">F8</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:volume-3" />
          <span className="mt-1 inline-block">F10</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:volume-2" />
          <span className="mt-1 inline-block">F11</span>
        </KBtn>

        <KBtn>
          <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:volume" />
          <span className="mt-1 inline-block">F12</span>
        </KBtn>
        <KBtn>
          <div className="h-4 w-4 rounded-full bg-linear-to-b from-20% from-neutral-900 via-50% via-black to-95% to-neutral-900 p-px">
            <div className="h-full w-full rounded-full bg-black" />
          </div>
        </KBtn>
      </Row>

      {/* Second row */}
      <Row>
        <KBtn>
          <span className="block">~</span>
          <span className="mt-1 block">`</span>
        </KBtn>

        <KBtn>
          <span className="block">!</span>
          <span className="block">1</span>
        </KBtn>
        <KBtn>
          <span className="block">@</span>
          <span className="block">2</span>
        </KBtn>
        <KBtn>
          <span className="block">#</span>
          <span className="block">3</span>
        </KBtn>
        <KBtn>
          <span className="block">$</span>
          <span className="block">4</span>
        </KBtn>
        <KBtn>
          <span className="block">%</span>
          <span className="block">5</span>
        </KBtn>
        <KBtn>
          <span className="block">^</span>
          <span className="block">6</span>
        </KBtn>
        <KBtn>
          <span className="block">&</span>
          <span className="block">7</span>
        </KBtn>
        <KBtn>
          <span className="block">*</span>
          <span className="block">8</span>
        </KBtn>
        <KBtn>
          <span className="block">(</span>
          <span className="block">9</span>
        </KBtn>
        <KBtn>
          <span className="block">)</span>
          <span className="block">0</span>
        </KBtn>
        <KBtn>
          <span className="block">-</span>
          <span className="block">_</span>
        </KBtn>
        <KBtn>
          <span className="block">+</span>
          <span className="block"> = </span>
        </KBtn>
        <KBtn
          childrenClassName="items-end"
          className="w-10 items-end justify-end pr-[3.2px] pb-[1.8px]"
        >
          {t("delete")}
        </KBtn>
      </Row>

      {/* Third row */}
      <Row>
        <KBtn
          childrenClassName="items-start"
          className="w-10 items-end justify-start pb-[1.8px] pl-[3.2px]"
        >
          {t("tab")}
        </KBtn>
        <KBtn>
          <span className="block">Q</span>
        </KBtn>

        <KBtn>
          <span className="block">W</span>
        </KBtn>
        <KBtn>
          <span className="block">E</span>
        </KBtn>
        <KBtn>
          <span className="block">R</span>
        </KBtn>
        <KBtn>
          <span className="block">T</span>
        </KBtn>
        <KBtn>
          <span className="block">Y</span>
        </KBtn>
        <KBtn>
          <span className="block">U</span>
        </KBtn>
        <KBtn>
          <span className="block">I</span>
        </KBtn>
        <KBtn>
          <span className="block">O</span>
        </KBtn>
        <KBtn>
          <span className="block">P</span>
        </KBtn>
        <KBtn>
          <span className="block">{"{"}</span>
          <span className="block">{"["}</span>
        </KBtn>
        <KBtn>
          <span className="block">{"}"}</span>
          <span className="block">{"]"}</span>
        </KBtn>
        <KBtn>
          <span className="block">{"|"}</span>
          <span className="block">{"\\"}</span>
        </KBtn>
      </Row>

      {/* Fourth Row */}
      <Row>
        <KBtn
          childrenClassName="items-start"
          className="w-[2.24rem] items-end justify-start pb-[1.8px] pl-[3.2px]"
        >
          {t("caps lock")}
        </KBtn>
        <KBtn>
          <span className="block">A</span>
        </KBtn>

        <KBtn>
          <span className="block">S</span>
        </KBtn>
        <KBtn>
          <span className="block">D</span>
        </KBtn>
        <KBtn>
          <span className="block">F</span>
        </KBtn>
        <KBtn>
          <span className="block">G</span>
        </KBtn>
        <KBtn>
          <span className="block">H</span>
        </KBtn>
        <KBtn>
          <span className="block">J</span>
        </KBtn>
        <KBtn>
          <span className="block">K</span>
        </KBtn>
        <KBtn>
          <span className="block">L</span>
        </KBtn>
        <KBtn>
          <span className="block">{":"}</span>
          <span className="block">{";"}</span>
        </KBtn>
        <KBtn>
          <span className="block">{`"`}</span>
          <span className="block">{`'`}</span>
        </KBtn>
        <KBtn
          childrenClassName="items-end"
          className="w-[2.28rem] items-end justify-end pr-[3.2px] pb-[1.8px]"
        >
          {t("return")}
        </KBtn>
      </Row>

      {/* Fifth Row */}
      <Row>
        <KBtn
          childrenClassName="items-start"
          className="w-[2.92rem] items-end justify-start pb-[1.8px] pl-[3.2px]"
        >
          {t("shift")}
        </KBtn>
        <KBtn>
          <span className="block">Z</span>
        </KBtn>
        <KBtn>
          <span className="block">X</span>
        </KBtn>
        <KBtn>
          <span className="block">C</span>
        </KBtn>
        <KBtn>
          <span className="block">V</span>
        </KBtn>
        <KBtn>
          <span className="block">B</span>
        </KBtn>
        <KBtn>
          <span className="block">N</span>
        </KBtn>
        <KBtn>
          <span className="block">M</span>
        </KBtn>
        <KBtn>
          <span className="block">{"<"}</span>
          <span className="block">{","}</span>
        </KBtn>
        <KBtn>
          <span className="block">{">"}</span>
          <span className="block">{"."}</span>
        </KBtn>{" "}
        <KBtn>
          <span className="block">{"?"}</span>
          <span className="block">{"/"}</span>
        </KBtn>
        <KBtn
          childrenClassName="items-end"
          className="w-[2.92rem] items-end justify-end pr-[3.2px] pb-[1.8px]"
        >
          {t("shift")}
        </KBtn>
      </Row>

      {/* sixth Row */}
      <Row>
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className=""
        >
          <div className="flex w-full justify-end pr-1">
            <span className="block">fn</span>
          </div>
          <div className="flex w-full justify-start pl-1">
            <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:world" />
          </div>
        </KBtn>
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className=""
        >
          <div className="flex w-full justify-end pr-1">
            <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:chevron-up" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{t("control")}</span>
          </div>
        </KBtn>
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className=""
        >
          <div className="flex w-full justify-end pr-1">
            <OptionKey className="h-[4.8px] w-[4.8px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{t("option")}</span>
          </div>
        </KBtn>
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className="w-8"
        >
          <div className="flex w-full justify-end pr-1">
            <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:command" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{t("command")}</span>
          </div>
        </KBtn>
        <KBtn className="w-[6.56rem]" />
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className="w-8"
        >
          <div className="flex w-full justify-start pl-1">
            <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:command" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{t("command")}</span>
          </div>
        </KBtn>
        <KBtn
          childrenClassName="h-full justify-between py-[3.2px]"
          className=""
        >
          <div className="flex w-full justify-start pl-1">
            <OptionKey className="h-[4.8px] w-[4.8px]" />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{t("option")}</span>
          </div>
        </KBtn>
        <div className="mt-[1.8px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[3.2px] p-[0.4px]">
          <KBtn className="h-3 w-6">
            <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:caret-up" />
          </KBtn>
          <div className="flex">
            <KBtn className="h-3 w-6">
              <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:caret-left" />
            </KBtn>
            <KBtn className="h-3 w-6">
              <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:caret-down" />
            </KBtn>
            <KBtn className="h-3 w-6">
              <Icon className="h-[4.8px] w-[4.8px]" icon="tabler:caret-right" />
            </KBtn>
          </div>
        </div>
      </Row>
    </div>
  );
};
export const KBtn = ({
  className,
  children,
  childrenClassName,
  backlit = true,
}: {
  className?: string;
  children?: React.ReactNode;
  childrenClassName?: string;
  backlit?: boolean;
}) => {
  return (
    <div
      className={cn(
        "rounded-[3.2px] p-[0.4px]",
        backlit && "bg-white/[0.2] shadow-white shadow-xl"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]",
          className
        )}
        style={{
          boxShadow:
            "0px -0.4px 2px 0 #0D0D0F inset, -0.4px 0px 2px 0 #0D0D0F inset",
        }}
      >
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center text-[4px] text-neutral-200",
            childrenClassName,
            backlit && "text-white"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
export const Row = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-[1.8px] flex w-full shrink-0 gap-[1.8px]">
      {children}
    </div>
  );
};
export const SpeakerGrid = () => {
  return (
    <div
      className="mt-2 flex h-40 gap-[1.8px] px-[0.4px]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #08080A 0.4px, transparent 0.4px)",
        backgroundSize: "2.4px 2.4px",
      }}
    />
  );
};
export const OptionKey = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      fill="none"
      id="icon"
      version="1.1"
      viewBox="0 0 25.6 25.6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="2"
        stroke="currentColor"
        strokeWidth={2}
        width="10"
        x="18"
        y="5"
      />
      <polygon
        points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect
        className="st0"
        height="25.6"
        id="_Transparent_Rectangle_"
        stroke="none"
        width="25.6"
      />
    </svg>
  );
};
