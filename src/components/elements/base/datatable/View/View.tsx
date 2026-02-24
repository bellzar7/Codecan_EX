import { useDataTable } from "@/stores/datatable";
import { Panel } from "../../panel/panel";
import StructureRenderer from "./StructureRenderer";

const ViewBase = ({ title }) => {
  const { panelAction, viewItem, isPanelOpen, closePanel, structureData } =
    useDataTable((state) => state);

  return (
    <Panel
      isOpen={isPanelOpen}
      onClose={closePanel}
      side={panelAction && "side" in panelAction ? panelAction.side : undefined}
      size={
        panelAction && "modelSize" in panelAction
          ? panelAction.modelSize
          : undefined
      }
      tableName={title}
      title={panelAction?.label ?? ""}
    >
      <div className="pb-20">
        <StructureRenderer
          formValues={structureData.get}
          modalItem={viewItem}
        />
      </div>
    </Panel>
  );
};

export const View = ViewBase;
