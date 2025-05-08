const { ethers } = require('ethers');
require('dotenv').config();

const abi = require('../abi/SupplyChain.json');
const contractAddress = "0xD2e0ae11FdE76ac9678Ff18306228B41F987591d";

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi.abi, wallet);

const logToBlockchain = async (uid, stage, action) => {
  const tx = await contract.logStageEvent(uid, stage, action);
  await tx.wait();
  return tx.hash;
};

module.exports = { logToBlockchain };
