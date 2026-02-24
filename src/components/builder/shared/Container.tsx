import { useNode } from "@craftjs/core";
import type React from "react";

interface ContainerProps {
  children?: React.ReactNode;
}
interface ContainerInterface extends React.FC<ContainerProps> {
  craft: object;
}

export const Container: ContainerInterface = ({ children }) => {
  const { connectors } = useNode();

  return (
    <div
      className="bg-white"
      ref={(ref) => {
        connectors.connect(ref as HTMLElement);
      }}
      style={{ width: "100%", minHeight: "800px" }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: "Container",
  props: {},
  rules: {
    canDrag: () => true,
  },
  related: {},
};
