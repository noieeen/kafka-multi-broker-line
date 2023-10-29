const { Kafka } = require("kafkajs");
const { Order } = require("./schema.js");
const { default: axios } = require("axios");

require("dotenv").config();

const LINE_API_URL = "https://api.line.me/v2/bot/message/push";
const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092", "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "message-group" });

const run = async () => {
  //   console.log("LAC", process.env.LINE_CHANNEL_ACCESS_TOKEN);
  await consumer.connect();
  await consumer.subscribe({
    topic: "message-order",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageData = JSON.parse(message.value.toString());

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      };

      const body = {
        to: messageData.userLineUid,
        messages: [
          {
            type: "text",
            text: `Your order product ${messageData.productName} successful!`,
          },
        ],
      };

      try {
        const response = await axios.post(LINE_API_URL, body, {
          headers,
        });

        await Order.update(
          {
            status: "success",
          },
          {
            where: {
              id: messageData.orderId,
            },
          }
        );
      } catch (error) {
        console.error(error);
      }

      //   console.log({
      //     partition,
      //     offset: message.offset,
      //     value: message.value.toString(),
      //   });
    },
  });
};

run().catch(console.error());
