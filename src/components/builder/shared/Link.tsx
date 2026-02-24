import { useEditor, useNode } from "@craftjs/core";
import NextLink from "next/link";
import type React from "react";
import Child from "./Child";

interface LinkClickProps {
  link?: string;
  newTab?: boolean;
}

const handleClick = (props: LinkClickProps) => {
  const link = props?.link || "#";
  if (props?.newTab) {
    window.open(link, "_blank")?.focus();
  } else {
    location.href = link;
  }
};

interface LinkProps {
  r: {
    attrs: Record<string, unknown>;
    classNames: string;
  };
  d: number[];
  i: number;
  propId: string;
}
interface LinkInterface extends React.FC<LinkProps> {
  craft: object;
}

const Link: LinkInterface = ({ r, d, i, propId }) => {
  const { node } = useNode((node) => ({ node }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { connectors } = useNode((node) => ({ node }));

  const { class: foo, ...attrsR } = r.attrs;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!enabled) {
      handleClick(node.data.props[propId] as LinkClickProps);
    }
  };

  const link = node.data.props[propId]?.link || "#";
  const linkContent = <Child d={d.concat(i)} root={r as any} />;

  return enabled ? (
    <a
      ref={(ref) => {
        if (ref) connectors.connect(ref as HTMLElement);
      }}
      {...attrsR}
      className={r.classNames}
      href={link}
      onClick={onClick}
    >
      {linkContent}
    </a>
  ) : (
    <NextLink
      className={r.classNames}
      href={link}
      passHref
      target={node.data.props[propId]?.newTab ? "_blank" : ""}
    >
      {linkContent}
    </NextLink>
  );
};

export { Link };

Link.craft = {
  displayName: "Link",
  props: {},
  rules: {
    canDrag: () => true,
  },
  related: {},
};
