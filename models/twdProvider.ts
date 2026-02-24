import type * as Sequelize from "sequelize";
import { DataTypes, Model } from "sequelize";

export interface twdProviderAttributes {
  id: string;
  name: string;
  title?: string;
  status: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;
}

export type twdProviderCreationAttributes = Partial<twdProviderAttributes>;

export default class twdProvider
  extends Model<twdProviderAttributes, twdProviderCreationAttributes>
  implements twdProviderAttributes
{
  id!: string;
  name!: string;
  title?: string;
  status!: boolean;
  createdAt?: Date;
  deletedAt?: Date;
  updatedAt?: Date;

  public static initModel(sequelize: Sequelize.Sequelize): typeof twdProvider {
    return twdProvider.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(191),
          allowNull: false,
          unique: "twdProviderNameKey",
          defaultValue: "twelvedata",
          validate: {
            notEmpty: { msg: "name: Name must not be empty" },
          },
        },
        title: {
          type: DataTypes.STRING(191),
          allowNull: true,
          defaultValue: "TwelveData",
          validate: {
            len: {
              args: [0, 191],
              msg: "title: Title must be between 0 and 191 characters",
            },
          },
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
        modelName: "twdProvider",
        tableName: "twd_provider",
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
            name: "twdProviderNameKey",
            unique: true,
            using: "BTREE",
            fields: [{ name: "name" }],
          },
        ],
      }
    );
  }
  public static associate(_models: any) {}
}
