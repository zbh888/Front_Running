var Commit = artifacts.require('Commit');

// for testing purpose only for this contract, the transaction data is just a simple string
contract('Commit Async', function(accounts) {
    let Cipher = 'This is secret.'; // Assume this is the one after encryption
    let BytesCipher = web3.utils.fromAscii(Cipher);
    let random = 'I wish this string makes my tx be the first one!'
    let commitment = web3.utils.keccak256(Cipher + random); // This is only for testing functionality, not actual hash
    let commitment2 = web3.utils.keccak256(Cipher + random +  Cipher); // This is only for testing functionality, not actual hash
    it('BlockNumber so small, no emit events', async function() {
        let contract = await Commit.deployed();
        let blockNumber = 1;
        let err = null
        try {
            await contract.makeCommitment(BytesCipher, random, commitment, blockNumber, {from: accounts[4], value:1e18});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    });
    it('No money supported', async function() {
        let blockNumber2 = 2000
        let contract = await Commit.deployed();
        let err = null
        try {
            await contract.makeCommitment(BytesCipher, random, commitment, blockNumber2, {from: accounts[4], value:0});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    });
    it('Checking correct length, correct commitment returned', async function() {
        let blockNumber2 = 2000
        let blockNumber1 = 1000
        let contract = await Commit.deployed();
        await contract.makeCommitment(BytesCipher, random, commitment, blockNumber2, {from: accounts[4], value:1e18});
        await contract.makeCommitment(BytesCipher, random, commitment2, blockNumber2, {from: accounts[5], value:2e18});
        let length1 = await contract.getLength.call(blockNumber1);
        let length2 = await contract.getLength.call(blockNumber2);
        let c1 = await contract.getCommitment.call(blockNumber2, 0);
        let c2 = await contract.getCommitment.call(blockNumber2, 1);
        assert.equal(0, length1);
        assert.equal(2, length2);
        assert.equal(commitment, c1);
        assert.equal(commitment2,c2);
    });
});