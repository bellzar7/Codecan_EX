import { Icon } from "@iconify/react";
import type React from "react";
import { useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  node: {
    id: string;
    data: {
      props: Record<string, unknown>;
    };
  };
  actions: {
    setProp: (
      nodeId: string,
      callback: (props: Record<string, unknown>) => void
    ) => void;
  };
}

const Dialog: React.FC<DialogProps> = ({ open, setOpen, node, actions }) => {
  const [id, setId] = useState(node.data.props.id);

  return (
    <Modal open={open} size="md">
      <Card shape="smooth">
        <div className="flex items-center justify-between p-4 md:p-6">
          <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
            Update Section Id
          </p>
          <IconButton onClick={() => setOpen(false)} shape="full" size="sm">
            <Icon className="h-4 w-4" icon="lucide:x" />
          </IconButton>
        </div>
        <div className="p-4 md:px-6">
          <Input
            className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm"
            defaultValue={id as string}
            label="Section Id"
            onChange={(e) => setId(e.target.value)}
            placeholder="Eg. section-1"
            shape="rounded-sm"
            type="text"
          />
        </div>
        <div className="p-4 md:p-6">
          <div className="flex w-full justify-end gap-2">
            <Button onClick={() => setOpen(false)} shape="smooth">
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                actions.setProp(node.id, (prop: Record<string, unknown>) => {
                  prop.id = id;
                });
                setOpen(false);
              }}
              shape="smooth"
              variant="solid"
            >
              Save
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default Dialog;
