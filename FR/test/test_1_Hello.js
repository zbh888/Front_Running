var HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld Async', function(accounts) {
    it('Test target contract', async function() {
        let contract = await HelloWorld.deployed();
        await contract.sayHello({from: accounts[1]});
        console.log('Account 1 says hello.');
        await contract.sayHello({from: accounts[3]});
        console.log('Account 3 says hello.');
        await contract.sayHello({from: accounts[2]});
        console.log('Account 2 says hello.');
    });
});