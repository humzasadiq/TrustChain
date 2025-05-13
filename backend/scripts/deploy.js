const hre = require("hardhat");

async function main() {
  // Get contract factory
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");

  // Deploy the contract (await handles mining too in ethers v6)
  const supplyChain = await SupplyChain.deploy();

  // Now the contract is deployed
  console.log(`✅ SupplyChain deployed at: ${supplyChain.target}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});
