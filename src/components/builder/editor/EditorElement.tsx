import { useEditor, useNode } from "@craftjs/core";
import { Icon } from "@iconify/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import useBuilderStore from "@/stores/admin/builder";
import ButtonDialog from "../shared/ButtonDialog";
import HashtagDialog from "../shared/HashtagDialog";
import ImageDialog from "../shared/ImageDialog";
import LinkDialog from "../shared/LinkDialog";
import SvgDialog from "../shared/SvgDialog";

interface ContainerProps {
  render: React.ReactNode;
}

const EditorElement: React.FC<ContainerProps> = ({ render }) => {
  const { id } = useNode();
  const { actions, query, isActive } = useEditor((state, query) => ({
    isActive: query.getEvent("selected").contains(id),
  }));

  const {
    node,
    data,
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
    isRootChild,
    showFocus,
  } = useNode((node) => ({
    node,
    data: node.data,
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    isRootChild: node.data.parent === "ROOT",
    showFocus: node.id !== "ROOT" && node.data.displayName !== "App",
  }));

  const currentRef = useRef<HTMLDivElement>(null);
  const { setSidebar } = useBuilderStore();

  useEffect(() => {
    if (dom) {
      // const handleClick = () => setSidebar("TOOLBAR");

      dom.classList.toggle("component-selected", isActive || isHover);
      // dom.addEventListener("click", handleClick);

      // return () => {
      //   dom.removeEventListener("click", handleClick);
      // };
    }
  }, [dom, isActive, isHover]);

  const getPos = useCallback((dom: HTMLElement | null) => {
    const rect: DOMRect = dom?.getBoundingClientRect() as DOMRect;
    const top = rect?.top + window.scrollY;
    const left = rect?.left + window.scrollX;
    return { top: `${top}px`, left: `${left}px` };
  }, []);

  const scroll = useCallback(() => {
    if (!(currentRef.current && dom)) {
      return;
    }
    const { top, left } = getPos(dom);
    currentRef.current.style.top = top;
    currentRef.current.style.left = left;
  }, [dom, getPos]);

  useEffect(() => {
    const el = document.querySelector(".craftjs-renderer");

    el?.addEventListener("scroll", scroll);

    return () => {
      el?.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

  const [openLink, setOpenLink] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const [openHash, setOpenHash] = useState(false);
  const [openSvg, setOpenSvg] = useState(false);

  const handleMouseDown = useCallback(
    (
      event: React.MouseEvent,
      setOpen: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      event.stopPropagation();
      setOpen(true);
    },
    []
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.delete(id);
  };

  return (
    <>
      {isHover || isActive
        ? ReactDOM.createPortal(
            <div
              className="just fixed flex items-center gap-1 rounded-t border-info-500 border-x border-t border-dashed px-1 py-1 text-muted-900"
              ref={currentRef}
              style={{
                left: dom ? getPos(dom).left : "0px",
                top: dom ? getPos(dom).top : "0px",
                zIndex: 9999,
                height: "24px",
                marginTop: "-23px",
                fontSize: "12px",
                lineHeight: "12px",
              }}
            >
              <h2 className="mr-4 flex-1 rounded-xs bg-muted-100 p-1">
                {name}
              </h2>
              {moveable && (
                <Tooltip content="Move" position="bottom">
                  <a
                    className="flex cursor-move items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    ref={(e) => {
                      if (e) {
                        drag(e);
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" icon="mdi:cursor-move" />
                  </a>
                </Tooltip>
              )}
              {isRootChild && (
                <Tooltip content="Hashtag" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={(e) => handleMouseDown(e, setOpenHash)}
                  >
                    <Icon className="h-4 w-4" icon="mdi:hashtag" />
                  </a>
                </Tooltip>
              )}
              {showFocus && (
                <Tooltip content="Parent" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onClick={() => {
                      actions.selectNode(data.parent ?? undefined);
                    }}
                  >
                    <Icon className="h-4 w-4" icon="mdi:arrow-up" />
                  </a>
                </Tooltip>
              )}
              {dom?.nodeName === "IMG" && (
                <Tooltip content="Image" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={(e) => handleMouseDown(e, setOpenImage)}
                  >
                    <Icon className="h-4 w-4" icon="mdi:image" />
                  </a>
                </Tooltip>
              )}
              {dom?.nodeName === "svg" && (
                <Tooltip content="SVG" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={(e) => handleMouseDown(e, setOpenSvg)}
                  >
                    <Icon className="h-4 w-4" icon="mdi:image" />
                  </a>
                </Tooltip>
              )}
              {dom?.nodeName === "A" && (
                <Tooltip content="Link" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={(e) => handleMouseDown(e, setOpenLink)}
                  >
                    <Icon className="h-4 w-4" icon="mdi:link" />
                  </a>
                </Tooltip>
              )}
              {dom?.nodeName === "BUTTON" && (
                <Tooltip content="Button" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={(e) => handleMouseDown(e, setOpenButton)}
                  >
                    <Icon className="h-4 w-4" icon="dashicons:button" />
                  </a>
                </Tooltip>
              )}
              {deletable && (
                <Tooltip content="Delete" position="bottom">
                  <a
                    className="flex cursor-pointer items-center rounded-sm bg-muted-100/40 p-1 transition-colors duration-200 hover:bg-muted-200"
                    onMouseDown={handleDelete}
                  >
                    <Icon className="h-4 w-4" icon="mdi:trash-can-outline" />
                  </a>
                </Tooltip>
              )}
              <LinkDialog
                actions={actions}
                node={node as any}
                open={openLink}
                setOpen={setOpenLink}
              />
              <ImageDialog
                actions={actions}
                node={node as any}
                open={openImage}
                setOpen={setOpenImage}
              />
              <HashtagDialog
                actions={actions}
                node={node as any}
                open={openHash}
                setOpen={setOpenHash}
              />
              <SvgDialog
                actions={actions}
                node={node as any}
                open={openSvg}
                setOpen={setOpenSvg}
              />
              <ButtonDialog
                actions={actions}
                node={node as any}
                open={openButton}
                setOpen={setOpenButton}
              />
            </div>,
            document.querySelector(".page-container") as HTMLElement
          )
        : null}
      {render}
    </>
  );
};

export default EditorElement;
