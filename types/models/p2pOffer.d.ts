interface p2pOfferAttributes {
  id: string;
  userId: string;
  nameToDisplay?: string;
  avatarToDisplay?: string | null;
  userIds: string[] | null;
  walletType: "FIAT" | "SPOT" | "ECO";
  currency: string;
  chain?: string;
  amount: number;
  minAmount: number;
  maxAmount?: number;
  inOrder: number;
  price: number;
  paymentMethodId: string;
  additionalPaymentMethodIds: string[] | null;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

type p2pOfferPk = "id";
type p2pOfferId = p2pOffer[p2pOfferPk];
type p2pOfferOptionalAttributes =
  | "id"
  | "nameToDisplay"
  | "walletType"
  | "chain"
  | "minAmount"
  | "maxAmount"
  | "inOrder"
  | "status"
  | "createdAt"
  | "deletedAt"
  | "updatedAt";
type p2pOfferCreationAttributes = Optional<
  p2pOfferAttributes,
  p2pOfferOptionalAttributes
>;
