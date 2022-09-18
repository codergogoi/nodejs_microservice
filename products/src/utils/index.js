const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  BASE_URL,
  EXCHANGE_NAME,
  MSG_QUEUE_URL,
} = require("../config");

//Utility functions
(module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
}),
  (module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
  });

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

(module.exports.GenerateSignature = async (payload) => {
  return await jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
}),
  (module.exports.ValidateSignature = async (req) => {
    const signature = req.get("Authorization");

    if (signature) {
      const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
      req.user = payload;
      return true;
    }

    return false;
  });

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

//Raise Events
module.exports.PublishCustomerEvent = async (payload) => {
  axios.post("http://customer:8001/app-events/", {
    payload,
  });

  //     axios.post(`${BASE_URL}/customer/app-events/`,{
  //         payload
  //     });
};

module.exports.PublishShoppingEvent = async (payload) => {
  // axios.post('http://gateway:8000/shopping/app-events/',{
  //         payload
  // });

  axios.post(`http://shopping:8003/app-events/`, {
    payload,
  });
};

//Message Broker

module.exports.CreateChannel = async () => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(EXCHANGE_NAME, "direct", { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
};

module.exports.PublishMessage = (channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent: ", msg);
};
