var Participate = artifacts.require('Participate');

contract('Participate Async', function(accounts) {
    it('Without signup, returns false', async function() {
        let contract = await Participate.deployed();
        let CheckIfIn = await contract.contains.call(accounts[1]);
        assert.equal(false, CheckIfIn);
    });
    it('After signup, returns true', async function() {
        let contract = await Participate.deployed();
        // call join functin
        await contract.join({from: accounts[1],value: 11});
        let CheckIfIn = await contract.contains.call(accounts[1]);
        assert.equal(true, CheckIfIn);
    });
    it('Reject double joining', async function() {
        let contract = await Participate.deployed();
        let err = null
        try {
            await contract.join({from: accounts[1],value: 11});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        let CheckIfIn = await contract.contains.call(accounts[1]);
        assert.equal(true, CheckIfIn);
    });
    it('After leave, return false', async function() {
        let contract = await Participate.deployed();
        await contract.leave({from: accounts[1]});
        let CheckIfIn = await contract.contains.call(accounts[1]);
        assert.equal(false, CheckIfIn);
    });
    it('Sign up but not enough money, returns false', async function() {
        let contract = await Participate.deployed();
        let err = null
        try {
            await contract.join({from: accounts[2],value: 9});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
        let CheckIfIn = await contract.contains.call(accounts[2]);
        assert.equal(false, CheckIfIn);
    });
    it('Not in but call leave', async function() {
        let contract = await Participate.deployed();
        let err = null
        try {
            await contract.leave({from: accounts[2]});
        } catch (error) {
            err = error
        }
        assert.ok(err instanceof Error)
    });
});