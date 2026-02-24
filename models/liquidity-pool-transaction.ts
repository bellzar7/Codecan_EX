import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";
import type exchangeOrder from "./exchangeOrder";
import type { exchangeOrderId } from "./exchangeOrder";
import type liquidityPool from "./liquidity-pool";
import type { liquidityPoolId } from "./liquidity-pool";
import type user from "./user";

export type LiquidityPoolTransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "TRADE_BUY"
  | "TRADE_SELL"
  | "ADJUSTMENT";

export interface liquidityPoolTransactionAttributes {
  id: string;
  poolId: string;
  type: LiquidityPoolTransactionType;
  currency: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  userId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export type liquidityPoolTransactionPk = "id";
export type liquidityPoolTransactionId =
  liquidityPoolTransaction[liquidityPoolTransactionPk];
export type liquidityPoolTransactionOptionalAttributes =
  | "id"
  | "orderId"
  | "userId"
  | "description"
  | "metadata"
  | "createdAt";
export type liquidityPoolTransactionCreationAttributes = Optional<
  liquidityPoolTransactionAttributes,
  liquidityPoolTransactionOptionalAttributes
>;

export default class liquidityPoolTransaction
  extends Model<
    liquidityPoolTransactionAttributes,
    liquidityPoolTransactionCreationAttributes
  >
  implements liquidityPoolTransactionAttributes
{
  id!: string;
  poolId!: string;
  type!: LiquidityPoolTransactionType;
  currency!: string;
  amount!: number;
  balanceBefore!: number;
  balanceAfter!: number;
  orderId?: string;
  userId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;

  // liquidityPoolTransaction belongsTo liquidityPool via poolId
  pool!: liquidityPool;
  getPool!: Sequelize.BelongsToGetAssociationMixin<liquidityPool>;
  setPool!: Sequelize.BelongsToSetAssociationMixin<
    liquidityPool,
    liquidityPoolId
  >;
  createPool!: Sequelize.BelongsToCreateAssociationMixin<liquidityPool>;

  // liquidityPoolTransaction belongsTo exchangeOrder via orderId
  order!: exchangeOrder;
  getOrder!: Sequelize.BelongsToGetAssociationMixin<exchangeOrder>;
  setOrder!: Sequelize.BelongsToSetAssociationMixin<
    exchangeOrder,
    exchangeOrderId
  >;
  createOrder!: Sequelize.BelongsToCreateAssociationMixin<exchangeOrder>;

  // liquidityPoolTransaction belongsTo user via userId
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof liquidityPoolTransaction {
    return liquidityPoolTransaction.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        poolId: {
          type: DataTypes.UUID,
          allowNull: false,
          validate: {
            notNull: { msg: "poolId: Pool ID cannot be null" },
            isUUID: { args: 4, msg: "poolId: Pool ID must be a valid UUID" },
          },
        },
        type: {
          type: DataTypes.ENUM(
            "DEPOSIT",
            "WITHDRAW",
            "TRADE_BUY",
            "TRADE_SELL",
            "ADJUSTMENT"
          ),
          allowNull: false,
          validate: {
            isIn: {
              args: [
                [
                  "DEPOSIT",
                  "WITHDRAW",
                  "TRADE_BUY",
                  "TRADE_SELL",
                  "ADJUSTMENT",
                ],
              ],
              msg: "type: Type must be one of DEPOSIT, WITHDRAW, TRADE_BUY, TRADE_SELL, ADJUSTMENT",
            },
          },
        },
        currency: {
          type: DataTypes.STRING(191),
          allowNull: false,
          validate: {
            notEmpty: { msg: "currency: Currency cannot be empty" },
          },
        },
        amount: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            isFloat: { msg: "amount: Amount must be a number" },
          },
        },
        balanceBefore: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            isFloat: { msg: "balanceBefore: Balance before must be a number" },
          },
        },
        balanceAfter: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            isFloat: { msg: "balanceAfter: Balance after must be a number" },
          },
        },
        orderId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          get() {
            const value = this.getDataValue("metadata");
            if (typeof value === "string") {
              return JSON.parse(value);
            }
            return value;
          },
        },
      },
      {
        sequelize,
        modelName: "liquidityPoolTransaction",
        tableName: "liquidity_pool_transaction",
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "liquidityPoolTransactionIdKey",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "idx_lp_transaction_pool",
            using: "BTREE",
            fields: [{ name: "poolId" }],
          },
          {
            name: "idx_lp_transaction_type",
            using: "BTREE",
            fields: [{ name: "type" }],
          },
        ],
      }
    );
  }

  static associate(models: Record<string, unknown>): void {
    liquidityPoolTransaction.belongsTo(
      models.liquidityPool as typeof liquidityPool,
      {
        as: "pool",
        foreignKey: "poolId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }
    );
    liquidityPoolTransaction.belongsTo(
      models.exchangeOrder as typeof exchangeOrder,
      {
        as: "order",
        foreignKey: "orderId",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }
    );
    liquidityPoolTransaction.belongsTo(models.user as typeof user, {
      as: "user",
      foreignKey: "userId",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  }
}
