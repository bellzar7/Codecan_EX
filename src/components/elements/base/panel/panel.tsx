import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import pluralize from "pluralize";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import useWindowSize from "@/hooks/useWindowSize";
import { panelVariants } from "@/utils/animations";
import { arrowMap, positioningClass } from "@/utils/constants";
import type { PanelProps } from "./panel.types";
import { ResizeHandler } from "./ResizeHandler";

const PanelBase = ({
  isOpen,
  side = "right",
  size = "md",
  backdrop = true,
  title = "",
  children,
  tableName,
  onClose,
}: PanelProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof document !== "undefined") {
      const portalRoot = document.getElementById("portal-root");
      setPortalRoot(portalRoot);
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const [panelOpacity, setPanelOpacity] = useState(100);
  const [backdropBlur, setBackdropBlur] = useState(0); // New state for backdrop blur
  const [hoverState, setHoverState] = useState(false);

  const updatePanelOpacityAndBlur = useCallback((percentage) => {
    setPanelOpacity(percentage);
    setBackdropBlur((percentage / 100) * 5);
  }, []);

  const sizeMap = useMemo(
    () => ({
      sm: 240,
      md: 340,
      lg: 440,
      xl: 540,
      "2xl": 640,
      "3xl": 740,
    }),
    []
  );

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [panelWidth, setPanelWidth] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (windowWidth > 0 && windowHeight > 0) {
      setPanelWidth(
        windowWidth > 720
          ? sizeMap[size]
          : windowWidth <= 640
            ? windowWidth
            : windowWidth * 0.8
      );

      setPanelHeight(
        windowHeight > 720
          ? sizeMap[size]
          : windowHeight <= 640
            ? windowHeight
            : windowHeight * 0.8
      );
    }
  }, [windowWidth, windowHeight, size, sizeMap]);

  const panelStyle = useMemo(
    () => ({
      width: ["top", "bottom"].includes(side) ? "100%" : `${panelWidth}px`,
      height: ["left", "right"].includes(side) ? "100%" : `${panelHeight}px`,
    }),
    [side, panelWidth, panelHeight]
  );

  const divStyle = useMemo(() => {
    return {
      opacity: `${panelOpacity}%`,
    };
  }, [panelOpacity]);

  const backdropStyle = useMemo(() => {
    return {
      backdropFilter: `blur-sm(${backdropBlur}px)`,
    };
  }, [backdropBlur]);

  const sideRadiusMap = useMemo(
    () => ({
      top: panelHeight === windowHeight ? "" : "rounded-b-2xl",
      right: panelWidth === windowWidth ? "" : "rounded-l-xl",
      bottom: panelHeight === windowHeight ? "" : "rounded-t-2xl",
      left: panelWidth === windowWidth ? "" : "rounded-r-xl",
    }),
    [panelHeight, windowHeight, panelWidth, windowWidth]
  );

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={"fixed inset-0 z-50"} style={divStyle}>
          {backdrop && (
            <motion.div
              animate="visible"
              className="fixed inset-0 bg-black bg-opacity-75"
              exit="hidden"
              initial="hidden"
              onClick={onClose}
              style={backdropStyle}
              variants={panelVariants(side).backdrop}
            />
          )}
          <motion.div
            animate="visible"
            className={`fixed ${positioningClass[side]} border-muted-200 bg-white shadow-lg dark:border-muted-700 dark:bg-muted-850 ${sideRadiusMap[side]}`}
            exit="hidden"
            initial="hidden"
            style={panelStyle}
            variants={panelVariants(side).panel}
          >
            <div
              className={`flex ${
                (side === "top" || side === "bottom") && "flex-col"
              } h-full`}
            >
              {side === "right" && (
                <span
                  className={`resizer resizer-x ${
                    hoverState && "hover-effect"
                  }`}
                />
              )}
              {side === "bottom" && (
                <span
                  className={`resizer resizer-y ${
                    hoverState && "hover-effect"
                  }`}
                />
              )}
              <div className="h-full w-full">
                <div className="flex h-20 items-center justify-between px-6">
                  <h2 className="font-light font-sans text-lg text-muted-800 uppercase leading-tight tracking-wide dark:text-white">
                    {`${title} ${
                      tableName ? pluralize.singular(tableName) : ""
                    }` || "Panel"}
                  </h2>
                  <button
                    className="mask mask-blob flex h-10 w-10 cursor-pointer items-center justify-center bg-muted-100 text-muted-400 hover:bg-muted-200 hover:text-muted-500 dark:bg-muted-850 dark:text-white dark:hover:bg-muted-950"
                    onClick={onClose}
                  >
                    <Icon icon={`lucide:arrow-${arrowMap[side]}`} />
                  </button>
                </div>
                <div className="h-[calc(100%-5rem)] overflow-y-auto px-6 py-2">
                  {children}
                </div>
              </div>
              {side === "left" && (
                <span
                  className={`resizer resizer-x -m-4 ${
                    hoverState && "hover-effect"
                  }`}
                />
              )}
              {side === "top" && (
                <span
                  className={`resizer resizer-y -m-4 ${
                    hoverState && "hover-effect"
                  }`}
                />
              )}
            </div>
            <ResizeHandler
              onClose={onClose}
              panelHeight={panelHeight}
              panelWidth={panelWidth}
              setHoverState={setHoverState}
              setPanelHeight={setPanelHeight}
              setPanelWidth={setPanelWidth}
              side={side}
              size={size}
              sizeMap={sizeMap} // Updated callback
              updatePanelOpacity={updatePanelOpacityAndBlur}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return isMounted && portalRoot
    ? ReactDOM.createPortal(panelContent, portalRoot)
    : null;
};

export const Panel = PanelBase;
