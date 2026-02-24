// /api/admin/deposit/wallets/structure.get.ts
import { structureSchema } from "@b/utils/constants";
export const metadata = {
  summary: "Get form structure for deposit wallets",
  operationId: "getDepositMethodsStructure",
  tags: ["Admin", "Deposit Methods"],
  responses: {
    200: {
      description: "Form structure for deposit wallets",
      content: structureSchema,
    },
  },
  permission: "Access Deposit Wallet Management",
};

export const walletStructure = () => {
  const image = {
    type: "file",
    label: "Wallet Image",
    name: "image",
    fileType: "image",
    width: 350,
    height: 262,
    maxSize: 1,
    placeholder: "/img/placeholder.svg",
  };

  const title = {
    type: "input",
    component: "InfoBlock",
    label: "Wallet Title",
    name: "title",
    icon: "ph:wallet-light",
    placeholder: "Enter the wallet title",
  };

  const address = {
    type: "input",
    label: "Wallet Address",
    name: "address",
    icon: "ph:wallet-light",
    placeholder: "Enter the wallet address",
  };

  const network = {
    type: "input",
    label: "Network",
    name: "network",
    icon: "ph:network-light",
    placeholder: "Enter the network name",
  };

  const instructions = {
    type: "textarea",
    label: "Instructions",
    name: "instructions",
    placeholder: "Enter detailed instructions for using this deposit wallet",
  };

  const fixedFee = {
    type: "input",
    label: "Fixed Fee",
    name: "fixedFee",
    placeholder: "Enter the fixed fee for transactions",
    ts: "number",
  };

  const percentageFee = {
    type: "input",
    label: "Percentage Fee",
    name: "percentageFee",
    placeholder: "Enter the percentage fee of transaction amount",
    ts: "number",
  };

  const minAmount = {
    type: "input",
    label: "Minimum Amount",
    name: "minAmount",
    placeholder: "Enter the minimum amount for transactions",
    ts: "number",
  };

  const maxAmount = {
    type: "input",
    label: "Maximum Amount",
    name: "maxAmount",
    placeholder: "Enter the maximum amount for transactions",
    ts: "number",
  };

  const customFields = {
    type: "customFields",
    label: "Custom Fields",
    name: "customFields",
    placeholder: "Enter custom fields for this deposit wallet",
  };

  const status = {
    type: "select",
    label: "Status",
    name: "status",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    ts: "boolean",
  };

  return {
    title,
    address,
    network,
    instructions,
    image,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    customFields,
    status,
  };
};

export default async (): Promise<object> => {
  const {
    title,
    address,
    network,
    instructions,
    image,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    customFields,
    status,
  } = walletStructure();

  return {
    get: [
      {
        fields: [
          {
            ...image,
            width: image.width / 4,
            height: image.width / 4,
          },
          {
            fields: [title],
            grid: "column",
          },
        ],
        className: "card-dashed mb-5 items-center",
      },
      address,
      instructions,
      [fixedFee, percentageFee],
      [minAmount, maxAmount],
      customFields,
      status,
    ],
    set: [
      image,
      title,
      address,
      network,
      instructions,
      [fixedFee, percentageFee],
      [minAmount, maxAmount],
      status,
      customFields,
    ],
  };
};
