import { Icon } from "@iconify/react";
import type React from "react";
import { useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { capitalize } from "../utils/text";

const options = ["url", "email", "submit"];
const methods = ["GET", "POST"];

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
  const props = node.data.props;
  const key = props.propId;

  const [url, setUrl] = useState(props.url);
  const [email, setEmail] = useState(props.email);
  const [submitUrl, setSubmitUrl] = useState(props.submitUrl);
  const [submitMethod, setSubmitMethod] = useState(props.submitMethod ?? "GET");
  const [submitAsync, setSubmitAsync] = useState(props.submitAsync);
  const [newTab, setNewTab] = useState(props.newTab);
  const [type, setType] = useState(props.type ?? "url");

  return (
    <Modal open={open} size="md">
      <Card shape="smooth">
        <div className="flex items-center justify-between p-4 md:p-6">
          <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
            Update Button
          </p>
          <IconButton onClick={() => setOpen(false)} shape="full" size="sm">
            <Icon className="h-4 w-4" icon="lucide:x" />
          </IconButton>
        </div>
        <div className="p-4 md:px-6">
          <div className="mt-4 mb-4">
            <div>
              <div className="flex items-start justify-start gap-5">
                <div className="w-1/3">
                  <ListBox
                    label="Type"
                    options={options.map((o) => {
                      return { value: o, label: capitalize(o) };
                    })}
                    selected={{
                      value: type,
                      label: capitalize(String(type)),
                    }}
                    setSelected={(e) => setType(e.value)}
                  />
                </div>
                {type === "url" && (
                  <Input
                    className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm"
                    defaultValue={url as string}
                    label="URL"
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Eg. https://codecanyon.net/user/mashdiv"
                    shape="rounded-sm"
                    type="text"
                  />
                )}
                {type === "email" && (
                  <Input
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm"
                    defaultValue={email as string}
                    label="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Eg. johndoe@example.com"
                    shape="rounded-sm"
                    type="text"
                  />
                )}
                {type === "submit" && (
                  <div className="flex items-end justify-end gap-5">
                    <ListBox
                      label="Method"
                      options={methods.map((o) => {
                        return { value: o, label: o };
                      })}
                      selected={{
                        value: submitMethod,
                        label: submitMethod,
                      }}
                      setSelected={(e) => setSubmitMethod(e.value)}
                    />
                    <Input
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm"
                      defaultValue={submitUrl as string}
                      label="Submit URL"
                      onChange={(e) => setSubmitUrl(e.target.value)}
                      placeholder="Eg. /api/submit"
                      shape="rounded-sm"
                      type="text"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            {type === "url" && (
              <div className="w-full">
                <Checkbox
                  checked={Boolean(newTab)}
                  className="ml-4"
                  label="Open in new tab"
                  onChange={(e) => setNewTab(e.target.checked)}
                />
              </div>
            )}
            {type === "submit" && (
              <div className="w-full">
                <Checkbox
                  checked={Boolean(submitAsync)}
                  className="ml-4"
                  label="Submit Async"
                  onChange={(e) => setSubmitAsync(e.target.checked)}
                />
              </div>
            )}
            <div className="flex w-full justify-end gap-2">
              <Button onClick={() => setOpen(false)} shape="smooth">
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  actions.setProp(node.id, (prop: Record<string, unknown>) => {
                    const keyStr = String(key);
                    if (!prop[keyStr]) {
                      prop[keyStr] = {};
                    }
                    (prop[keyStr] as any).type = String(type).toLowerCase();
                    (prop[keyStr] as any).url = url;
                    (prop[keyStr] as any).email = email;
                    (prop[keyStr] as any).newTab = newTab;
                    (prop[keyStr] as any).submitUrl = submitUrl;
                    (prop[keyStr] as any).submitMethod = submitMethod;
                    (prop[keyStr] as any).submitAsync = submitAsync;
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
        </div>
      </Card>
    </Modal>
  );
};

export default Dialog;
