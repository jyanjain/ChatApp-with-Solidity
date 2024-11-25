const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Database = await hre.ethers.getContractFactory("Database");
  
  // Deploy the contract
  const database = await Database.deploy();
  
  // Wait for the contract to be deployed
  await database.waitForDeployment();
  
  // Get the contract address
  const address = await database.getAddress();
  console.log("Database contract deployed to:", address);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });