var DelphyIco = artifacts.require("./DelphyICO.sol");

contract('DelphyIco', function (accounts) {
    const wallet = accounts[0];

    describe('Preparations', () => {
       before('Check accounts', () => {
           assert.equal(accounts.length, 10);
        })
    });
});