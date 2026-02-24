import type React from "react";
import Editor from "./editor/Editor";

interface ContentProviderBaseProps {
  data: unknown;
}

const ContentProviderBase: React.FC<ContentProviderBaseProps> = ({ data }) => {
  return (
    <div className="h-full">
      <Editor data={data} />
    </div>
  );
};

interface ContentProviderProps {
  data?: unknown;
}

export const EditorProvider: React.FC<ContentProviderProps> = () => (
  <ContentProviderBase data={null} />
);

export const ContentProvider: React.FC<ContentProviderProps> = ({ data }) => (
  <ContentProviderBase data={data} />
);
