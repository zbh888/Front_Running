var Commit = artifacts.require('Commit');

contract('Commit Async', function(accounts) {
    it('BlockNumber so small, no emit events', async function() {
        let contract = await Commit.deployed();
        let CheckIfIn = await contract.contains.call(accounts[1]);
    });
    it('No gas fee supplied, no emit events', async function() {
        let contract = await Commit.deployed();
        let CheckIfIn = await contract.contains.call(accounts[1]);
    });
    it('Made 1 commitment to block 1000, checking commitment, length', async function() {
        let contract = await Commit.deployed();
        let CheckIfIn = await contract.contains.call(accounts[1]);
    });
    it('Made 2 commitment to block 1001, checking commitment, length', async function() {
        let contract = await Commit.deployed();
        let CheckIfIn = await contract.contains.call(accounts[1]);
    });
});