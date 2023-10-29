const express = require("express");
const { Kafka } = require("kafkajs");
const { Order, Product, sequelize } = require("./schema");

const app = express();
app.use(express.json());
const port = 8000;

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092", "localhost:9092"],
});

const producer = kafka.producer();

// API
// product list
app.get("/api/products", async (req, res) => {
  try {
    const result = await Product.findAll();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// create product
app.post("/api/create-product", async (req, res) => {
  const productData = req.body;
  try {
    const result = await Product.create(productData);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// place order
app.post("/api/placeorder", async (req, res) => {
  const { userId, productId } = req.body;
  const t = await sequelize.transaction();
  try {
    const product = await Product.findOne(
      {
        where: {
          id: productId,
        },
      },
      { transaction: t }
    );

    if (!product) {
      await t.commit();
      return res.status(404).json({ message: "not found product" });
    }

    if (product.amount <= 0) {
      await t.commit();
      return res.status(404).json({ message: "out of stock" });
    }

    // update product amount
    product.amount -= 1;
    await product.save();

    // create order
    const newOrder = await Order.create(
      {
        userLineUid: userId,
        productId,
        status: "pending",
      },
      { transaction: t }
    );

    producer.connect();
    producer.send({
      topic: "message-order",
      messages: [
        {
          value: JSON.stringify({
            productName: product.name,
            userLineUid: userId,
            orderId: newOrder.id,
          }),
        },
      ],
    });

    await t.commit();
    return res.json({ message: "created order successful", newOrder });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ error });
  }
});

app.listen(port, async () => {
  await sequelize.sync();
  await producer.connect();
  console.log(`Express port@ ${port}`);
});
