import { useEditor } from "@craftjs/core";
import { Icon } from "@iconify/react";
import { useContext, useEffect, useState } from "react";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { ThemeContext } from "@/context/ThemeContext";
import Category from "./Category";
import Item from "./Item";

const Blocks = () => {
  const { components, categories, updateIndex, themeNames, themeIndex } =
    useContext(ThemeContext);

  const { enabled, connectors } = useEditor(({ options }) => ({
    enabled: options.enabled,
  }));

  const [toolbarVisible, setToolbarVisible] = useState<boolean[]>([]);

  useEffect(() => {
    const v = Array.from({ length: categories.length }, (_, i) => i === 0);
    setToolbarVisible(v);
  }, [categories]);

  const toggleToolbar = (index: number) => {
    setToolbarVisible((t) => t.map((c, i) => (i === index ? !c : c)));
  };

  const onChange = (item) => {
    updateIndex(themeNames.indexOf(item.value));
  };

  return (
    <div className="flex h-full w-full flex-col shadow-inner">
      <div className="p-3">
        <ListBox
          options={themeNames.map((t) => ({ label: t, value: t }))}
          selected={{
            label: themeNames[themeIndex],
            value: themeNames[themeIndex],
          }}
          setSelected={(e) => onChange(e)}
        />
      </div>
      <div className="scrollbar-hidden slimscroll overflow-y-auto">
        {categories.map((b, j) => (
          <Category
            key={j}
            setVisible={() => toggleToolbar(j)}
            title={b}
            visible={toolbarVisible[j]}
          >
            <div className="flex flex-col gap-5 bg-muted-100 p-5 dark:bg-muted-900">
              {components
                ?.filter((c) => c.category === b)
                .map((c, i) => (
                  <div className="group relative w-full" key={i}>
                    <Item c={c} connectors={connectors} move>
                      <img
                        alt={c.displayName}
                        className="rounded-md"
                        height="300px"
                        src={`/themes/${c.themeFolder}/${c.blockFolder}/preview.png`}
                        width="600px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Icon
                          className="text-3xl text-white"
                          icon="fluent:drag-20-regular"
                        />
                        <span className="absolute bottom-1 left-2 text-white">
                          {c.displayName}
                        </span>
                      </div>
                    </Item>
                  </div>
                ))}
            </div>
          </Category>
        ))}
      </div>
    </div>
  );
};

export default Blocks;
