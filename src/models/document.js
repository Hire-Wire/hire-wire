// src/models/document.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    docType: {
      type: DataTypes.ENUM('Resume', 'Cover Letter'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Resume', 'Cover Letter']],
          msg: 'docType must be either "Resume" or "Cover Letter".',
        },
        notNull: {
          msg: 'Document type is required.',
        },
      },
    },
    docBody: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Document content must not exceed 2000 characters.',
        },
      },
    },
    jobApplicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'JobApplications',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        isInt: {
          msg: 'jobApplicationId must be an integer.',
        },
        notNull: {
          msg: 'jobApplicationId is required for a Document.',
        },
      },
    },
  }, {
    tableName: 'Documents',
    timestamps: true,
  });

  Document.associate = (models) => {
    Document.belongsTo(models.JobApplication, {
      foreignKey: {
        name: 'jobApplicationId',
        allowNull: false,
      },
      as: 'JobApplication',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Document;
};
