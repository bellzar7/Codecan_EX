import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import pluralize from "pluralize";
import { useState } from "react";
import { useDataTable } from "@/stores/datatable";
import Button from "../../button/Button";
import IconButton from "../../button-icon/IconButton";
import Card from "../../card/Card";
import Modal from "../../modal/Modal";
import { FormRenderer } from "./FormRenderer";

const FormModalBase = () => {
  const { t } = useTranslation();
  const { modalAction, activeModal, closeModal, handleSubmit, props } =
    useDataTable((state) => state);
  const [formValues, setFormValues] = useState({});

  return (
    <Modal
      open={!!activeModal}
      size={
        (props?.formSize || modalAction?.modelSize) as
          | "sm"
          | "md"
          | "lg"
          | "xl"
          | "2xl"
          | "3xl"
          | undefined
      }
    >
      <Card shape="smooth">
        <div className="flex items-center justify-between p-4 md:p-6">
          <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
            {modalAction?.label} {pluralize.singular(props?.title)}
          </p>
          <IconButton onClick={() => closeModal()} shape="full" size="sm">
            <Icon className="h-4 w-4" icon="lucide:x" />
          </IconButton>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="max-h-[65vh] overflow-y-auto p-4 md:px-6 md:py-8">
            <div className="mx-auto w-full space-y-4">
              <FormRenderer
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex w-full justify-end gap-2">
              <Button onClick={() => closeModal()} shape="smooth">
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                onClick={() => handleSubmit(formValues)}
                shape="smooth"
                variant="solid"
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </Modal>
  );
};
export const FormModal = FormModalBase;
