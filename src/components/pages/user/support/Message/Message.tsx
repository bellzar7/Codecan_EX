import { Icon } from "@iconify/react";
import { formatDate } from "date-fns";
import { motion, useInView } from "framer-motion";
import { memo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { MashImage } from "@/components/elements/MashImage";
import SupportConversation from "../SupportConversation";

const ImageModal = ({ src, onClose }) => {
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
        onClick={(e) => e.stopPropagation()} // Prevents click inside the modal from closing it
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
    portalRoot as Element
  );
};

const MessageBase = ({ message, type, userAvatar, agentAvatar, side }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { y: 0, opacity: 0 },
    visible: {
      y: 30,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  const handleImageClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setCurrentImage(message.attachment as string);
    setModalOpen(true);
  };

  return (
    <motion.div
      animate={isInView ? "visible" : "hidden"}
      initial="hidden"
      ref={ref}
      variants={variants}
    >
      {isModalOpen && (
        <ImageModal onClose={() => setModalOpen(false)} src={currentImage} />
      )}
      <SupportConversation
        avatar={type === "client" ? userAvatar : agentAvatar}
        side={side}
        timestamp={formatDate(
          new Date(message.time || Date.now()),
          "MMM dd, yyyy h:mm a"
        )}
      >
        {message.attachment ? (
          <div className="group relative">
            <a className="block cursor-pointer" onClick={handleImageClick}>
              <MashImage
                alt="Attachment"
                className="rounded-lg"
                height={100}
                src={message.attachment as string}
                width={100}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Icon className="text-3xl text-white" icon="akar-icons:eye" />
              </div>
            </a>
          </div>
        ) : (
          message.text
        )}
      </SupportConversation>
    </motion.div>
  );
};

export const Message = memo(MessageBase);
