import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Document = sequelize.define('Document', {
    docId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    docType: {
      type: DataTypes.ENUM('Resume', 'Cover Letter'),
      allowNull: false,
    },
    docBody: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jobApplicationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'JobApplications',
        key: 'jobApplicationID',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'Documents',
    timestamps: true,
  });

  Document.associate = (models) => {
    Document.belongsTo(models.JobApplication, {
      foreignKey: 'jobApplicationID',
      as: 'JobApplication',
    });
  };

  return Document;
};
