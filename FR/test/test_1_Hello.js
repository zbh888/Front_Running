var HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld Async', function(accounts) {
    var Tx = require('ethereumjs-tx').Transaction
    // account 1 says hello
    var rawTx = {
        data: '0xc0de',
        owner: accounts[1]
    };
    it('Test target contract', async function() {

        let tx = web3.eth.abi.encodeParameters(
            ['bytes', 'address'],
            [rawTx.data, rawTx.owner]
        );

        let contract = await HelloWorld.deployed();
        await contract.sayHello(tx,{from: accounts[1]});
        console.log('Account 1 says hello.');
        await contract.sayHello(tx,{from: accounts[3]});
        console.log('Account 3 says hello.');
        await contract.sayHello(tx,{from: accounts[2]});
        console.log('Account 2 says hello.');
    });
});