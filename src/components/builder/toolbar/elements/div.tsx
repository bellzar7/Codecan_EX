import { useNode } from "@craftjs/core";
import { useState } from "react";
import {
  addClassName,
  classSectionsConfig,
  filterClasses,
  removeClassName,
  shouldShowSection,
} from "@/utils/builder";
import ClassNameInput from "../shared/ClassNameInput";
import ClassNameTag from "../shared/ClassNameTag";
import ClassSection from "../shared/ClassSection";
import ToolbarSection from "../ToolbarSection";

const DivToolbar = () => {
  const { actions, props } = useNode((node) => ({
    props: node.data.props,
  }));
  const [customClassInput, setCustomClassInput] = useState("");
  const [activeBreakpoints, setActiveBreakpoints] = useState({});
  const [error, setError] = useState("");

  const classNames = props.className?.split(" ").filter(Boolean) || [];

  // Filter custom classes (non-sectioned)
  const sectionedClasses = Object.values(classSectionsConfig).flatMap(
    ({ regex }) => filterClasses(classNames, regex)
  );
  const customClasses = classNames.filter(
    (name) => !sectionedClasses.includes(name)
  );

  const handleBreakpointChange = (section, bp) => {
    setActiveBreakpoints((prev) => ({
      ...prev,
      [section]: prev[section] === bp ? "" : bp,
    }));
  };

  const handleEditClassName = (name, setInputValue) => {
    removeClassName(classNames, name, actions.setProp);
    setInputValue(name);
  };

  const getClassSectionSummary = (section) => {
    const sectionClasses = filterClasses(
      classNames,
      classSectionsConfig[section].regex
    );
    return sectionClasses.length;
  };

  return (
    <>
      <ToolbarSection
        props={["className"]}
        summary={(_props) => {
          const count = customClasses.length;
          return String(count);
        }}
        title="Custom Classes"
      >
        <div>
          <h3 className="font-semibold text-md">Custom Classes</h3>
          <div className="flex flex-wrap gap-2 py-2">
            {customClasses.map((name, index) => (
              <ClassNameTag
                key={index}
                name={name}
                onEdit={() => handleEditClassName(name, setCustomClassInput)}
                onRemove={() =>
                  removeClassName(classNames, name, actions.setProp)
                }
              />
            ))}
          </div>
          <div className="mt-2">
            <ClassNameInput
              onChange={(e) => setCustomClassInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                addClassName(
                  classNames,
                  customClassInput,
                  actions.setProp,
                  setCustomClassInput,
                  setError // Added setError parameter
                )
              }
              placeholder="Add class"
              value={customClassInput}
            />
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
        </div>
      </ToolbarSection>
      {Object.keys(classSectionsConfig).map(
        (section) =>
          shouldShowSection(section, classNames) && (
            <ClassSection
              activeBreakpoint={activeBreakpoints[section.toLowerCase()]}
              classNames={classNames}
              key={section}
              regex={classSectionsConfig[section].regex}
              setActiveBreakpoint={(bp) =>
                handleBreakpointChange(section.toLowerCase(), bp)
              }
              showModes={classSectionsConfig[section].showModes}
              summary={(_props) => {
                const count = getClassSectionSummary(section);
                return (
                  <span
                    className={`text-right text-sm ${
                      count > 0
                        ? "text-muted-800 dark:text-muted-100"
                        : "text-muted-400 dark:text-muted-600"
                    }`}
                  >
                    {count}
                  </span>
                );
              }}
              title={section}
            />
          )
      )}
    </>
  );
};

export default DivToolbar;
