import { useNode } from "@craftjs/core";
import type React from "react";

interface ImageProps {
  d: number[];
  i: number;
  classNames: string;
  attrs: Record<string, unknown>;
  propId: string;
}
interface ImageInterface extends React.FC<ImageProps> {
  craft: object;
}

export const Image: ImageInterface = ({
  d: _d,
  i: _i,
  classNames,
  attrs,
  propId,
}) => {
  const { connectors } = useNode((node) => ({ node }));

  const { node } = useNode((node) => ({ node }));

  // Ensure attrs is defined and provide a default value if it's undefined
  const url = node.data.props[propId]?.url ?? (attrs ? attrs.src : "");

  // Ensure attrs is defined and destructure it safely
  const { class: foo, ...attrsR } = attrs || {};

  return (
    <img
      className={classNames}
      ref={(ref) => {
        if (ref) connectors.connect(ref as HTMLElement);
      }}
      {...attrsR}
      alt={attrs?.alt as string | undefined}
      height={(attrs?.height as number | undefined) ?? 1}
      src={url}
      width={(attrs?.width as number | undefined) ?? 1}
    />
  );
};

Image.craft = {
  displayName: "Image",
  props: {},
  rules: {
    canDrag: () => true,
  },
  related: {},
};
