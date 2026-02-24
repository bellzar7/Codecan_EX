import { Icon, type IconifyIcon } from "@iconify/react";
import { type FC, memo } from "react";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: "slash" | "chevron" | "arrow" | "dot";
}

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: IconifyIcon | string;
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items, separator = "slash" }) => {
  return (
    <div>
      <ol
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center whitespace-nowrap"
      >
        {items.map((item, index) => (
          <li
            className={`text-sm ${
              items.length - 1 === index
                ? "text-primary-500 dark:text-primary-400"
                : "text-muted"
            }`}
            key={index}
          >
            {items.length - 1 !== index ? (
              <span className="pointer-events-none flex items-center">
                {item.icon ? (
                  <Icon className="me-1 h-4 w-4 shrink-0" icon={item.icon} />
                ) : (
                  ""
                )}
                <span>{item.title}</span>

                {separator === "slash" ? (
                  <svg
                    aria-hidden="true"
                    className="mx-2 h-5 w-5 shrink-0 text-muted-400 dark:text-muted-600"
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 13L10 3"
                      stroke="currentColor"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  ""
                )}
                {separator === "chevron" ? (
                  <svg
                    className="mx-2 h-3 w-3 shrink-0 text-muted-400 dark:text-muted-600"
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  ""
                )}
                {separator === "dot" ? (
                  <svg
                    className="mx-2 h-3 w-3 shrink-0 text-muted-400 dark:text-muted-600"
                    height="32"
                    viewBox="0 0 24 24"
                    width="32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12.1"
                      cy="12.1"
                      fill="none"
                      r="1"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  ""
                )}
                {separator === "arrow" ? (
                  <svg
                    className="mx-3 h-4 w-4 shrink-0 text-muted-400 dark:text-muted-600"
                    height="32"
                    viewBox="0 0 24 24"
                    width="32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12h14m-7-7l7 7l-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  ""
                )}
              </span>
            ) : (
              <div className="pointer-events-noned flex items-center">
                {item.icon ? (
                  <Icon className="me-1 h-4 w-4 shrink-0" icon={item.icon} />
                ) : (
                  ""
                )}
                <span>{item.title}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default memo(Breadcrumb);
