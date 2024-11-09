import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { DataTypes } from 'sequelize';


const saltRounds = 10;
const salt = genSaltSync(saltRounds);

export default (sequelize) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    jobStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true, // Sequelize will automatically add createdAt and updatedAt fields
    hooks: {
      beforeCreate: (user) => {
        user.setDataValue('password', hashSync(user.password, salt));
      },

      beforeUpdate: (user) => {
        if (user.changed('password')) {
          user.setDataValue('password', hashSync(user.password, salt));
        }
      },
    },
  });

  User.prototype.validatePassword = function(password) {
    return compareSync(password, this.password);
  };

  User.prototype.filterDetails = function() {
    const { password, createdAt, updatedAt, ...rest } = this.get();
    return rest;
  };

  User.hasMany(sequelize.models.Experience, {
    foreignKey: 'userId'
  });

  return User;
};

