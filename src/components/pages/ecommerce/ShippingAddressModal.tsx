import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";

const ShippingAddressModal = ({
  open,
  onClose,
  onSubmit,
  address,
  setAddress,
}) => {
  const { t } = useTranslation();

  return (
    <Modal open={open} size="lg">
      <Card shape="smooth">
        <div className="flex items-center justify-between p-4 md:p-6">
          <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
            {t("Shipping Address")}
          </p>
          <IconButton onClick={onClose} shape="full" size="sm">
            <Icon className="h-4 w-4" icon="lucide:x" />
          </IconButton>
        </div>
        <div className="p-4 md:px-6 md:py-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label={t("Name")}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
              placeholder={t("Enter your name")}
              type="text"
              value={address.name}
            />
            <Input
              label={t("Email")}
              onChange={(e) =>
                setAddress({ ...address, email: e.target.value })
              }
              placeholder={t("Enter your email")}
              type="text"
              value={address.email}
            />
            <Input
              label={t("Phone")}
              onChange={(e) =>
                setAddress({ ...address, phone: e.target.value })
              }
              placeholder={t("Enter your phone number")}
              type="text"
              value={address.phone}
            />
            <Input
              label={t("Street")}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              placeholder={t("Enter your street address")}
              type="text"
              value={address.street}
            />
            <Input
              label={t("City")}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              placeholder={t("Enter your city")}
              type="text"
              value={address.city}
            />
            <Input
              label={t("State")}
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value })
              }
              placeholder={t("Enter your state")}
              type="text"
              value={address.state}
            />
            <Input
              label={t("Postal Code")}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              placeholder={t("Enter your postal code")}
              type="text"
              value={address.postalCode}
            />
            <Input
              label={t("Country")}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              placeholder={t("Enter your country")}
              type="text"
              value={address.country}
            />
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex w-full justify-end gap-2">
            <Button onClick={onClose} shape="smooth">
              {t("Cancel")}
            </Button>
            <Button
              color="primary"
              onClick={onSubmit}
              shape="smooth"
              variant="solid"
            >
              {t("Confirm")}
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default ShippingAddressModal;
