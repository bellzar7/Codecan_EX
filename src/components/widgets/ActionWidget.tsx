import type React from "react";
import type { FC } from "react";
import Button from "@/components/elements/base/button/Button";
import { MashImage } from "@/components/elements/MashImage";

interface ActionWidgetProps {
  image: string;
  title: string;
  text?: string;
  buttons?: React.ReactNode;
  btnText?: string;
}

const ActionWidget: FC<ActionWidgetProps> = ({
  title,
  text,
  image,
  buttons,
  btnText = "Open Help Center",
}) => {
  return (
    <div className="rounded-lg border border-muted-200 bg-white px-6 py-8 dark:border-muted-800 dark:bg-muted-900">
      <MashImage
        alt="Widget picture"
        className="mx-auto w-full max-w-[280px]"
        height={150}
        src={image}
        width={210}
      />
      <div className="py-4 text-center">
        <h3 className="mb-2 font-medium font-sans text-lg text-muted-800 leading-tight dark:text-muted-100">
          {title}
        </h3>
        <p className="text-center font-sans text-muted-400 text-sm">
          {text
            ? text
            : `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Qui non
          moveatur et offensione`}
        </p>
      </div>

      {buttons ? (
        buttons
      ) : (
        <Button className="w-full" color="primary">
          {btnText}
        </Button>
      )}
    </div>
  );
};

export default ActionWidget;
