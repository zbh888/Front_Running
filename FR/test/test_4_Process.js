var HelloWorld = artifacts.require('HelloWorld');
var Commit = artifacts.require('Commit');
var Participate = artifacts.require('Participate');
var Process = artifacts.require('Process');


contract('Process Async', function(accounts) {
    it('Demo', async function() {


        let CommitContract = await Commit.deployed();
        let ParticipateContract = await Participate.deployed();
        let ProcessContract = await Process.deployed();

        await ProcessContract.deposit({from: accounts[4],value: 20e18});
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
            value: 10,
            FUNC_SELECTOR: "sayHello2(bytes,address)",
            threshold: 100,
            rand: '0x001',
            parameter1: accounts[5]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'uint', 'string','uint','bytes','address'],
            [rawTx.data, rawTx.value, rawTx.FUNC_SELECTOR,rawTx.threshold,rawTx.rand,rawTx.parameter1]
        );
	console.log(tx)
        // And he/she selected a random string.
        let Commitment = web3.utils.soliditySha3(tx) // make the hash commitment of plain text
        let blocknumber = 3000; // pick a future block number
        let EncryptedTx = tx // Then they encrypt this ......

        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, Commitment, blocknumber, {from: accounts[4], value: 1e18});
        // Decrypters in the system should be able to decrypt them
        let DecryptedTx = tx
        // execution
        await ProcessContract.executeTX(
            blocknumber, 0, // This is the index of commitment in Commit.sol
            DecryptedTx, accounts[4], {from: accounts[5]});
    });

    //============================Unit Testing=========================
    it('Invalid cases', async function() {
        let CommitContract = await Commit.deployed();
        let ProcessContract = await Process.deployed();

        var rawTx = {
            data: '0xc0de',
            value: 1000,
            FUNC_SELECTOR: "sayHello(bytes,address)",
            threshold: 100,
            rand: '0x001',
            parameter1: accounts[5]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'uint', 'string','uint','bytes','address'],
            [rawTx.data, rawTx.value, rawTx.FUNC_SELECTOR,rawTx.threshold,rawTx.rand,rawTx.parameter1]
        );
        let Commitment = web3.utils.soliditySha3(tx)
        let blocknumber = 3000;
        let EncryptedTx = tx // for testing process.sol, doesn't encrypt at all.
        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, Commitment, blocknumber, {from: accounts[5], value: 1e18});
        // and decrypted immediately for unit testing
        let DecryptedTx = tx
        // execution
        let err = null
        try {
            // not participator
            await ProcessContract.executeTX(blocknumber, 1, DecryptedTx, accounts[5], {from: accounts[4]});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        err = null
        try {
            // index out of range
            await ProcessContract.executeTX(blocknumber, 2, DecryptedTx,accounts[5], {from: accounts[5]});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        err = null
        try {
            // already processed
            await ProcessContract.executeTX(blocknumber, 0, DecryptedTx, accounts[5], {from: accounts[6]});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    });
    it('Commitment was wrong from sender', async function() {
        let CommitContract = await Commit.deployed();
        let ProcessContract = await Process.deployed();

        var rawTx = {
            data: '0xc0de',
            value: 1000,
            FUNC_SELECTOR: "sayHello(bytes,address)",
            threshold: 100,
            rand: '0x001',
            parameter1: accounts[5]
        };
        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'uint', 'string','uint','bytes','address'],
            [rawTx.data, rawTx.value, rawTx.FUNC_SELECTOR,rawTx.threshold,rawTx.rand,rawTx.parameter1]
        );
        // And he/she selected a random string.
        let Commitment = web3.utils.soliditySha3('it is just random');
        let blocknumber = 3001;
        let EncryptedTx = tx // for testing process.sol, doesn't encrypt at all.
        // then make a commitment
        await CommitContract.makeCommitment(EncryptedTx, Commitment, blocknumber, {from: accounts[4], value: 1e18});
        // and decrypted immediately for unit testing
        let DecryptedTx = tx
        // execution
        await ProcessContract.executeTX(blocknumber, 0, DecryptedTx, accounts[4], {from: accounts[5]});
    });
});
