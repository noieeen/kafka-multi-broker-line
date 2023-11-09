const { default: axios } = require("axios");
const { faker } = require("@faker-js/faker");

const body = {
  productId: 32,
  userId: "U7b003715e8c33831779d2f329408a81c",
};

const mockOrder = async () => {
  await axios.post("http://localhost:8000/api/placeorder", body);
  console.log("send", body);
};

const mockProduct = async () => {
  for (let i = 0; i < 10; i++) {
    const productData = {
      name: faker.commerce.productName(),
      amount: faker.number.int({ min: 100, max: 500 }),
    };
    await axios.post("http://localhost:8000/api/create-product", productData);
    console.log("send", productData);
  }
};

const loop = async () => {
  for (let i = 0; i < 10000; i++) {
    await mockOrder();
    console.log("count:", i + 1);
  }
  process.exit();
};

loop();
