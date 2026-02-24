import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useDataTable } from "@/stores/datatable";
import Button from "../../button/Button";
import Message from "../../message/Message";

const BulkSelectionMessageBase = () => {
  const { t } = useTranslation();
  const { clearSelection, selectedItems, navActionsState, handleAction } =
    useDataTable((state) => state);
  const isShowingDeleted = Boolean(navActionsState.showDeleted);
  return (
    <Message onClose={clearSelection}>
      <div className="flex w-full flex-col items-start justify-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-normal text-muted-800 text-sm leading-tight dark:text-muted-100">
            {selectedItems.length} {t("item(s) selected")}
          </p>
          <p className="text-muted-400 text-xs">
            {t("Click on an item to deselect it")}
          </p>
        </div>
        <div className="me-2 flex items-center gap-3">
          <Button
            color="danger"
            onClick={() => {
              handleAction({
                type: "modal",
                modalType: "confirmation",
                topic: isShowingDeleted
                  ? "bulk-permanent-delete"
                  : "bulk-delete",
                name: isShowingDeleted ? "Delete Permanently" : "Delete",
                icon: isShowingDeleted ? "ph:trash-simple" : "ph:trash-duotone",
              });
            }}
            size={"sm"}
            variant="pastel"
          >
            <Icon
              className="me-1 h-5 w-5"
              icon={isShowingDeleted ? "ph:trash-simple" : "ph:trash-duotone"}
            />
            {isShowingDeleted ? "Delete Permanently" : "Delete"}
          </Button>
          {isShowingDeleted && (
            <Button
              color="warning"
              onClick={() => {
                handleAction({
                  type: "modal",
                  modalType: "confirmation",
                  topic: "bulk-restore",
                  name: "Restore",
                  icon: "ph:arrow-clockwise",
                });
              }}
              size={"sm"}
              variant="pastel"
            >
              <Icon className="me-1 h-5 w-5" icon="ph:arrow-clockwise" />
              {t("Restore")}
            </Button>
          )}
        </div>
      </div>
    </Message>
  );
};
export const BulkSelectionMessage = BulkSelectionMessageBase;
