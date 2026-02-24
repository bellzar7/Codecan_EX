import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import { useDataTable } from "@/stores/datatable";
import IconButton from "../../button-icon/IconButton";
import { Tooltip } from "../../tooltips/Tooltip";
import type { NavActionsProps } from "./NavActions.types";

const NavActionsBase = ({ navAction, navActionsSlot }: NavActionsProps) => {
  const { t } = useTranslation();
  const { actionConfigs, navActionsState, handleAction } = useDataTable(
    (state) => state
  );

  const renderActions = (actions) =>
    actions?.map((action, index) => (
      <div key={index}>
        {action.type === "checkbox" ? (
          <ToggleSwitch
            checked={Boolean(navActionsState[action.topic])}
            color={action.color}
            label={t(action.label)}
            onChange={() => handleAction(action)}
            sublabel={t(action.sublabel)}
          />
        ) : (
          <Tooltip content={t(action.label)}>
            <IconButton
              aria-label={t(action.label)}
              color={action.color || "primary"}
              onClick={() => handleAction(action)}
              shape={"rounded"}
              size="lg"
              variant="pastel"
            >
              <Icon className="h-6 w-6" icon={action.icon} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ));

  return (
    <>
      {navAction
        ? renderActions([navAction])
        : (navActionsSlot || actionConfigs?.navActionsConfig?.length > 0) && (
            <div className="flex w-full items-start justify-between gap-3 sm:w-auto sm:justify-end">
              <div className="flex w-full items-start justify-between gap-5">
                {navActionsSlot}
                {renderActions(actionConfigs?.navActionsConfig)}
              </div>
            </div>
          )}
    </>
  );
};

export const NavActions = NavActionsBase;
