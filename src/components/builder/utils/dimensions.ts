export const isPercentage = (val: string) =>
  typeof val === "string" && val.indexOf("%") > -1;

export const percentToPx = (value: string, comparativeValue: number) => {
  if (value.indexOf("px") > -1 || value === "auto" || !comparativeValue) {
    return value;
  }
  const percent = Number.parseInt(value, 10);
  return `${(percent / 100) * comparativeValue}px`;
};
export const pxToPercent = (value: number, comparativeValue: number) => {
  const val = (Math.abs(value) / comparativeValue) * 100;
  if (value < 0) {
    return -1 * val;
  }
  return Math.round(val);
};
export const getElementDimensions = (element: HTMLElement) => {
  const computedStyle = getComputedStyle(element);

  let height = element.clientHeight;
  height -=
    Number.parseFloat(computedStyle.paddingTop) +
    Number.parseFloat(computedStyle.paddingBottom);

  let width = element.clientWidth; // width with padding
  width -=
    Number.parseFloat(computedStyle.paddingLeft) +
    Number.parseFloat(computedStyle.paddingRight);

  return { width, height };
};
