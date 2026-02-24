import { camelCase } from "lodash";
import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";

export default class depositWallet extends Model {
  id!: string;
  title!: string;
  address!: string;
  network!: string;
  instructions!: string;
  image?: string;
  fixedFee!: number;
  percentageFee!: number;
  minAmount!: number;
  maxAmount!: number;
  customFields?: string;
  status?: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;

  public static initModel(
    sequelize: Sequelize.Sequelize
  ): typeof depositWallet {
    return depositWallet.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: "title: Title must not be empty" },
          },
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: "title: Address must not be empty" },
          },
        },
        network: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: "title: Network must not be empty" },
          },
        },
        instructions: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: "instructions: Instructions must not be empty" },
          },
        },
        image: {
          type: DataTypes.STRING(1000),
          allowNull: true,
          validate: {
            is: {
              args: ["^/(uploads|img)/.*$", "i"],
              msg: "image: Image must be a valid URL",
            },
          },
        },
        fixedFee: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: { msg: "fixedFee: Fixed fee must be a valid number" },
            min: { args: [0], msg: "fixedFee: Fixed fee cannot be negative" },
          },
        },
        percentageFee: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: "percentageFee: Percentage fee must be a valid number",
            },
            min: {
              args: [0],
              msg: "percentageFee: Percentage fee cannot be negative",
            },
          },
        },
        minAmount: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          defaultValue: 0,
          validate: {
            isFloat: {
              msg: "minAmount: Minimum amount must be a valid number",
            },
            min: {
              args: [0],
              msg: "minAmount: Minimum amount cannot be negative",
            },
          },
        },
        maxAmount: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            isFloat: {
              msg: "maxAmount: Maximum amount must be a valid number",
            },
          },
        },
        customFields: {
          type: DataTypes.JSON,
          allowNull: true,
          get() {
            const rawData = this.getDataValue("customFields");
            return rawData ? JSON.parse(rawData) : null;
          },
          set(fields: CustomField[]) {
            this.setDataValue(
              "customFields",
              JSON.stringify(
                fields
                  .filter((field) => field.title && field.title !== "")
                  .map((field) => ({
                    name: camelCase(field.title.trim()),
                    title: field.title.trim(),
                    type: field.type,
                    required: field.required,
                  }))
              )
            );
          },
        },
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          validate: {
            isBoolean: { msg: "status: Status must be a boolean value" },
          },
        },
      },
      {
        sequelize,
        modelName: "depositWallet",
        tableName: "deposit_wallet",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
        ],
      }
    );
  }
  public static associate(_models: any) {}
}
