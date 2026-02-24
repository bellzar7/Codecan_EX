import { memo, useEffect, useState } from "react";

interface MashImageBaseProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

const MashImageBase = ({
  src,
  alt,
  fill,
  width,
  height,
  className,
  ...props
}: MashImageBaseProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
    } else {
      setImgSrc(
        src?.includes("uploads/avatar") || src?.includes("uploads/users")
          ? "/img/avatars/placeholder.webp"
          : "/img/placeholder.svg"
      );
    }
  }, [src]);

  // Separate imgProps for HTML img element
  const imgProps = { ...props, width, height, className };

  return <img alt={alt} src={imgSrc} {...imgProps} />;
};

export const MashImage = memo(MashImageBase);
