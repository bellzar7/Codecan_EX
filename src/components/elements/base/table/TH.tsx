import type { FC } from "react";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TH: FC<TableHeadProps> = ({
  className: classes = "",
  children,
  ...props
}) => (
  <th
    className={`bg-transparent px-3 py-4 text-start font-medium font-sans text-muted-400 text-xs uppercase tracking-wide ${classes}`}
    {...props}
  >
    {children}
  </th>
);

export default TH;
