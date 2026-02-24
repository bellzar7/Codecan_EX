import { Icon } from "@iconify/react";
import ReactDOM from "react-dom";

const Portal = ({ children, onClose }) => {
  if (!children) return null;

  const portalRoot = document.getElementById("portal-root");

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      style={{ backdropFilter: "blur-sm(5px)" }}
    >
      <div
        className="relative overflow-hidden rounded-lg bg-white shadow-lg dark:bg-muted-800"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-3 right-3 text-muted-700 dark:text-muted-200"
          onClick={onClose}
        >
          <Icon className="text-2xl" icon="eva:close-fill" />
        </button>
      </div>
    </div>,
    portalRoot || document.body
  );
};

export default Portal;
