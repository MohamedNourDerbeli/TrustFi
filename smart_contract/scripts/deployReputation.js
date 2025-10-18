require("dotenv").config();
const hre = require("hardhat");

async function main() {
  // Get the deployer's account from Hardhat's environment
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const ReputationNFT = await hre.ethers.getContractFactory("ReputationNFT");
  
  // Pass the deployer's address to the constructor
  const reputationNFT = await ReputationNFT.deploy(deployer.address);

  await reputationNFT.waitForDeployment();

  console.log(
    `✅ ReputationNFT contract deployed successfully to: ${reputationNFT.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
