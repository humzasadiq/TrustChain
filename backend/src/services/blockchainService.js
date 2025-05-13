const { ethers } = require('ethers');
require('dotenv').config();

const abi = require('../abi/SupplyChain.json');
const contractAddress = "0xe9Cb8275CfbE6483d50bB90F3CC2F2dDceFD434B";

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi.abi, wallet);

const logToBlockchain = async (uid, stage, action) => {
  const tx = await contract.logStageEvent(
    ethers.encodeBytes32String(uid),
    ethers.encodeBytes32String(stage),
    ethers.encodeBytes32String(action)
  );
  await tx.wait();
  return tx.hash;
};

const logOrderToChain = async (oid, car_rfid) => {
  const tx = await contract.logOrder(
    oid,
    ethers.encodeBytes32String(car_rfid)
  );
  await tx.wait();
  return tx.hash;
};

const logItemToChain = async (oid, item_uid, stage) => {
  const tx = await contract.logOrderItem(
    oid,
    ethers.encodeBytes32String(item_uid),
    ethers.encodeBytes32String(stage)
  );
  await tx.wait();
  return tx.hash;
};

module.exports = { logToBlockchain, logOrderToChain, logItemToChain };
