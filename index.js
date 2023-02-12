const amqp = require("amqplib");
const ethers = require("ethers");

const request = require("request");

const ABI = require("./abis");

const constAddr = require("./conf.js");

const { provider } = require("./wallet");

require("dotenv").config();

let { db } = require("./db");

const {
  utils: { Interface },
} = ethers;

const { ClaimMintCache, DegreeHeatsCache } = require("./cache/index");

const ngp_abi = ABI.ngpABI;

const ngp_addr = constAddr.ngp_addr;

const ClaimMint = ethers.utils.id("ClaimMint(address,string,uint256)");
const DegreeHeatsEvent = ethers.utils.id("DegreeHeats(string,uint256,uint256)");

let NGPEvent = new Interface(ngp_abi);

async function consumer() {
  const queueName = "ngp-queue";

  try {
    const connection = await amqp.connect(
      "amqp://admin:admin@123456@120.25.239.33:7072/"
    );
    const ch = await connection.createChannel();

    await ch.assertQueue(queueName, { durable: true });

    await ch.consume(
      queueName,
      (msg) => {
        console.log(new Date() + "consumer msg:", msg.content.toString());
        const events = JSON.parse(msg.content);
        dealEvent(events);
        ch.ack(msg);
      },
      { noAck: false }
    );
  } catch (err) {
    console.log(new Date() + "Consumer Error: ", err);
  }
}

consumer();

const dealEvent = async (events) => {
  events.forEach((event) => {
    let key = event.Address + "_" + event.LogIndex + event.TransactionHash;
    console.log(new Date() + "key====:", key);

    if (event.Topics[0] == ClaimMint) {
      ClaimMintCache.set(key, event);
    }

    if (event.Topics[0] == DegreeHeatsEvent) {
      DegreeHeatsCache.set(key, event);
    }
  });
};

ClaimMintCache.on("expired", async (address, event) => {
  const contractAddr = address.toString().split("_");
  if (contractAddr[0].toLowerCase() != ngp_addr.toLowerCase()) {
    return;
  }

  console.log(new Date() + "======ClaimMintCache Event=====");

  const eventData = await NGPEvent.parseLog({
    topics: event.Topics,
    data: event.Data,
  });

  console.log("eventData.args:", eventData.args);

  const user = eventData.args["user"].toString();
  const number = eventData.args["number"].toString();
  const time = eventData.args["time"].toString();

  const insertData = {
    user: user,
    number: number,
    updateTs: time,
    createTs: time,
  };

  console.log("====insertData===:", insertData);

  let sqlString = "insert into ngp_mint SET ?";
  let result;
  try {
    result = await db.dowork(sqlString, insertData);

    console.log(new Date() + "insert into ngp_mint result:", result);
  } catch (e) {
    console.error(new Date() + "catch error:", e);

    return;
  }

  return;
});

DegreeHeatsCache.on("expired", async (address, event) => {
  const contractAddr = address.toString().split("_");
  if (contractAddr[0].toLowerCase() != ngp_addr.toLowerCase()) {
    return;
  }

  console.log(new Date() + "======DegreeHeatsCache Event=====");

  const eventData = await NGPEvent.parseLog({
    topics: event.Topics,
    data: event.Data,
  });

  console.log("eventData.args:", eventData.args);

  const number = eventData.args["number"].toString();
  const heat = eventData.args["heat"].toString();
  const len = eventData.args["len"].toString();

  const insertData = {
    number: number,
    e: heat,
    count: len,
    link: "goerli",
  };

  let sqlString = ` select id from ngp_rank where number = "${number}"`;

  let Ret = [];
  try {
    Ret = await db.dowork(sqlString, "");

    console.log(new Date() + "select ngp_rank Ret:", Ret);
  } catch (e) {
    console.error(new Date() + "catch error:", e);

    return;
  }

  if (Ret.length == 0 || Ret[0].id == 0) {
    sqlString = "insert into ngp_rank SET ?";
    let result;
    try {
      result = await db.dowork(sqlString, insertData);

      console.log(new Date() + "insert into ngp_mint result:", result);
    } catch (e) {
      console.error(new Date() + "catch error:", e);

      return;
    }
  } else {
    sqlString = "update ngp_rank SET e = ?,count = ? where number = ? ";
    let result;
    try {
      result = await db.dowork(sqlString, [heat, len, number]);

      console.log(new Date() + "update ngp_rank result:", result);
    } catch (e) {
      console.error(new Date() + "catch error:", e);

      return;
    }
  }

  return;
});
