const hre = require("hardhat");

async function main() {
  try {
    // Get contract factory and deploy
    const Database = await hre.ethers.getContractFactory("Database");
    const database = await Database.deploy();
    await database.waitForDeployment();
    const contractAddress = await database.getAddress();
    console.log("\n🚀 Contract deployed to:", contractAddress);

    // Get signers (representing different users)
    const [owner, alice, bob, charlie] = await hre.ethers.getSigners();
    console.log("\n📋 Test Accounts:");
    console.log("Alice:", alice.address);
    console.log("Bob:", bob.address);
    console.log("Charlie:", charlie.address);

    // Create accounts with error handling
    console.log("\n👤 Creating User Accounts...");
    try {
        await database.connect(alice).createAccount("Alice");
        console.log("Created account for Alice");
    } catch (error) {
        console.log("Alice's account already exists");
    }

    try {
        await database.connect(bob).createAccount("Bob");
        console.log("Created account for Bob");
    } catch (error) {
        console.log("Bob's account already exists");
    }

    // Check existing friendship
    console.log("\n🔍 Checking Friendship Status...");
    const areFriends = async (addr1, addr2) => {
        try {
            return await database.checkAlreadyFriends(addr1, addr2);
        } catch (error) {
            return false;
        }
    };

    // Add friends if not already friends
    console.log("\n🤝 Managing Friendships...");
    if (!(await areFriends(alice.address, bob.address))) {
        try {
            await database.connect(alice).addFriend(bob.address, "Best Friend Bob");
            console.log("Alice added Bob as friend");
        } catch (error) {
            console.log("Couldn't add Bob as friend:", error.message);
        }
    } else {
        console.log("Alice and Bob are already friends");
    }

    // Send new messages
    console.log("\n💬 Sending New Messages...");
    try {
        // Get current timestamp for unique messages
        const timestamp = new Date().toLocaleTimeString();
        
        await database.connect(alice).sendMessage(bob.address, `Hey Bob! What's up? [${timestamp}]`);
        console.log("Alice sent new message to Bob");
        
        await database.connect(bob).sendMessage(alice.address, `Hi Alice! Just working on our blockchain project! [${timestamp}]`);
        console.log("Bob sent new message to Alice");
    } catch (error) {
        console.log("Error sending messages:", error.message);
    }

    // Read all messages between Alice and Bob
    console.log("\n📨 Reading Messages between Alice and Bob...");
    try {
        const messages = await database.connect(alice).readMessage(bob.address);
        if (messages.length === 0) {
            console.log("No messages yet");
        } else {
            console.log("\nChat History:");
            messages.forEach((msg, index) => {
                const sender = msg.sender === alice.address ? "Alice" : "Bob";
                const time = new Date(Number(msg.timestamp) * 1000).toLocaleString();
                console.log(`\nMessage ${index + 1}:`);
                console.log(`From: ${sender}`);
                console.log(`Time: ${time}`);
                console.log(`Content: ${msg.msg}`);
            });
        }
    } catch (error) {
        console.log("Error reading messages:", error.message);
    }

    // Get friend lists
    console.log("\n👥 Current Friend Lists...");
    try {
        const aliceFriends = await database.connect(alice).getMyFriendList();
        console.log("\nAlice's friends:");
        aliceFriends.forEach((friend, index) => {
            console.log(`${index + 1}. ${friend.name} (${friend.pubkey})`);
        });

        const bobFriends = await database.connect(bob).getMyFriendList();
        console.log("\nBob's friends:");
        bobFriends.forEach((friend, index) => {
            console.log(`${index + 1}. ${friend.name} (${friend.pubkey})`);
        });
    } catch (error) {
        console.log("Error getting friend lists:", error.message);
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });