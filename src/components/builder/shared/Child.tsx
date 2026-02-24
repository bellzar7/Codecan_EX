import { Element, useNode } from "@craftjs/core";
import type React from "react";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import Radio from "@/components/elements/form/radio/Radio";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { cleanHTMLAttrs, transferLabelInnerText } from "../utils/html";
import { Button } from "./Button";
import { Image } from "./Image";
import { Link } from "./Link";
import { Svg } from "./Svg";
import { Text } from "./Text";

interface ChildProps {
  root: RootProps;
  d?: number[];
}

const Child: React.FC<ChildProps> = ({ root, d = [0] }) => {
  if (!root || root?.childNodes.length === 0) {
    return null;
  }

  return (
    <>
      {Array.from(root?.childNodes).map((r, i) => {
        const key = d.concat(i).join("");
        const classNames = r.classNames?.toString() || "";
        const cleanedAttrs = cleanHTMLAttrs(r.attrs);

        if (r.nodeType === 1) {
          switch (r.tagName) {
            case "SECTION":
              return (
                <section className={classNames} id={key} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </section>
              );
            case "DIV":
              return (
                <div className={classNames} id={key} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </div>
              );
            case "H1":
              return (
                <h1 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h1>
              );
            case "H2":
              return (
                <h2 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h2>
              );
            case "H3":
              return (
                <h3 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h3>
              );
            case "H4":
              return (
                <h4 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h4>
              );
            case "H5":
              return (
                <h5 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h5>
              );
            case "H6":
              return (
                <h6 className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </h6>
              );
            case "P":
              return (
                <p className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </p>
              );
            case "A":
              return (
                <Element
                  d={d}
                  i={i}
                  id={key}
                  is={Link}
                  key={key}
                  propId={key}
                  r={r}
                />
              );
            case "SPAN":
              return (
                <span className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </span>
              );
            case "STRONG":
              return (
                <strong className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </strong>
              );
            case "EM":
              return (
                <em className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </em>
              );
            case "HEADER":
              return (
                <header className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </header>
              );
            case "MAIN":
              return (
                <main className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </main>
              );
            case "FOOTER":
              return (
                <footer className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </footer>
              );
            case "NAV":
              return (
                <nav className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </nav>
              );
            case "ASIDE":
              return (
                <aside className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </aside>
              );
            case "DETAILS":
              return (
                <details className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </details>
              );
            case "SUMMARY":
              return (
                <summary className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </summary>
              );
            case "BLOCKQUOTE":
              return (
                <blockquote className={classNames} key={key} {...cleanedAttrs}>
                  <Child d={d.concat(i)} root={r} />
                </blockquote>
              );
            case "INPUT":
              if (r.attrs.type === "checkbox") {
                return (
                  <Checkbox
                    className={classNames}
                    key={key}
                    {...cleanedAttrs}
                  />
                );
              }
              if (r.attrs.type === "radio") {
                return (
                  <Radio
                    className={classNames}
                    key={key}
                    label={String(cleanedAttrs.label || "")}
                    {...cleanedAttrs}
                  />
                );
              }
              return (
                <Input className={classNames} key={key} {...cleanedAttrs} />
              );
            case "LABEL":
              transferLabelInnerText(r);
              return;
            case "TEXTAREA":
              return (
                <Textarea
                  className={classNames}
                  defaultValue={r.innerText}
                  key={key}
                  {...cleanedAttrs}
                />
              );
            case "BUTTON":
              return (
                <Element
                  d={d}
                  i={i}
                  id={key}
                  is={Button}
                  key={key}
                  propId={key}
                  r={r}
                />
              );
            case "FORM":
              return (
                <form className={classNames} key={key} {...cleanedAttrs}>
                  <Child d={d.concat(i)} root={r} />
                </form>
              );
            case "SVG":
              return <Element id={key} is={Svg} key={key} propId={key} r={r} />;
            case "ADDRESS":
              return (
                <address className={classNames} key={key} {...cleanedAttrs}>
                  <Text className={""} id={key} key={key} text={r.innerText} />
                </address>
              );
            case "FIGURE":
              return (
                <figure className={classNames} key={key} {...cleanedAttrs}>
                  <Child d={d.concat(i)} root={r} />
                </figure>
              );
            case "IMG":
              return (
                <Element
                  attrs={cleanedAttrs}
                  classNames={classNames}
                  d={d}
                  i={i}
                  id={key}
                  is={Image}
                  key={key}
                  propId={key}
                />
              );
            case "ARTICLE":
            case "DL":
            case "DD":
            case "DT":
              return (
                <article className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </article>
              );
            case "SCRIPT":
              return null;
            case "LINK":
              return (
                <link className={classNames} {...cleanedAttrs} key={key} />
              );
            case "BR":
              return <br className={classNames} key={key} />;
            case "UL":
              return (
                <ul className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </ul>
              );
            case "LI":
              return (
                <li className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </li>
              );
            case "CITE":
              return (
                <cite className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </cite>
              );
            case "HR":
              return <hr className={classNames} key={key} />;
            case "IFRAME":
              return (
                <iframe className={classNames} {...cleanedAttrs} key={key} />
              );
            case "STYLE":
              return <style key={key}>{r.innerText}</style>;
            case "TABLE":
              return (
                <table className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </table>
              );
            case "THEAD":
              return (
                <thead className={classNames} {...cleanedAttrs} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </thead>
              );
            case "TBODY":
              return (
                <tbody className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </tbody>
              );
            case "TR":
              return (
                <tr className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </tr>
              );
            case "TD":
              return (
                <td className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </td>
              );
            case "TH":
              return (
                <th className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </th>
              );
            case "FIGCAPTION":
              return (
                <figcaption className={classNames} key={key}>
                  <Child d={d.concat(i)} root={r} />
                </figcaption>
              );
            default:
              return <p key={key}>Unknown container</p>;
          }
        }
        if (r.nodeType === 3) {
          if (r.innerText.trim() === "") {
            return null;
          }
          return (
            <Text
              className={classNames}
              id={key}
              key={key}
              text={r.innerText ?? ""}
            />
          );
        }
        return <p key={key}>Unknown type</p>;
      })}
    </>
  );
};

export default Child;

interface ComponentProps {
  root: RootProps;
}

const Component: React.FC<ComponentProps> = ({ root }) => {
  const { connectors, node } = useNode((node) => ({ node }));

  return (
    <div
      id={node.id}
      ref={(ref) => {
        connectors.connect(ref as HTMLDivElement);
      }}
    >
      <Child root={root} />
    </div>
  );
};

export { Component };
