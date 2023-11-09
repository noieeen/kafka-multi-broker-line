const { default: axios } = require("axios");

const productData = {
  productId: 2,
  userId: "U7b003715e8c33831779d2f329408a81c",
};
const body = {
  productId: 3,
  userId: "U7b003715e8c33831779d2f329408a81c",
};

const mockOrder = async () => {
  await axios.post("http://localhost:8000/api/placeorder", body);
  console.log("send", body);
};

const loop = async () => {
  for (let i = 0; i < 100; i++) {
    await mockOrder();
  }
  process.exit();
};

loop();
