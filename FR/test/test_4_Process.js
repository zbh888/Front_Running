var HelloWorld = artifacts.require('HelloWorld');
var Commit = artifacts.require('Commit');
var Participate = artifacts.require('Participate');
var Process = artifacts.require('Process');


contract('Process Async', function(accounts) {
    var Tx = require('ethereumjs-tx').Transaction
    it('working test', async function() {
        let TargetContract = await HelloWorld.deployed();
        let CommitContract = await Commit.deployed();
        let ParticipateContract = await Participate.deployed();
        let ProcessContract = await Process.deployed();

        // Three participators, accounts 5, 6, 7, making threshold as 2 for DKG for a testing purpose.
        await ParticipateContract.join({from: accounts[5],value: 11e18});
        await ParticipateContract.join({from: accounts[6],value: 11e18});
        await ParticipateContract.join({from: accounts[7],value: 11e18});

        // account 4 as user sending the encrypted transaction for say hello.
        // Seems explained a lot about transaction (NOTE)
        // https://medium.com/@codetractio/inside-an-ethereum-transaction-fa94ffca912f

        var rawTx = {
            data: '0xc0de',
            owner: accounts[4]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'address'],
            [rawTx.data, rawTx.owner]
        );

        // And he/she selected a random string.
        let rand = "a random string";
        // They say this function is same as keccak256(abi.encondePacked(...))
        // ref: https://blog.8bitzen.com/posts/18-03-2019-keccak-abi-encodepacked-with-javascript/
        let Commitment = web3.utils.soliditySha3(tx, rand)
        let blocknumber = 3000;
        let EncryptedTx = tx // for testing process.sol, doesn't encrypt at all.
        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, rand, Commitment, blocknumber, {from: accounts[4], value: 1e18});
        // and decrypted immediately for unit testing
        let DecryptedTx = tx
        // execution
        await ProcessContract.executeTX(blocknumber, 0, DecryptedTx, rand, {from: accounts[5], value: 1e18});
    });
    it('Invalid cases', async function() {
        let TargetContract = await HelloWorld.deployed();
        let CommitContract = await Commit.deployed();
        let ProcessContract = await Process.deployed();

        var rawTx = {
            data: '0xc0de',
            owner: accounts[4]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'address'],
            [rawTx.data, rawTx.owner]
        );
        // And he/she selected a random string.
        let rand = "a random string2";
        let Commitment = web3.utils.soliditySha3(tx, rand)
        let blocknumber = 3000;
        let EncryptedTx = tx // for testing process.sol, doesn't encrypt at all.
        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, rand, Commitment, blocknumber, {from: accounts[5], value: 1e18});
        // and decrypted immediately for unit testing
        let DecryptedTx = tx
        // execution
        let err = null
        try {
            await ProcessContract.executeTX(blocknumber, 1, DecryptedTx, rand, {from: accounts[4], value: 1e18});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        err = null
        try {
            // index out of range
            await ProcessContract.executeTX(blocknumber, 2, DecryptedTx, rand, {from: accounts[5], value: 1e18});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        err = null
        try {
            // already processed
            await ProcessContract.executeTX(blocknumber, 0, DecryptedTx, rand, {from: accounts[6], value: 1e18});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    });
    it('Commitment was wrong from sender', async function() {
        let TargetContract = await HelloWorld.deployed();
        let CommitContract = await Commit.deployed();
        let ProcessContract = await Process.deployed();

        var rawTx = {
            data: '0xc0de',
            owner: accounts[4]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'address'],
            [rawTx.data, rawTx.owner]
        );
        // And he/she selected a random string.
        let rand = "a random string2";
        let Commitment = web3.utils.soliditySha3('it is just random');
        let blocknumber = 3001;
        let EncryptedTx = tx // for testing process.sol, doesn't encrypt at all.
        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, rand, Commitment, blocknumber, {from: accounts[4], value: 1e18});
        // and decrypted immediately for unit testing
        let DecryptedTx = tx
        // execution
        await ProcessContract.executeTX(blocknumber, 0, DecryptedTx, rand, {from: accounts[5], value: 1e18});
    });
});