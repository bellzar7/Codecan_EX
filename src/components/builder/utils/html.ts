interface RootProps {
  tagName: string;
  attrs: Record<string, unknown>;
  childNodes: RootProps[];
  classNames: unknown;
  nodeType: unknown;
  innerText: string;
  constructor: { name: string };
}

const cleanHTMLClasses = (classNames: unknown) => {
  if (typeof classNames === "string" || classNames instanceof String) {
    return classNames;
  }
  if (Array.isArray(classNames) || Array.isArray(classNames)) {
    return classNames.join(" ");
  }
  return "";
};

export const cleanHTMLAttrs = (attrs: Record<string, unknown> | undefined) => {
  if (!attrs) {
    return {};
  }
  const mapped = Object.keys(attrs).reduce(
    (acc: Record<string, unknown>, key: string) => {
      switch (key) {
        case "class":
          break; // skip class attribute
        case "checked":
          acc.checkeddefault = attrs[key];
          break;
        case "for":
          acc.htmlFor = attrs[key];
          break;
        case "autocomplete":
          acc.autoComplete = attrs[key];
          break;
        case "tabindex":
          acc.tabIndex = attrs[key];
          break;
        default:
          acc[key] = attrs[key];
      }
      return acc;
    },
    {}
  );
  return mapped;
};

const _deepCloneNode = (node: RootProps): RootProps => {
  return {
    ...node,
    attrs: { ...node.attrs },
    childNodes: node.childNodes.map(_deepCloneNode),
  };
};

const updateNodeWithLabel = (
  root: RootProps,
  labelFor: string,
  labelText: string
) => {
  if (root.attrs && root.attrs.id === labelFor && !root.attrs.label) {
    root.attrs = { ...root.attrs, label: labelText };
  }

  for (const child of root.childNodes) {
    updateNodeWithLabel(child, labelFor, labelText);
  }
};

export const transferLabelInnerText = (root: RootProps) => {
  if (root.tagName === "LABEL" && root.attrs && root.attrs.htmlFor) {
    const labelFor = root.attrs.htmlFor;
    updateNodeWithLabel(root, labelFor as string, root.innerText);
  }

  for (const child of root.childNodes) {
    transferLabelInnerText(child);
  }
};

// Wrapper function to call transferLabelInnerText for each node
const traverseAndTransfer = (root: RootProps) => {
  transferLabelInnerText(root);
};

export const cleanHTMLElement = (root: RootProps): RootProps => {
  traverseAndTransfer(root);
  const classNames = cleanHTMLClasses(root?.classNames);
  return {
    childNodes: root.childNodes.map(cleanHTMLElement),
    attrs: cleanHTMLAttrs(root.attrs as Record<string, unknown>) as Record<
      string,
      unknown
    >,
    tagName: root.tagName,
    classNames: classNames as string,
    nodeType: root.nodeType,
    innerText: root.innerText,
    constructor: { name: root.constructor.name },
  };
};

export const getElementProperty = (
  element: HTMLElement,
  property: string,
  defaultValue: string
): string => {
  const value = (
    window.getComputedStyle(element) as unknown as Record<string, string>
  )[property];
  if (value !== defaultValue) {
    return value;
  }
  if (!element || element.childNodes.length === 0) {
    return defaultValue;
  }

  return getElementProperty(
    element?.childNodes[0] as HTMLElement,
    property,
    defaultValue
  );
};

export const waitForElement = (
  target: HTMLElement,
  selector: string
): Promise<HTMLElement> => {
  return new Promise((r) => {
    const e = target.querySelector(selector) as HTMLElement;
    if (e) {
      return r(e);
    }

    const observer = new MutationObserver(async (_m) => {
      const e = target.querySelector(selector) as HTMLElement;
      await new Promise((r) => setTimeout(r, 100)); // hack to wait for computed styles
      if (e) {
        r(e);
        observer.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  });
};

export const isDarkBackground = (bgColor: string) => {
  const [r, g, b] = bgColor
    .match(/\(([^()]+)\)/)?.[1]
    ?.split(",")
    ?.map((v) => Number.parseInt(v, 10)) || [0, 0, 0];
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp < 127.5;
};
