import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Command {
  label: string;
  icon?: string;
  onClick?: () => void;
  submenu?: Command[];
}

interface ContextMenuProps {
  commands: Command[];
  children: React.ReactNode; // The component it wraps (e.g., Container)
}

const ContextMenu: React.FC<ContextMenuProps> = ({ commands, children }) => {
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  const menuRef = useRef<HTMLDivElement>(null);

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({
      x: event.clientX,
      y: event.clientY,
      visible: true,
    });
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      menuPosition.visible
    ) {
      setMenuPosition({ ...menuPosition, visible: false });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const closeMenu = () => setMenuPosition({ ...menuPosition, visible: false });

  return (
    <div className="relative" onContextMenu={handleRightClick}>
      {children}
      {menuPosition.visible &&
        createPortal(
          <div
            className="rounded-lg rounded-tl-none bg-white/90 p-1 text-sm shadow-lg dark:bg-muted-950/90"
            ref={menuRef}
            style={{
              position: "absolute",
              top: menuPosition.y,
              left: menuPosition.x,
              zIndex: 200,
            }}
          >
            <ul className="m-0 list-none p-0">
              {commands.map((command, index) => (
                <li
                  className="flex cursor-pointer items-center rounded-md p-2 text-muted-700 hover:bg-muted-100 dark:text-muted-300 dark:hover:bg-muted-700"
                  key={index}
                  onClick={() => {
                    command.onClick?.();
                    closeMenu();
                  }}
                >
                  {command.icon && (
                    <Icon
                      className="mr-2 h-5 w-5 text-muted-500 dark:text-muted-300"
                      icon={command.icon}
                    />
                  )}
                  {command.label}
                </li>
              ))}
            </ul>
          </div>,
          document.body // Render menu in a portal
        )}
    </div>
  );
};

export default ContextMenu;
