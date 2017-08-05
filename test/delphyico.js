
const BigNumber = require('bignumber.js');
var DelphyICO = artifacts.require("./DelphyICO.sol");

contract('DelphyICO', function (accounts) {
  // Solidity constants
  const minutes = 60;
  const hours = 3600;
  const days = 24 * hours;
  const weeks = 24 * 7 * hours;
  const years = 52 * weeks;
  const ether = new BigNumber(Math.pow(10, 18));

  // WanchainContribution constant fields
  const INTEREST_Tokens = 50;  // 50%
  const PUBLIC_FIRST_Tokens = 18;   // 18%
  const PUBLIC_SECOND_Tokens = 8;   //
  const PRE_ICO_Tokens = 5;         //
  const DEV_TEAM_Tokens = 10;       //
  const FOUNDATION_Tokens = 9;      //

  const wallet = accounts[0];
  let initalBlockTime;
  const startDelay = 1 * days;
  const totalDuring = 5 * days;
  let startTime;
  let endTime;
  const numTestCases = 8;
  describe('PREPARATIONS', () => {
    before('Check accounts', (done) => {
      assert.equal(accounts.length, 10);
      done();
    });

    it('Set startTime as now', (done) => {
      web3.eth.getBlock('latest', (err, result) => {
        initalBlockTime = result.timestamp;
        startTime = initalBlockTime + startDelay;
        endTime = startTime + totalDuring;
        done();
      });
    });

    it('Set up test cases', (done) => {
      testCases = [];
      for (i = 0; i < numTestCases; i += 1) {
        const timeSpacing = (endTime - startTime) / numTestCases;
        const blockTime = Math.round(startTime + (i * timeSpacing));
        let expectedPrice = 250;

        const accountNum = Math.max(1, Math.min(i + 1, accounts.length - 1));
        const account = accounts[accountNum];
        expectedPrice = Math.round(expectedPrice);
        testCases.push({
          accountNum,
          blockTime,
          timeSpacing,
          amountToBuy: web3.toWei(2.1, 'ether'),
          expectedPrice,
          account,
        });
      }
      done();
    });
  });

  describe('CONTRIBUTION CONTRACT STATIC CHECK', () => {
    it('Total Stake equal 100', (done) => {
      assert.equal( INTEREST_Tokens + PUBLIC_FIRST_Tokens + PUBLIC_SECOND_Tokens
        + PRE_ICO_Tokens + DEV_TEAM_Tokens + FOUNDATION_Tokens,
        100);
      done();
    });
  });
});