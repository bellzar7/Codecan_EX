// src/components/Item.tsx

import { Element } from "@craftjs/core";
import { uniqueId } from "lodash";
import { parse } from "node-html-parser";
import Block from "@/components/builder/shared/Block";
import { cleanHTMLElement } from "@/components/builder/utils/html";

const Item = ({ connectors, c, move, children }) => {
  const root = cleanHTMLElement(parse(c.source) as unknown as RootProps);
  const id = uniqueId();

  return (
    <div
      ref={(ref) =>
        connectors.create(
          ref as HTMLElement,
          <Element canvas is={Block} key={id} root={root} />
        )
      }
    >
      <a
        className="relative w-full cursor-pointer gap-2 text-muted-800 text-sm transition-all hover:text-muted-800 dark:text-muted-200"
        style={{ cursor: move ? "move" : "pointer" }}
      >
        {children}
      </a>
    </div>
  );
};

export default Item;
