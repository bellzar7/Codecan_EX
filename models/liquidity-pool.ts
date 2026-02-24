import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";
import type liquidityPoolTransaction from "./liquidity-pool-transaction";
import type { liquidityPoolTransactionId } from "./liquidity-pool-transaction";

export interface liquidityPoolAttributes {
  id: string;
  symbol: string;
  currency: string;
  pair: string;
  baseBalance: number;
  quoteBalance: number;
  baseInOrder: number;
  quoteInOrder: number;
  spreadPercentage: number;
  minOrderSize: number;
  maxOrderSize: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type liquidityPoolPk = "id";
export type liquidityPoolId = liquidityPool[liquidityPoolPk];
export type liquidityPoolOptionalAttributes =
  | "id"
  | "baseBalance"
  | "quoteBalance"
  | "baseInOrder"
  | "quoteInOrder"
  | "spreadPercentage"
  | "minOrderSize"
  | "maxOrderSize"
  | "isActive"
  | "createdAt"
  | "updatedAt";
export type liquidityPoolCreationAttributes = Optional<
  liquidityPoolAttributes,
  liquidityPoolOptionalAttributes
>;

export default class liquidityPool
  extends Model<liquidityPoolAttributes, liquidityPoolCreationAttributes>
  implements liquidityPoolAttributes
{
  id!: string;
  symbol!: string;
  currency!: string;
  pair!: string;
  baseBalance!: number;
  quoteBalance!: number;
  baseInOrder!: number;
  quoteInOrder!: number;
  spreadPercentage!: number;
  minOrderSize!: number;
  maxOrderSize!: number;
  isActive!: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // liquidityPool hasMany liquidityPoolTransaction via poolId
  liquidityPoolTransactions!: liquidityPoolTransaction[];
  getLiquidityPoolTransactions!: Sequelize.HasManyGetAssociationsMixin<liquidityPoolTransaction>;
  setLiquidityPoolTransactions!: Sequelize.HasManySetAssociationsMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  addLiquidityPoolTransaction!: Sequelize.HasManyAddAssociationMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  addLiquidityPoolTransactions!: Sequelize.HasManyAddAssociationsMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  createLiquidityPoolTransaction!: Sequelize.HasManyCreateAssociationMixin<liquidityPoolTransaction>;
  removeLiquidityPoolTransaction!: Sequelize.HasManyRemoveAssociationMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  removeLiquidityPoolTransactions!: Sequelize.HasManyRemoveAssociationsMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  hasLiquidityPoolTransaction!: Sequelize.HasManyHasAssociationMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  hasLiquidityPoolTransactions!: Sequelize.HasManyHasAssociationsMixin<
    liquidityPoolTransaction,
    liquidityPoolTransactionId
  >;
  countLiquidityPoolTransactions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof liquidityPool {
    return liquidityPool.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        symbol: {
          type: DataTypes.STRING(191),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: "symbol: Symbol cannot be empty" },
          },
        },
        currency: {
          type: DataTypes.STRING(191),
          allowNull: false,
          validate: {
            notEmpty: { msg: "currency: Currency cannot be empty" },
          },
        },
        pair: {
          type: DataTypes.STRING(191),
          allowNull: false,
          validate: {
            notEmpty: { msg: "pair: Pair cannot be empty" },
          },
        },
        baseBalance: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: { msg: "baseBalance: Base balance must be a number" },
            min: {
              args: [0],
              msg: "baseBalance: Base balance cannot be negative",
            },
          },
        },
        quoteBalance: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: { msg: "quoteBalance: Quote balance must be a number" },
            min: {
              args: [0],
              msg: "quoteBalance: Quote balance cannot be negative",
            },
          },
        },
        baseInOrder: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: { msg: "baseInOrder: Base in order must be a number" },
            min: {
              args: [0],
              msg: "baseInOrder: Base in order cannot be negative",
            },
          },
        },
        quoteInOrder: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: { msg: "quoteInOrder: Quote in order must be a number" },
            min: {
              args: [0],
              msg: "quoteInOrder: Quote in order cannot be negative",
            },
          },
        },
        spreadPercentage: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0.1,
          validate: {
            isFloat: {
              msg: "spreadPercentage: Spread percentage must be a number",
            },
            min: {
              args: [0],
              msg: "spreadPercentage: Spread percentage cannot be negative",
            },
          },
        },
        minOrderSize: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: "minOrderSize: Minimum order size must be a number",
            },
            min: {
              args: [0],
              msg: "minOrderSize: Minimum order size cannot be negative",
            },
          },
        },
        maxOrderSize: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: "maxOrderSize: Maximum order size must be a number",
            },
            min: {
              args: [0],
              msg: "maxOrderSize: Maximum order size cannot be negative",
            },
          },
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: "liquidityPool",
        tableName: "liquidity_pool",
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "liquidityPoolIdKey",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "liquidityPoolSymbolKey",
            unique: true,
            using: "BTREE",
            fields: [{ name: "symbol" }],
          },
        ],
      }
    );
  }

  static associate(models: Record<string, unknown>): void {
    liquidityPool.hasMany(
      models.liquidityPoolTransaction as typeof liquidityPoolTransaction,
      {
        as: "liquidityPoolTransactions",
        foreignKey: "poolId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      }
    );
  }
}
