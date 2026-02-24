import {
  Editor as CraftEditor,
  Element,
  Frame,
  type Resolver,
  type SerializedNodes,
  useEditor,
} from "@craftjs/core";
import { debounce } from "lodash";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { ThemeContext, ThemeProvider } from "@/context/ThemeContext";
import { Container } from "../shared/Container";
import { loadTemplate } from "../utils/fetch";
import Viewport from "../viewport";
import EditorElement from "./EditorElement";

interface FrameProps {
  data: unknown;
}

export const DEFAULT_TEMPLATE: SerializedNodes = {
  ROOT: {
    type: { resolvedName: "Container" },
    isCanvas: true,
    props: { width: "100%", height: "800px" },
    displayName: "Container",
    custom: { displayName: "App" },
    parent: null,
    nodes: [],
    linkedNodes: {},
    hidden: false,
  },
};

const FrameEditor: React.FC<FrameProps> = ({ data }) => {
  const { actions } = useEditor();
  const [isDeserialized, setIsDeserialized] = useState(false);

  const loadData = async () => {
    const result = await loadTemplate();
    actions.deserialize(result.ROOT ? result : DEFAULT_TEMPLATE);
    setIsDeserialized(true);
  };

  const debounceLoadData = debounce(loadData, 100);

  useEffect(() => {
    if (!(data || isDeserialized)) {
      debounceLoadData();
    }
  }, [data, isDeserialized, debounceLoadData]);

  if (data) {
    let parsedData: SerializedNodes;
    try {
      parsedData = typeof data === "string" ? JSON.parse(data) : data;
    } catch (_error) {
      parsedData = DEFAULT_TEMPLATE;
    }
    if (parsedData.ROOT?.type) {
      return <Frame data={parsedData} />;
    }
    return <Frame data={DEFAULT_TEMPLATE} />;
  }

  return (
    <ThemeProvider>
      <Viewport>
        <Frame>
          <Element canvas custom={{ displayName: "App" }} is={Container} />
        </Frame>
      </Viewport>
    </ThemeProvider>
  );
};

interface EditorProps {
  data: unknown;
}

const Editor: React.FC<EditorProps> = ({ data }) => {
  const { resolver } = useContext(ThemeContext);

  return (
    <CraftEditor
      enabled={!data}
      onRender={({ render }) => <EditorElement render={render} />}
      resolver={resolver as Resolver}
    >
      <FrameEditor data={data} />
    </CraftEditor>
  );
};

export default Editor;
