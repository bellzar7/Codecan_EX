import type { FC } from "react";

interface LoaderProps {
  thickness?: number;
  classNames?: string;
  size?: number;
}

const Loader: FC<LoaderProps> = ({ thickness = 5, classNames, size = 50 }) => {
  return (
    <span className={classNames}>
      <svg className={"loader"} height={size} viewBox="0 0 50 50" width={size}>
        <circle
          className="path"
          cx="25"
          cy="25"
          fill="none"
          r="20"
          strokeWidth={thickness}
        />
      </svg>
    </span>
  );
};

export default Loader;
