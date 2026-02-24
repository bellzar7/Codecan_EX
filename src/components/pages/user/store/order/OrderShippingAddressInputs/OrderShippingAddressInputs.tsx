import { useTranslation } from "next-i18next";
import { memo } from "react";
import Input from "@/components/elements/form/input/Input";

const OrderShippingAddressInputsBase = ({
  shippingAddress,
  handleInputChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label={t("Name")}
        name="name"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.name}
      />
      <Input
        label={t("Email")}
        name="email"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.email}
      />
      <Input
        label={t("Phone")}
        name="phone"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.phone}
      />
      <Input
        label={t("Street")}
        name="street"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.street}
      />
      <Input
        label={t("City")}
        name="city"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.city}
      />
      <Input
        label={t("State")}
        name="state"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.state}
      />
      <Input
        label={t("Country")}
        name="country"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.country}
      />
      <Input
        label={t("Postal Code")}
        name="postalCode"
        onChange={handleInputChange}
        type="text"
        value={shippingAddress.postalCode}
      />
    </div>
  );
};

export const OrderShippingAddressInputs = memo(OrderShippingAddressInputsBase);
