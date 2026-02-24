import { useNode } from "@craftjs/core";
import type React from "react";

// const examplePath = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'

interface SvgChildNode {
  tagName: string;
  attrs: Record<string, unknown>;
}

interface SvgProps {
  r: {
    childNodes: SvgChildNode[];
    classNames: string;
    attrs: Record<string, unknown>;
  };
  propId: string;
}
interface SvgInterface extends React.FC<SvgProps> {
  craft: object;
}

const Svg: SvgInterface = ({ r, propId }) => {
  const { connectors, node } = useNode((node) => ({ node }));
  const path = node.data.props[propId]?.path;

  const nodes = r.childNodes.filter((c: SvgChildNode) => c.tagName === "PATH");
  return (
    <svg
      className={r.classNames}
      fill={r.attrs.fill as string | undefined}
      height={r.attrs.height as number | string | undefined}
      key={propId}
      ref={(ref) => {
        if (ref) {
          connectors.connect(ref as unknown as HTMLElement);
        }
      }}
      stroke={r.attrs.stroke as string | undefined}
      viewBox={r.attrs.viewbox as string | undefined}
      width={r.attrs.width as number | string | undefined}
      xmlns={r.attrs.xmlns as string | undefined}
    >
      {nodes
        .filter((_: SvgChildNode, i: number) => i === 0 || !path)
        .map((c: SvgChildNode, i: number) => (
          <path
            clipRule={c.attrs["clip-rule"] as any}
            d={(path ?? c.attrs.d) as string | undefined}
            fill={c.attrs.fill as string | undefined}
            fillRule={c.attrs["fill-rule"] as any}
            key={propId + i.toString()}
            stroke={c.attrs.stroke as string | undefined}
            strokeLinecap={c.attrs["stroke-linecap"] as any}
            strokeLinejoin={c.attrs["stroke-linejoin"] as any}
            strokeWidth={c.attrs["stroke-width"] as number | string | undefined}
          />
        ))}
    </svg>
  );
};
export { Svg };

Svg.craft = {
  displayName: "Svg",
  props: {},
  rules: {
    canDrag: () => true,
  },
  related: {},
};
