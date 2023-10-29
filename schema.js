const { DataTypes, Sequelize } = require( "sequelize");

const sequelize = new Sequelize("kafka_tutorial", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

const Order = sequelize.define("orders", {
  userLineUid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // pending -> created order
  // success -> sent message successful
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Product = sequelize.define("products", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// relations
Product.hasMany(Order);
Order.belongsTo(Product);

module.exports = {
  Order,
  Product,
  sequelize,
};
