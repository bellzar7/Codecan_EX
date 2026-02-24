import { useEditor } from "@craftjs/core";
import { Icon } from "@iconify/react";

export const Elements = ({}) => {
  const {
    connectors: { create },
  } = useEditor();

  const elements = [];

  return (
    <div className="grid w-full grid-cols-3 gap-3 p-3">
      {elements.map(({ component, icon, label }, index) => (
        <div
          className="w-full"
          key={index}
          ref={(ref) => {
            if (ref) {
              create(ref, component);
            }
          }}
        >
          <Item move>
            <Icon className="h-6 w-6" icon={icon} />
            <span>{label}</span>
          </Item>
        </div>
      ))}
    </div>
  );
};

const Item = ({ move, children }) => (
  <span
    className="flex w-full cursor-pointer flex-col items-center justify-start gap-2 rounded-md border border-muted-300 bg-muted-100 px-1 py-3 text-muted-900 text-sm transition-all hover:bg-muted-200 dark:border-muted-700 dark:bg-muted-900 dark:text-muted-100 dark:hover:bg-muted-800"
    style={{ cursor: move ? "move" : "pointer" }}
  >
    {children}
  </span>
);

export default Elements;
