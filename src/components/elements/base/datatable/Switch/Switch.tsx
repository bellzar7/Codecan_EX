import type React from "react";
import { useCallback, useEffect, useState } from "react";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import $fetch from "@/utils/api";
import type { SwitchProps } from "./Switch.types";

const SwitchBase: React.FC<SwitchProps> = ({
  initialState,
  endpoint,
  active = true,
  disabled = false,
  onUpdate,
  field = "status",
}) => {
  const [isEnabled, setIsEnabled] = useState(initialState);

  useEffect(() => {
    setIsEnabled(initialState);
  }, [initialState]);

  const handleChange = useCallback(async () => {
    const newValue = !isEnabled;
    const { error } = await $fetch({
      url: endpoint as string,
      method: "PUT",
      body: { [field]: newValue ? active : disabled },
    });

    if (!error) {
      setIsEnabled(newValue);
      if (onUpdate) {
        onUpdate(newValue);
      }
    }
  }, [isEnabled, active, disabled, endpoint, onUpdate, field]);

  return (
    <ToggleSwitch
      checked={isEnabled}
      color={isEnabled ? "success" : "danger"}
      id={endpoint}
      onChange={handleChange}
    />
  );
};

export const Switch = SwitchBase;
