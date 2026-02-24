interface depositWalletAttributes {
  id: string;
  title: string;
  address: string;
  instructions: string;
  image?: string;
  fixedFee: number;
  percentageFee: number;
  minAmount: number;
  maxAmount: number;
  customFields?: string;
  status?: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

type depositWalletPk = "id";
type depositWalletId = depositWallet[depositWalletPk];
type depositWalletOptionalAttributes =
  | "id"
  | "image"
  | "fixedFee"
  | "percentageFee"
  | "minAmount"
  | "customFields"
  | "status"
  | "createdAt"
  | "deletedAt"
  | "updatedAt";
type depositWalletCreationAttributes = Optional<
  depositWalletAttributes,
  depositWalletOptionalAttributes
>;
