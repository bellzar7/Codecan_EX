import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";
import type user from "./user";

export interface twdOrderAttributes {
  id: string;
  userId: string;
  symbol: string;
  type: "MARKET" | "LIMIT";
  side: "BUY" | "SELL";
  status: "OPEN" | "CLOSED" | "CANCELED" | "EXPIRED" | "REJECTED";
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  cost: number;
  fee: number;
  feeCurrency?: string;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

export type twdOrderCreationAttributes = Partial<twdOrderAttributes>;

export default class twdOrder
  extends Model<twdOrderAttributes, twdOrderCreationAttributes>
  implements twdOrderAttributes
{
  id!: string;
  userId!: string;
  symbol!: string;
  type!: "MARKET" | "LIMIT";
  side!: "BUY" | "SELL";
  status!: "OPEN" | "CLOSED" | "CANCELED" | "EXPIRED" | "REJECTED";
  price!: number;
  amount!: number;
  filled!: number;
  remaining!: number;
  cost!: number;
  fee!: number;
  feeCurrency?: string;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;

  // twdOrder belongsTo user via userId
  user!: user;
  getUser!: Sequelize.BelongsToGetAssociationMixin<user>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<user, userId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<user>;

  public static initModel(sequelize: Sequelize.Sequelize): typeof twdOrder {
    return twdOrder.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          validate: {
            notNull: { msg: "userId: User ID cannot be null" },
            isUUID: { args: 4, msg: "userId: User ID must be a valid UUID" },
          },
        },
        symbol: {
          type: DataTypes.STRING(191),
          allowNull: false,
          validate: {
            notEmpty: { msg: "symbol: Symbol must not be empty" },
          },
        },
        type: {
          type: DataTypes.ENUM("MARKET", "LIMIT"),
          allowNull: false,
          validate: {
            isIn: {
              args: [["MARKET", "LIMIT"]],
              msg: "type: Type must be one of ['MARKET', 'LIMIT']",
            },
          },
        },
        side: {
          type: DataTypes.ENUM("BUY", "SELL"),
          allowNull: false,
          validate: {
            isIn: {
              args: [["BUY", "SELL"]],
              msg: "side: Side must be one of ['BUY', 'SELL']",
            },
          },
        },
        status: {
          type: DataTypes.ENUM(
            "OPEN",
            "CLOSED",
            "CANCELED",
            "EXPIRED",
            "REJECTED"
          ),
          allowNull: false,
          defaultValue: "OPEN",
          validate: {
            isIn: {
              args: [["OPEN", "CLOSED", "CANCELED", "EXPIRED", "REJECTED"]],
              msg: "status: Status must be one of ['OPEN', 'CLOSED', 'CANCELED', 'EXPIRED', 'REJECTED']",
            },
          },
        },
        price: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          validate: {
            isDecimal: { msg: "price: Price must be a decimal number" },
          },
        },
        amount: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          validate: {
            isDecimal: { msg: "amount: Amount must be a decimal number" },
          },
        },
        filled: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          defaultValue: 0,
          validate: {
            isDecimal: { msg: "filled: Filled must be a decimal number" },
          },
        },
        remaining: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          validate: {
            isDecimal: { msg: "remaining: Remaining must be a decimal number" },
          },
        },
        cost: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          validate: {
            isDecimal: { msg: "cost: Cost must be a decimal number" },
          },
        },
        fee: {
          type: DataTypes.DECIMAL(30, 15),
          allowNull: false,
          defaultValue: 0,
          validate: {
            isDecimal: { msg: "fee: Fee must be a decimal number" },
          },
        },
        feeCurrency: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "twdOrder",
        tableName: "twd_order",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "twdOrderUserIdFkey",
            using: "BTREE",
            fields: [{ name: "userId" }],
          },
          {
            name: "twdOrderSymbol",
            using: "BTREE",
            fields: [{ name: "symbol" }],
          },
          {
            name: "twdOrderStatus",
            using: "BTREE",
            fields: [{ name: "status" }],
          },
        ],
      }
    );
  }

  public static associate(models: any) {
    twdOrder.belongsTo(models.user, {
      as: "user",
      foreignKey: "userId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}
