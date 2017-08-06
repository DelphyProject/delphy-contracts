const DelphyICOMock = artifacts.require("DelphyICOMock.sol");
const DelphyTokenContract = artifacts.require("DelphyToken.sol");
const BigNumber = require('bignumber.js');


contract('DelphyICO', function (accounts) {
  // Solidity constants
  const minutes = 60;
  const hours = 3600;
  const days = 24 * hours;
  const weeks = 24 * 7 * hours;
  const years = 52 * weeks;

  const decimals = 18;
  const ether = new BigNumber(Math.pow(10, decimals));

  // DelphyICO constant fields
  const INTEREST_Tokens = 50;  // 50%
  const PUBLIC_FIRST_Tokens = 18;   // 18%
  const PUBLIC_SECOND_Tokens = 8;   //e
  const PRE_ICO_Tokens = 5;         //
  const DEV_TEAM_Tokens = 10;       //
  const FOUNDATION_Tokens = 9;      //

  const persent_token = new BigNumber(1000000).times(ether);

  const TOTAL_TOKENS_AMOUNT = new BigNumber(100).times(persent_token);
  const INTEREST_Tokens_AMOUNT = new BigNumber(INTEREST_Tokens).times(persent_token);
  const PUBLIC_FIRST_Tokens_AMOUNT = new BigNumber(PUBLIC_FIRST_Tokens).times(persent_token);
  const PUBLIC_SECOND_Tokens_AMOUNT = new BigNumber(PUBLIC_SECOND_Tokens).times(persent_token);
  const PRE_ICO_Tokens_AMOUNT = new BigNumber(PRE_ICO_Tokens).times(persent_token);
  const DEV_TEAM_Tokens_AMOUNT = new BigNumber(DEV_TEAM_Tokens).times(persent_token);
  const FOUNDATION_Tokens_AMOUNT = new BigNumber(FOUNDATION_Tokens).times(persent_token);

  const MAX_OPEN_SOLD_AMOUNT = new BigNumber(PUBLIC_SECOND_Tokens).times(persent_token);



  // Test globals
  let icoContract;
  let tokenContract;
  let testCases;

  const wallet = accounts[0];

  let initalBlockTime;
  const startDelay = 1 * days;
  const totalDuring = 5 * days;
  let startTime;
  let endTime;
  const numTestCases = 3;
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

  describe('CONTRACT DEPLOYMENT', () => {
    it('Deploy DelphyICO contracts', async function() {
      icoContract = await DelphyICOMock.new(wallet, startTime);
      tokenContract = DelphyTokenContract.at(await icoContract.delphyToken());
      // console.log(tokenContract);
    });

    it('Checks initial parameters', async function () {
      // check constant
      assert(TOTAL_TOKENS_AMOUNT.comparedTo(new BigNumber(await icoContract.TOTAL_TOKENS())) === 0);

      // compare to ico constant and token balance
      assert(INTEREST_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.INTEREST_Tokens())) === 0);
      assert(INTEREST_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.INTEREST_HOLDER()))) === 0);

      assert(PUBLIC_FIRST_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.PUBLIC_FIRST_Tokens())) === 0);
      assert(PUBLIC_FIRST_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PUBLIC_FIRST_HOLDER()))) === 0);

      assert(PUBLIC_SECOND_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.PUBLIC_SECOND_Tokens())) === 0);
      assert(PUBLIC_SECOND_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.address))) === 0);
      //
      assert(PRE_ICO_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.PRE_ICO_Tokens())) === 0);
      assert(PRE_ICO_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PRE_ICO_HOLDER()))) === 0);

      assert(DEV_TEAM_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.DEV_TEAM_Tokens())) === 0);
      assert(DEV_TEAM_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.DEV_TEAM_HOLDER()))) === 0);
      //
      assert(FOUNDATION_Tokens_AMOUNT.comparedTo(new BigNumber(await icoContract.FOUNDATION_Tokens())) === 0);
      assert(FOUNDATION_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.FOUNDATION_HOLDER()))) === 0);
      //
      assert(MAX_OPEN_SOLD_AMOUNT.comparedTo(new BigNumber(await icoContract.MAX_OPEN_SOLD())) === 0);

    });
  });
});