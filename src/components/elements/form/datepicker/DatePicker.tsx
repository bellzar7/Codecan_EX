import { Icon, type IconifyIcon } from "@iconify/react";
import { cva } from "class-variance-authority";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isBefore,
  isEqual,
  isSameMonth,
  isToday,
  isValid,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { useTranslation } from "next-i18next";
import React, { type FC, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const numberRegex = /^-?\d*\.?\d+$/;
const pickerStyles = cva(
  "mx-auto flex w-full items-center justify-center py-2 text-xs",
  {
    variants: {
      isToday: { true: "", false: "" },
      isSelected: { true: "", false: "" },
      isSameMonth: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        className: "font-medium",
      },
      {
        isToday: true,
        className: "bg-primary-500 font-medium text-white",
      },
      {
        isSelected: true,
        isToday: true,
        className: "bg-primary-500 text-white",
      },
      {
        isSelected: false,
        isToday: false,
        isSameMonth: true,
        className:
          "text-center hover:bg-muted-100 hover:text-primary-500 disabled:cursor-not-allowed disabled:text-muted-300 dark:disabled:text-muted-700 dark:hover:bg-muted-800 dark:disabled:hover:bg-transparent",
      },
      {
        isSelected: false,
        isToday: false,
        isSameMonth: false,
        className:
          "text-muted-300 disabled:cursor-not-allowed dark:hover:bg-muted-800 dark:disabled:hover:bg-transparent",
      },
      {
        isSelected: true,
        isToday: false,
        className: "bg-primary-500 text-white",
      },
    ],
  }
);
interface DatePickerProps
  extends Omit<React.HTMLProps<HTMLInputElement>, "size" | "value"> {
  value: Date | null;
  valueFormat?: string;
  icon?: IconifyIcon | string;
  label?: string;
  shape?: "straight" | "rounded-sm" | "smooth" | "curved" | "full";
  size?: "sm" | "md" | "lg";
  color?: "default" | "contrast" | "muted" | "mutedContrast";
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
  loading?: boolean;
}
const DatePicker: FC<DatePickerProps> = ({
  value,
  valueFormat = "yyyy-MM-dd",
  icon,
  shape = "smooth",
  size = "md",
  color = "default",
  label,
  placeholder,
  minDate,
  disabled,
  loading = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayInput, setOverlayInput] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(pickerRef, () => setPickerOpen(false));
  const pickerModalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(pickerModalRef, () => setShowOverlay(false));
  const today = startOfToday();
  const initialDate = value && isValid(value) ? value : today;

  const [selectedDay, setSelectedDay] = useState<Date>(initialDate);
  const [selectedHour, setSelectedHour] = useState<number>(
    initialDate.getHours()
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    initialDate.getMinutes()
  );
  const [currentMonth, setCurrentMonth] = useState<string>(
    format(initialDate, "MMM-yyyy")
  );
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const { onChange } = props;
  useEffect(() => {
    if (value && isValid(value) && !isEqual(value, selectedDay)) {
      setSelectedDay(value);
    }
  }, [value]);
  // useEffect(() => {
  //   if (onChange) {
  //     onChange({
  //       target: {
  //         value: selectedDay,
  //       },
  //     } as any);
  //   }
  // }, [selectedDay]);
  useEffect(() => {
    const updatedDate = new Date(selectedDay);
    updatedDate.setHours(selectedHour);
    updatedDate.setMinutes(selectedMinute);
    if (onChange) {
      onChange({
        target: {
          value: updatedDate,
        },
      } as any);
    }
  }, [selectedDay, selectedHour, selectedMinute]);

  const displayValue = useMemo(() => {
    if (!isValid(selectedDay)) return "";
    const dateWithTime = new Date(selectedDay);
    dateWithTime.setHours(selectedHour);
    dateWithTime.setMinutes(selectedMinute);
    return format(dateWithTime, valueFormat + " HH:mm");
  }, [selectedDay, selectedHour, selectedMinute, valueFormat]);

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });
  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };
  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };
  const handleFocused = () => {
    setPickerOpen(true);
    setTimeout(() => {
      pickerModalRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);
  };
  const handleOverlayYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if ((value != "" && !numberRegex.test(value)) || value.length > 4) {
      return;
    }
    setOverlayInput(value);
  };
  const handleConfirm = () => {
    const newDate = new Date().setFullYear(+overlayInput);
    setCurrentMonth(format(newDate, "MMM-yyyy"));
    setShowOverlay(false);
  };
  const handleGotoMonth = (month: number) => {
    const year =
      numberRegex.test(overlayInput) && overlayInput.length == 4
        ? +overlayInput
        : today.getFullYear();
    const newDate = new Date().setFullYear(year, month);
    setCurrentMonth(format(newDate, "MMM-yyyy"));
    setShowOverlay(false);
  };
  const isdisabled = (date: Date) => {
    if (minDate) {
      return isBefore(date, minDate);
    }
    return false;
  };
  return (
    <div className="relative w-full font-sans" ref={pickerRef}>
      <Input
        color={color}
        disabled={disabled}
        icon={icon}
        label={label}
        loading={loading}
        onFocus={handleFocused}
        placeholder={placeholder}
        shape={shape}
        size={size}
        type="text"
        value={displayValue}
        {...props}
      />
      <div
        className={`absolute top-full left-0 isolate z-10 mt-2 w-full border border-muted-200 bg-white p-5 shadow-lg shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/20 ${pickerOpen ? "block" : "hidden"}
          ${shape === "rounded-sm" ? "rounded-md" : ""}     
          ${shape === "smooth" ? "rounded-lg" : ""}    
          ${shape === "curved" ? "rounded-xl" : ""}    
          ${shape === "full" ? "rounded-xl" : ""}   
        `}
        ref={pickerModalRef}
      >
        <div className="w-full text-muted-800 text-xs dark:text-muted-100">
          <div className="flex items-center justify-between">
            <button
              className="flex flex-none items-center justify-center p-1.5 text-muted-500 hover:text-muted-400"
              onClick={previousMonth}
              type="button"
            >
              <span className="sr-only">{t("Previous month")}</span>
              <Icon
                aria-hidden="true"
                className="h-5 w-5"
                icon="lucide:chevron-left"
              />
            </button>
            <button
              className="font-medium text-muted-800 text-sm hover:underline dark:text-muted-100"
              onClick={() => setShowOverlay(true)}
              type="button"
            >
              {format(firstDayCurrentMonth, "MMMM yyyy")}
            </button>
            <button
              className="flex flex-none items-center justify-center p-1.5 text-muted-500 hover:text-muted-400"
              onClick={nextMonth}
              type="button"
            >
              <span className="sr-only">{t("Next month")}</span>
              <Icon
                aria-hidden="true"
                className="h-5 w-5"
                icon="lucide:chevron-right"
              />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7">
            {dayLabels.map((dayLabel, index) => (
              <div
                className="py-2 text-center font-normal text-[0.52rem] text-muted-400 uppercase"
                key={index}
              >
                {dayLabel}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-sm">
            {days.map((day, dayIdx) => (
              <div
                className={`${
                  dayIdx === 0 ? colStartClasses[getDay(day)] : ""
                }`}
                key={day.toString()}
              >
                <button
                  className={`${pickerStyles({
                    isSelected: isEqual(day, selectedDay),
                    isToday: isToday(day),
                    isSameMonth: isSameMonth(day, firstDayCurrentMonth),
                  })}
                  ${shape === "rounded-sm" ? "rounded-md" : ""}     
                  ${shape === "smooth" ? "rounded-lg" : ""}    
                  ${shape === "curved" ? "rounded-xl" : ""}    
                  ${shape === "full" ? "rounded-full" : ""} 
                  `}
                  disabled={isdisabled(day)}
                  onClick={() => {
                    setSelectedDay(day);
                    setPickerOpen(false);
                  }}
                  type="button"
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>
                    {format(day, "d")}
                  </time>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-lg bg-white p-5 text-white transition-all duration-300 dark:bg-muted-950 ${showOverlay ? "z-2 opacity-100" : "-z-1 opacity-0"} 
          `}
        >
          <div>
            <input
              className="mx-auto block w-4/5 border-muted-200 border-b bg-transparent py-1 text-center text-base text-muted-800 focus:outline-hidden dark:border-muted-800 dark:text-muted-100"
              onChange={handleOverlayYear}
              pattern="(^\d{4}$)|(^\d{4}-\d{2}-\d{2}$)"
              placeholder={t("4-digit year")}
              type="text"
              value={overlayInput}
            />

            <button
              className="absolute top-0 right-2 p-2 text-2xl opacity-70"
              onClick={() => setShowOverlay(false)}
              type="button"
            >
              {t("times")}
            </button>
          </div>

          <div className="grid grid-cols-3">
            {months.map((month, index) => (
              <button
                className={`py-2 text-muted-800/70 text-sm hover:bg-muted-100 hover:text-muted-800 dark:text-muted-400 dark:hover:bg-muted-800 dark:hover:text-white ${shape === "rounded-sm" ? "rounded-md" : ""}     
                  ${shape === "smooth" ? "rounded-lg" : ""}    
                  ${shape === "curved" ? "rounded-xl" : ""}    
                  ${shape === "full" ? "rounded-full" : ""} 
                `}
                data-month={index + 1}
                key={index}
                onClick={() => handleGotoMonth(index)}
                type="button"
              >
                {month}
              </button>
            ))}
          </div>
          <div className="absolute bottom-[5%] left-[50%] flex translate-x-[-50%] gap-4">
            <div>
              <label className="block text-muted-500 text-xs dark:text-muted-400">
                {t("Hour")}
              </label>
              <select
                className="mt-1 w-20 rounded-md border border-muted-200 bg-white px-2 py-1 text-sm dark:border-muted-700 dark:bg-muted-900"
                onChange={(e) =>
                  setSelectedHour(Number.parseInt(e.target.value))
                }
                value={selectedHour}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-muted-500 text-xs dark:text-muted-400">
                {t("Minute")}
              </label>
              <select
                className="mt-1 w-20 rounded-md border border-muted-200 bg-white px-2 py-1 text-sm dark:border-muted-700 dark:bg-muted-900"
                onChange={(e) =>
                  setSelectedMinute(Number.parseInt(e.target.value))
                }
                value={selectedMinute}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            className="mx-auto mb-3 h-auto! px-3! py-[.28rem]!"
            color="primary"
            disabled={overlayInput.length != 4}
            onClick={handleConfirm}
            shape={shape}
            type="button"
          >
            {t("Confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default DatePicker;
