import { Icon } from "@iconify/react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { createElement, useRef } from "react";
import Button from "@/components/elements/base/button/Button";
import Table from "@/components/elements/base/table/Table";
import TD from "@/components/elements/base/table/TD";
import TH from "@/components/elements/base/table/TH";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";

export const ContentBlock = ({ block, idx }) => {
  const itemVariants = {
    hidden: { opacity: 0, x: 0 },
    visible: { opacity: 1, x: 50 },
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  switch (block.type) {
    case "paragraph":
      return (
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="text-gray-600 dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <p>{block.data.text}</p>
        </motion.div>
      );

    case "header": {
      const level = Number(block.data.level);
      const className = `text-${
        level === 1 ? "4xl" : level === 2 ? "3xl" : level === 3 ? "2lg" : "base"
      }`;
      return (
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className={`${className}`}
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          {createElement(
            `h${level}`,
            {
              className: " font-bold text-muted-800 dark:text-muted-200",
            },
            block.data.text
          )}
        </motion.div>
      );
    }
    case "quote":
      return (
        <motion.blockquote
          animate={isInView ? "visible" : "hidden"}
          className="border-l-4 pl-4 text-gray-600 italic dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <p>{block.data.text}</p>
          <cite>{block.data.caption}</cite>
        </motion.blockquote>
      );
    case "list":
      return (
        <motion.ul
          animate={isInView ? "visible" : "hidden"}
          className="list-inside list-disc text-gray-600 dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          {block.data.items.map((item, itemIdx) => (
            <li key={itemIdx}>{item.content}</li>
          ))}
        </motion.ul>
      );

    case "quote":
      return (
        <motion.blockquote
          animate={isInView ? "visible" : "hidden"}
          className="border-l-4 pl-4 text-gray-600 italic dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <p>{block.data.text}</p>
          <cite>{block.data.caption}</cite>
        </motion.blockquote>
      );
    case "list":
      return (
        <motion.ul
          animate={isInView ? "visible" : "hidden"}
          className="list-inside list-disc text-gray-600 dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          {block.data.items.map((item, itemIdx) => (
            <li key={itemIdx}>{item.content}</li>
          ))}
        </motion.ul>
      );
    case "checklist":
      return (
        <motion.ul
          animate={isInView ? "visible" : "hidden"}
          className="list-none text-gray-600 dark:text-gray-400"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          {block.data.items.map((item, itemIdx) => (
            <li className="flex items-center gap-2" key={itemIdx}>
              <Checkbox
                checked={item.checked}
                color="primary"
                readOnly
                type="checkbox"
              />
              {item.text}
            </li>
          ))}
        </motion.ul>
      );
    case "image":
      return (
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          initial="hidden"
          key={idx}
          ref={ref}
          style={{
            border: block.data.withBorder ? "1px solid black" : "none",
          }}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <img
            alt={block.data.caption}
            className="w-full rounded-xl"
            src={block.data.file.url}
            style={{
              width: block.data.stretched ? "100%" : "auto",
              backgroundColor: block.data.withBackground
                ? "#f0f0f0"
                : "transparent",
            }}
          />
          {block.data.caption && <p>{block.data.caption}</p>}
        </motion.div>
      );
    case "table":
      return (
        <motion.span
          animate={isInView ? "visible" : "hidden"}
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <Table className="prose-none w-full overflow-x-auto rounded-lg border border-muted-200 bg-white dark:border-muted-900 dark:bg-muted-950">
            {block.data.withHeadings && (
              <thead>
                <tr className="bg-muted-50 dark:bg-muted-900">
                  {block.data.content[0].map((heading, headingIdx) => (
                    <TH key={headingIdx}>{heading}</TH>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.data.content
                .slice(block.data.withHeadings ? 1 : 0)
                .map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <TD key={cellIdx}>
                        <div className="text-muted-800 dark:text-muted-100">
                          {cell}
                        </div>
                      </TD>
                    ))}
                  </tr>
                ))}
            </tbody>
          </Table>
        </motion.span>
      );
    case "code":
      return (
        <motion.pre
          animate={isInView ? "visible" : "hidden"}
          className="bg-gray-100 p-4 dark:bg-gray-800"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          {block.data.code}
        </motion.pre>
      );
    case "button":
      return (
        <motion.span
          animate={isInView ? "visible" : "hidden"}
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <Link className="prose-none" href={block.data.link}>
            <Button color={"primary"} key={idx} size={"md"} variant={"pastel"}>
              {block.data.text}
            </Button>
          </Link>
        </motion.span>
      );
    case "delimiter":
      return (
        <motion.hr
          animate={isInView ? "visible" : "hidden"}
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        />
      );
    case "raw":
      return (
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          dangerouslySetInnerHTML={{ __html: block.data.html }}
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        />
      );
    case "warning":
      return (
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="mb-5 flex items-center gap-2 rounded-md border border-warning-500 bg-warning-50 py-3 ps-4 pe-2 text-warning-500 dark:border-warning-300 dark:bg-muted-800 dark:text-warning-300"
          initial="hidden"
          key={idx}
          ref={ref}
          transition={{ duration: 0.4 }}
          variants={itemVariants}
        >
          <Icon
            className={"text-warning-500 dark:text-warning-300"}
            height={24}
            icon={"ph:warning-octagon-duotone"}
            width={24}
          />
          <div>
            <div className="font-semibold text-sm text-warning-500 dark:text-warning-300">
              {block.data.title}
            </div>
            <div className="text-warning-500 text-xs dark:text-warning-300">
              {block.data.message}
            </div>
          </div>
        </motion.div>
      );

    default:
      return null;
  }
};
