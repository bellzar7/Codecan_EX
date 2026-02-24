import { useEditor, useNode } from "@craftjs/core";
import type React from "react";
import { useEffect, useState } from "react";

interface TextProps {
  id: string;
  className: string;
  key: string;
  text: string;
}
interface TextInterface extends React.FC<TextProps> {
  craft: object;
}

const Text: TextInterface = (props) => {
  const { node, connectors, actions } = useNode((node) => ({ node }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [textEdit, setTextEdit] = useState(
    node.data.props[props.id]?.text ?? props.text
  );
  const [textPreview, setTextPreview] = useState(textEdit);

  const onChange = (e: React.FormEvent<HTMLDivElement>) => {
    actions.setProp((prop: Record<string, unknown>) => {
      if (!prop[props.id]) {
        prop[props.id] = {};
      }
      (prop[props.id] as any).text = (e.target as HTMLDivElement).innerText;
      setTextPreview((e.target as HTMLDivElement).innerText);
    }, 500);
  };
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (enabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    setTextEdit(node.data.props[props.id]?.text ?? props.text);
  }, [node.data.props[props.id]?.text, props.id, props.text]);

  return enabled ? (
    <span
      className={props.className}
      contentEditable
      onClick={onClick}
      onInput={onChange}
      ref={(ref) => {
        if (ref) {
          connectors.connect(ref as HTMLElement);
        }
      }}
      suppressContentEditableWarning={true}
    >
      {textEdit}
    </span>
  ) : (
    <span className={props.className}>{textPreview}</span>
  );
};

export { Text };

Text.craft = {
  displayName: "Text",
  props: {
    text: "",
  },
  related: {},
};
