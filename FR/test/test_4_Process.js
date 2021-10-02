var HelloWorld = artifacts.require('HelloWorld');
var Commit = artifacts.require('Commit');
var Participate = artifacts.require('Participate');
var Process = artifacts.require('Process');


contract('Process Async', function(accounts) {
    it('Demo', async function() {
        let CommitContract = await Commit.deployed();
        let ParticipateContract = await Participate.deployed();
        let ProcessContract = await Process.deployed();

        // Three participators, accounts 5, 6, 7
        await ParticipateContract.join({from: accounts[5],value: 11e18});
        await ParticipateContract.join({from: accounts[6],value: 11e18});
        await ParticipateContract.join({from: accounts[7],value: 11e18});

        // account 4 as user sending the encrypted transaction for say hello.
        // Seems explained a lot about transaction (NOTE)
        // https://medium.com/@codetractio/inside-an-ethereum-transaction-fa94ffca912f

        // This TX structure could be treated as a specific form of information collection in this system
        // We could add field whatever we want such as gas, gas limit or signature, these should matching the info from
        // the commitment contract. Such as owner must match the user's address. This could be checked automatically
        // in process.sol
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
        let Commitment = web3.utils.soliditySha3(tx, rand) // make the hash commitment of plain text
        let blocknumber = 3000; // pick a future block number
        let EncryptedTx = tx // Then they encrypt this ......

        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, rand, Commitment, blocknumber, {from: accounts[4], value: 1e18});
        // Decrypters in the system should be able to decrypt them
        let DecryptedTx = tx
        // execution
        await ProcessContract.executeTX(
            blocknumber, 0, // This is the index of commitment in Commit.sol
            DecryptedTx, rand, {from: accounts[5], value: 1e18});
    });

    //============================Unit Testing=========================
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