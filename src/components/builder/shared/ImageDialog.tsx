import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import { imageUploader } from "@/utils/upload";

interface ContentProps {
  url: string;
  text: string;
  setText: (text: string) => void;
  setUrl(url: string): void;
  onChange: () => void;
}

const Content: React.FC<ContentProps> = ({
  url,
  text,
  setText,
  onChange,
  setUrl,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleRemoveFile = () => {
    setText("");
    onChange();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4 mb-4">
      <div ref={inputRef}>
        <InputFile
          acceptedFileTypes={[
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/gif",
            "image/svg+xml",
            "image/webp",
          ]}
          bordered
          color="default"
          id="image"
          label={`${t("Max File Size")}: ${16} MB`}
          maxFileSize={16}
          onChange={(files) => {
            if (files.length) {
              imageUploader({
                file: files[0],
                dir: "theme",
                size: {
                  maxWidth: 1980,
                  maxHeight: 1080,
                },
              }).then((response) => {
                if (response.success) {
                  setUrl(response.url);
                }
              });
            }
          }}
          onRemoveFile={handleRemoveFile}
          preview={url && url !== "" ? url : null}
          previewPlaceholder="/img/placeholder.svg"
        />
        <div className="my-4 flex justify-center">OR</div>
        <div className="mb-4 flex items-end justify-center gap-2">
          <Input
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm"
            label="URL"
            onChange={(e) => setText(e.target.value)}
            placeholder="Eg. https://www.w3schools.com/html/pic_trulli.jpg"
            shape="rounded-sm"
            type="text"
            value={text}
          />
          <Button
            color="primary"
            disabled={text === ""}
            onClick={onChange}
            shape="rounded-sm"
            variant="solid"
          >
            Set
          </Button>
        </div>
      </div>
    </div>
  );
};

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  node: {
    id: string;
    dom?: { src?: string };
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
  const propId = String(props.propId);

  const [url, setUrl] = useState(
    (props[propId] as any)?.url ?? (node.dom as any)?.src
  );
  const [text, setText] = useState(url);

  const onChange = () => {
    setUrl(text);
  };

  return (
    <Modal open={open} size="xl">
      <Card shape="smooth">
        <div className="flex items-center justify-between p-4 md:p-6">
          <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
            Upload Image
          </p>
          <IconButton onClick={() => setOpen(false)} shape="full" size="sm">
            <Icon className="h-4 w-4" icon="lucide:x" />
          </IconButton>
        </div>
        <div className="p-4 md:px-6 md:py-8">
          <Content
            onChange={onChange}
            setText={setText}
            setUrl={(e) => {
              setText(e);
              setUrl(e);
            }}
            text={text}
            url={url}
          />
        </div>
        <div className="p-4 md:p-6">
          <div className="flex w-full justify-end gap-2">
            <Button onClick={() => setOpen(false)} shape="smooth">
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={!url}
              onClick={() => {
                actions.setProp(node.id, (prop: Record<string, unknown>) => {
                  if (!prop[propId]) {
                    prop[propId] = {};
                  }
                  (prop[propId] as any).url = url;
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
