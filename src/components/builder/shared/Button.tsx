import { useEditor, useNode } from "@craftjs/core";
import type React from "react";

import Child from "./Child";

interface ButtonClickProps {
  type?: string;
  newTab?: boolean;
  url?: string;
  email?: string;
  submitAsync?: boolean;
  submitMethod?: string;
  submitUrl?: string;
}

const handleClick = (props: ButtonClickProps, e: React.MouseEvent) => {
  if (props?.type === "url") {
    if (props?.newTab) {
      window.open(props.url, "_blank")?.focus();
    } else if (props.url) {
      location.href = props.url;
    }
  } else if (props?.type === "email" && props.email) {
    location.href = `mailto:${props.email}`;
  } else if (props?.type === "submit") {
    const form = (e.target as HTMLElement).closest("form");

    if (!form) {
      return;
    }

    if (!props?.submitAsync) {
      form.submit();
      return;
    }

    const formData = new FormData();
    for (const el of form.elements) {
      if ((el as HTMLInputElement).type !== "submit") {
        formData.append(
          (el as HTMLInputElement).id,
          (el as HTMLInputElement).type === "radio"
            ? String((el as HTMLInputElement).checked)
            : (el as HTMLInputElement).value
        );
      }
    }

    const options = {
      method: props.submitMethod,
      ...(props.submitMethod !== "GET" ? { body: formData } : {}),
    };
    if (props.submitUrl) {
      fetch(props.submitUrl, options)
        .then((e) => e.text().then((d) => ({ ok: e.ok, text: d })))
        .then(({ ok, text }) => {
          alert(ok ? (text ?? "All good") : "Something went wrong");
        });
    }
  }
};

interface ButtonProps {
  r: {
    attrs: Record<string, unknown>;
    classNames: string;
  };
  d: number[];
  i: number;
  propId: string;
}
interface ButtonInterface extends React.FC<ButtonProps> {
  craft: object;
}

const Button: ButtonInterface = ({ r, d, i, propId }) => {
  const { node } = useNode((node) => ({ node }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { connectors } = useNode((node) => ({ node }));

  const { class: foo, ...attrsR } = r.attrs;

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!enabled) {
      handleClick(node.data.props[propId] as ButtonClickProps, e);
    }
  };

  return (
    <button
      ref={(ref) => {
        if (ref) connectors.connect(ref as HTMLElement);
      }}
      {...attrsR}
      className={r.classNames}
      onClick={onClick}
    >
      <Child d={d.concat(i)} root={r as any} />
    </button>
  );
};
export { Button };

Button.craft = {
  displayName: "Button",
  props: {},
  rules: {
    canDrag: () => true,
  },
  related: {},
};
