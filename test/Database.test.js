const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Database Contract", function () {
  let Database;
  let database;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get contract factory and signers
    Database = await ethers.getContractFactory("Database");
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy contract
    database = await Database.deploy();
    await database.waitForDeployment();
  });

  describe("Account Management", function () {
    it("Should create a new account", async function () {
      await database.createAccount("Alice");
      const exists = await database.checkUserExists(owner.address);
      expect(exists).to.equal(true);
    });

    it("Should add friends and send messages", async function () {
      // Create accounts
      await database.createAccount("Alice");
      await database.connect(addr1).createAccount("Bob");

      // Add friends
      await database.addFriend(addr1.address, "Bob");
      await database.connect(addr1).addFriend(owner.address, "Alice");

      // Send messages
      await database.sendMessage(addr1.address, "Hi Bob!");
      await database.connect(addr1).sendMessage(owner.address, "Hello Alice!");

      // Read messages
      const messages = await database.readMessage(addr1.address);
      expect(messages.length).to.equal(2);
      expect(messages[0].msg).to.equal("Hi Bob!");
      expect(messages[1].msg).to.equal("Hello Alice!");
    });
  });
});