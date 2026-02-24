import { useEditor } from "@craftjs/core";
import { Icon } from "@iconify/react";
import copy from "copy-to-clipboard";
import lz from "lzutf8";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Textarea from "@/components/elements/form/textarea/Textarea";
import Logo from "@/components/vector/Logo";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import useBuilderStore from "@/stores/admin/builder";
import { cn } from "@/utils/cn";
import BuilderMenu from "./Sidebar/BuilderMenu";
import BuilderSidebarIcon from "./Sidebar/BuilderSidebarIcon";

export const Viewport: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { saveEditorState } = useBuilderStore();
  const { enabled, connectors, canUndo, canRedo, actions, query } = useEditor(
    (state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
    })
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [stateToLoad, setStateToLoad] = useState("");

  useEffect(() => {
    if (!window) {
      return;
    }
    window.requestAnimationFrame(() => {
      window.parent.postMessage({ LANDING_PAGE_LOADED: true }, "*");
      setTimeout(() => {
        actions.setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [actions.setOptions]);

  useEffect(() => {
    if (containerRef.current) {
      connectors.select(connectors.hover(containerRef.current, ""), "");
    }
  }, [connectors]);

  const handleSave = async () => {
    const json = query.serialize();
    const content = lz.encodeBase64(lz.compress(json));
    saveEditorState(content);
  };

  const handleCopyState = () => {
    const json = query.serialize();
    copy(lz.encodeBase64(lz.compress(json)));
    toast.success("State copied to clipboard");
  };

  const handleLoadState = () => {
    if (stateToLoad.trim()) {
      try {
        const json = lz.decompress(lz.decodeBase64(stateToLoad));
        actions.deserialize(json);
        toast.success("State loaded successfully");
      } catch (_error) {
        toast.error("Failed to load state");
      }
    } else {
      toast.error("Please paste a valid state to load");
    }
  };

  return (
    <div
      className={"viewport fixed flex h-full w-full flex-col overflow-hidden"}
    >
      <nav
        className={
          "fixed top-0 left-0 z-50 h-full w-20 overflow-visible border border-muted-200 bg-white transition-all duration-300 lg:translate-x-0 dark:border-muted-800 dark:bg-muted-950"
        }
      >
        <div className="z-50 flex h-full flex-col justify-between">
          <ul>
            <li className="relative mb-2 flex h-20 w-full items-center justify-center">
              <Link
                className="relative mt-2 flex h-10 w-10 items-center justify-center text-sm no-underline transition-all duration-100 ease-linear"
                href="/"
              >
                <Logo className="-mt-[5px] h-7 w-7 text-primary-500 transition-opacity duration-300 hover:opacity-80" />
              </Link>
            </li>
            {/* <BuilderSidebarIcon
              icon="solar:add-square-bold-duotone"
              name="ELEMENTS"
            /> */}
            <BuilderSidebarIcon
              icon="solar:layers-bold-duotone"
              name="BLOCKS"
            />
          </ul>
          <div className="my-3 mt-auto flex w-full flex-col items-center gap-4">
            <div
              className="side-icon-inner mask mask-blob group flex h-[35px] w-[35px] cursor-pointer items-center justify-center bg-muted-200 transition-colors duration-300 hover:bg-muted-500/10 dark:bg-muted-800 dark:hover:bg-muted-500/20"
              onClick={() => {
                router.push("/admin/dashboard");
              }}
            >
              <Icon
                className="relative h-7 w-7 text-muted-400 transition-colors duration-300 group-hover/side-icon:text-muted-500 group-hover:text-primary-500 hover:group-dark:text-primary-500"
                icon={"mdi:chevron-left"}
              />
            </div>
            <div className="side-icon-inner mask mask-blob group flex h-[35px] w-[35px] cursor-pointer items-center justify-center bg-muted-200 transition-colors duration-300 hover:bg-muted-500/10 dark:bg-muted-800 dark:hover:bg-muted-500/20">
              <ThemeSwitcher />
            </div>
            <Tooltip content="View" position="end">
              <div
                className="side-icon-inner mask mask-blob group flex h-[35px] w-[35px] cursor-pointer items-center justify-center bg-muted-200 transition-colors duration-300 hover:bg-muted-500/10 dark:bg-muted-800 dark:hover:bg-muted-500/20"
                onClick={() => {
                  actions.setOptions((options) => (options.enabled = !enabled));
                }}
              >
                <Icon
                  className="relative h-7 w-7 text-muted-400 transition-colors duration-300 group-hover/side-icon:text-muted-500 group-hover:text-primary-500 hover:group-dark:text-primary-500"
                  icon={
                    enabled
                      ? "solar:eye-bold-duotone"
                      : "solar:pen-2-bold-duotone"
                  }
                />
              </div>
            </Tooltip>
            <Tooltip content="Save" position="end">
              <div
                className="side-icon-inner mask mask-blob group flex h-[35px] w-[35px] cursor-pointer items-center justify-center bg-muted-200 transition-colors duration-300 hover:bg-muted-500/10 dark:bg-muted-800 dark:hover:bg-muted-500/20"
                onClick={() => {
                  handleSave();
                }}
              >
                <Icon
                  className="relative h-7 w-7 text-muted-400 transition-colors duration-300 group-hover/side-icon:text-muted-500 group-hover:text-primary-500 hover:group-dark:text-primary-500"
                  icon={"solar:check-read-line-duotone"}
                />
              </div>
            </Tooltip>
            <Tooltip content="Import/Export" position="end">
              <div
                className="side-icon-inner mask mask-blob group flex h-[35px] w-[35px] cursor-pointer items-center justify-center bg-muted-200 transition-colors duration-300 hover:bg-muted-500/10 dark:bg-muted-800 dark:hover:bg-muted-500/20"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Icon
                  className="relative h-7 w-7 text-muted-400 transition-colors duration-300 group-hover/side-icon:text-muted-500 group-hover:text-primary-500 hover:group-dark:text-primary-500"
                  icon="solar:cloud-upload-line-duotone"
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </nav>
      <div className="flex h-full w-full flex-1 bg-muted-100 dark:bg-muted-900">
        <div className="z-12 ms-20 h-full">
          <BuilderMenu />
        </div>
        <div className="page-container relative h-full flex-1 transition-all duration-300">
          <div
            className={cn([
              "craftjs-renderer slimscroll h-full w-full flex-1 overflow-auto px-8 pb-8 transition",
              { "bg-muted-100 dark:bg-muted-800": enabled },
            ])}
            ref={(ref) => {
              connectors.select(connectors.hover(ref as HTMLElement, ""), "");
            }}
          >
            <div className="relative flex flex-col items-center pt-8">
              {children}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 z-20">
            <div className="flex gap-2 rounded-tl-md border-muted-300 border-s border-t bg-white px-2 pt-[5px] pb-[2px] dark:border-muted-700 dark:bg-muted-800">
              <Tooltip content="Undo" position="bottom">
                <IconButton
                  className={cn({
                    "cursor-not-allowed opacity-50": !canUndo,
                  })}
                  color={"muted"}
                  onClick={() => actions.history.undo()}
                  shape={"rounded-sm"}
                  size={"sm"}
                  variant={"solid"}
                >
                  <Icon
                    className="h-6 w-6 text-muted-800 dark:text-muted-200"
                    icon="solar:undo-left-line-duotone"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip content="Redo" position="bottom">
                <IconButton
                  className={cn({
                    "cursor-not-allowed opacity-50": !canRedo,
                  })}
                  color={"muted"}
                  onClick={() => actions.history.redo()}
                  shape={"rounded-sm"}
                  size={"sm"}
                  variant={"solid"}
                >
                  <Icon
                    className="h-6 w-6 text-muted-800 dark:text-muted-200"
                    icon="solar:undo-right-line-duotone"
                  />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Import/Export Modal */}
      <Modal open={open} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              Import/Export State
            </p>
            <IconButton
              onClick={() => {
                setOpen(false);
              }}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4 dark:text-white" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:px-6 md:py-8">
            <div className="mx-auto w-full max-w-xs">
              <Textarea
                label="Paste the compressed state here"
                onChange={(e) => setStateToLoad(e.target.value)}
                placeholder="Paste here"
                rows={5}
                value={stateToLoad}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={handleLoadState} shape="smooth">
                Import
              </Button>
              <Button
                onClick={handleCopyState}
                shape="smooth"
                variant="outlined"
              >
                Export
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </div>
  );
};

export default Viewport;
