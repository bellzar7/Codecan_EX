import type { FC } from "react";

interface TableDataProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
const TD: FC<TableDataProps> = ({
  className: classes = "",
  children,
  ...props
}) => (
  <td
    className={`border-muted-200 border-t px-3 py-4 font-normal font-sans dark:border-muted-800 ${classes}`}
    valign="middle"
    {...props}
  >
    {children}
  </td>
);

export default TD;
