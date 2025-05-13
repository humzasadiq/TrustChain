const { ethers } = require("ethers");

// Replace with your deployed contract address on Sepolia
const contractAddress = "0xD2e0ae11FdE76ac9678Ff18306228B41F987591d";

// Load ABI from the compiled contract
const contractABI = require("../artifacts/contracts/SupplyChain.sol/SupplyChain.json").abi;

// Connect to Sepolia via Infura or Alchemy or public provider
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/1d9afaeb83824f3e86d3c2cabc2c8b66");

// Create a read-only contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

async function main() {
    const logs = await contract.getAllLogs();
    console.log("Logs:", logs);
}

main().catch(console.error);
