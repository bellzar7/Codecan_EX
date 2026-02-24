import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";

export interface twdMarketAttributes {
  id: string;
  symbol: string;
  type: "forex" | "stocks" | "indices";
  name?: string;
  currency: string;
  pair?: string;
  exchange?: string;
  metadata?: string;
  isTrending?: boolean;
  isHot?: boolean;
  status: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

export type twdMarketCreationAttributes = Partial<twdMarketAttributes>;

export default class twdMarket
  extends Model<twdMarketAttributes, twdMarketCreationAttributes>
  implements twdMarketAttributes
{
  id!: string;
  symbol!: string;
  type!: "forex" | "stocks" | "indices";
  name?: string;
  currency!: string;
  pair?: string;
  exchange?: string;
  metadata?: string;
  isTrending?: boolean;
  isHot?: boolean;
  status!: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;

  public static initModel(sequelize: Sequelize.Sequelize): typeof twdMarket {
    return twdMarket.init(
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
          unique: "twdMarketSymbolKey",
          validate: {
            notEmpty: { msg: "symbol: Symbol must not be empty" },
          },
        },
        type: {
          type: DataTypes.ENUM("forex", "stocks", "indices"),
          allowNull: false,
          validate: {
            isIn: {
              args: [["forex", "stocks", "indices"]],
              msg: "type: Type must be one of ['forex', 'stocks', 'indices']",
            },
          },
        },
        name: {
          type: DataTypes.STRING(191),
          allowNull: true,
          validate: {
            len: {
              args: [0, 191],
              msg: "name: Name must be between 0 and 191 characters",
            },
          },
        },
        currency: {
          type: DataTypes.STRING(191),
          allowNull: false,
          validate: {
            notEmpty: { msg: "currency: Currency must not be empty" },
          },
        },
        pair: {
          type: DataTypes.STRING(191),
          allowNull: true,
        },
        exchange: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            len: {
              args: [0, 50],
              msg: "exchange: Exchange must be between 0 and 50 characters",
            },
          },
        },
        metadata: {
          type: DataTypes.TEXT,
          allowNull: true,
          set(value) {
            this.setDataValue("metadata", JSON.stringify(value));
          },
          get() {
            const value = this.getDataValue("metadata");
            return value ? JSON.parse(value) : null;
          },
        },
        isTrending: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        isHot: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          validate: {
            isBoolean: { msg: "status: Status must be a boolean value" },
          },
        },
      },
      {
        sequelize,
        modelName: "twdMarket",
        tableName: "twd_market",
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
            name: "twdMarketSymbolKey",
            unique: true,
            using: "BTREE",
            fields: [{ name: "symbol" }],
          },
        ],
      }
    );
  }
  public static associate(_models: any) {}
}
