import { Icon } from "@iconify/react";
import ReactDOM from "react-dom";
import { MashImage } from "./MashImage";

const ImagePortal = ({ src, onClose }) => {
  if (!src) return null;

  const portalRoot = document.getElementById("portal-root");

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      style={{ backdropFilter: "blur-sm(5px)" }}
    >
      <div
        className="overflow-hidden rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <MashImage
          alt="Preview"
          className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain"
          src={src}
        />
        <button className="absolute top-3 right-3 text-white" onClick={onClose}>
          <Icon className="text-2xl" icon="eva:close-fill" />
        </button>
      </div>
    </div>,
    portalRoot || document.body
  );
};

export default ImagePortal;
