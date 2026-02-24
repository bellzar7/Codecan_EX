import { useNode } from "@craftjs/core";
import { capitalize } from "lodash";
import { useEffect, useState } from "react";
import Select from "@/components/elements/form/select/Select";
import {
  addClassName,
  breakpoints,
  classSectionsConfig,
  filterClasses,
  removeClassName,
} from "@/utils/builder";
import ClassNameInput from "../shared/ClassNameInput";
import ClassNameTag from "../shared/ClassNameTag";
import ResponsiveIconButton from "../shared/ResponsiveIconButton";
import ToolbarSection from "../ToolbarSection";

const ClassSection = ({
  title,
  regex,
  showModes,
  activeBreakpoint,
  setActiveBreakpoint,
  classNames,
  summary,
}) => {
  const { actions, props } = useNode((node) => ({
    props: node.data.props,
  }));
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (classSectionsConfig[title].inputType === "select") {
      const currentClass = classNames.find((cls) =>
        cls.startsWith(activeBreakpoint ? `${activeBreakpoint}:` : "")
      );
      if (currentClass) {
        const selectedValue = currentClass.split(":").pop();
        setInputValue(selectedValue);
      } else {
        setInputValue("");
      }
    }
  }, [classNames, activeBreakpoint, title]);

  const sectionClasses = filterClasses(classNames, regex);
  const lightModeClasses = showModes
    ? sectionClasses.filter((name) => !name.startsWith("dark:"))
    : sectionClasses;
  const darkModeClasses = showModes
    ? sectionClasses.filter((name) => name.startsWith("dark:"))
    : [];

  const handleAddClassName = (newClass) => {
    const prefix = activeBreakpoint ? `${activeBreakpoint}:` : "";
    const classNameToAdd = `${prefix}${newClass}`;
    if (/^(justify-|items-|self-)$/.test(classNameToAdd)) {
      setError("Invalid class name");
    } else {
      addClassName(
        classNames,
        classNameToAdd,
        actions.setProp,
        setInputValue,
        setError
      );
    }
  };

  const handleRemoveClassName = (name) => {
    removeClassName(classNames, name, actions.setProp);
  };

  const handleEditClassName = (name) => {
    handleRemoveClassName(name);
    const strippedName = activeBreakpoint
      ? name.replace(`${activeBreakpoint}:`, "")
      : name;
    setInputValue(strippedName);
  };

  const handleBreakpointChange = (bp) => {
    setActiveBreakpoint(bp === activeBreakpoint ? "" : bp);
  };

  return (
    <ToolbarSection props={[...classNames]} summary={summary} title={title}>
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-muted-600 text-xs dark:text-muted-400">
            {title}
          </h4>
          <div className="flex gap-1">
            {breakpoints.map((bp) => (
              <ResponsiveIconButton
                breakpoint={bp}
                hasClasses={sectionClasses.some((name) =>
                  name.includes(`${bp}:`)
                )}
                isActive={activeBreakpoint === bp}
                key={bp}
                onClick={() => handleBreakpointChange(bp)}
              />
            ))}
          </div>
        </div>
        <div className="mt-2">
          {classSectionsConfig[title].inputType === "select" ? (
            <Select
              onChange={(e) => handleAddClassName(e.target.value)}
              options={[
                { value: "", label: "Select an option" },
                ...classSectionsConfig[title].options.map((option) => ({
                  value: option,
                  label: capitalize(option),
                })),
              ]}
              value={inputValue || ""}
            />
          ) : (
            <ClassNameInput
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleAddClassName(e.currentTarget.value)
              }
              placeholder={`${title} (${
                activeBreakpoint ? activeBreakpoint.toUpperCase() : "Base"
              })`}
              value={inputValue}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {lightModeClasses
            .filter((name) =>
              activeBreakpoint
                ? name.includes(`${activeBreakpoint}:`)
                : !breakpoints.some((bp) => name.includes(`${bp}:`))
            )
            .filter((name) => !/^(justify-|items-|self-)$/.test(name))
            .map((name, index) => (
              <ClassNameTag
                key={index}
                name={name}
                onEdit={() => handleEditClassName(name)}
                onRemove={() => handleRemoveClassName(name)}
              />
            ))}
          {showModes && darkModeClasses.length > 0 && (
            <div className="mt-2 w-full">
              <h4 className="text-muted-600 text-xs dark:text-muted-400">
                Dark Mode Classes
              </h4>
              <div>
                {darkModeClasses
                  .filter((name) =>
                    activeBreakpoint
                      ? name.includes(`${activeBreakpoint}:`)
                      : !breakpoints.some((bp) => name.includes(`${bp}:`))
                  )
                  .filter((name) => !/^(justify-|items-|self-)$/.test(name))
                  .map((name, index) => (
                    <ClassNameTag
                      key={index}
                      name={name}
                      onEdit={() => handleEditClassName(name)}
                      onRemove={() => handleRemoveClassName(name)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-xs">{error}</div>}
      </div>
    </ToolbarSection>
  );
};

export default ClassSection;
