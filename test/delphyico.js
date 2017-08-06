const DelphyICOMock = artifacts.require("DelphyICOMock.sol");
const DelphyTokenContract = artifacts.require("DelphyToken.sol");
const assertFail = require("./helpers/assertFail");
const BigNumber = require('bignumber.js');

/*
 * NB way, to change evm's blockTime
 */
/*
function send(method, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }

  web3.currentProvider.sendAsync({
    jsonrpc: '2.0',
    method,
    params: params || [],
    id: new Date().getTime(),
  }, callback);
}

describe('START OF PUBLIC CONTRIBUTION', () => {
  before('Time travel to startTime', (done) => {
    web3.eth.getBlock('latest', (err, result) => {
      send('evm_increaseTime', [startTime - result.timestamp], (err, result) => {
        assert.equal(err, null);
        send('evm_mine', [], (err, result) => {
          assert.equal(err, null);
          done();
        });
      });
    });
  });
});
*/

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

  const total_delphy = new BigNumber(100000000);
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

  const wallet = accounts[9];

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
    });

    it('Checks initial parameters', async function () {
      // check constant
      assert(TOTAL_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.totalSupply())) === 0);

      // check token balance
      assert(INTEREST_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.INTEREST_HOLDER()))) === 0);
      assert(PUBLIC_FIRST_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PUBLIC_FIRST_HOLDER()))) === 0);
      assert(PUBLIC_SECOND_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.address))) === 0);
      assert(PRE_ICO_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PRE_ICO_HOLDER()))) === 0);
      assert(DEV_TEAM_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.DEV_TEAM_HOLDER()))) === 0);
      assert(FOUNDATION_Tokens_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.FOUNDATION_HOLDER()))) === 0);
      //
      assert(MAX_OPEN_SOLD_AMOUNT.comparedTo(new BigNumber(await icoContract.MAX_OPEN_SOLD())) === 0);

      assert.equal("0", await icoContract.halted());
      assert.equal(wallet, await icoContract.wallet());
      assert.equal(startTime, await icoContract.startTime());
      assert.equal(endTime, await icoContract.endTime());
      assert.equal("0", await icoContract.openSoldTokens());
    });
  });

  describe('CONTRACT HALT UNHalt', () => {
    it ('should halted = true', async function () {
      await icoContract.halt({from:wallet});
      assert.equal("1", await icoContract.halted());
    });
    it ('should halted = false', async function () {
      await icoContract.unHalt({from:wallet});
      assert.equal("0", await icoContract.halted());
    });
    it ('should only wallet addr can halt', async function () {
      await assertFail(async function() {
        await icoContract.halt({from:accounts[1]})
      });
    });
    it ('should only wallet addr can unhalt', async function () {
      await assertFail(async function() {
        await icoContract.unHalt({from:accounts[1]})
      });
    });
  });

  describe('CONTRACT buyDelphyToken', () => {
    it ('should failed when halted', async function () {
      await icoContract.halt({from:wallet});
      await assertFail(async function () {
        await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
      });
    });

    it ('should failed when buy early than startTime', async function () {
      await icoContract.unHalt({from:wallet});
      await icoContract.setMockedBlockTime(initalBlockTime);
      await assertFail(async function () {
        await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
      });
    });

    it ('should success when buy between startTime and endTime', async function () {
      const userIndex = 1;
      const loopCount = 5;
      for (let i=0; i<loopCount; i++) {
        let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[userIndex]));
        let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
        let tokenTimes = new BigNumber(250);
        const balance = new BigNumber(web3.eth.getBalance(wallet));
        const ethMount = 0.2;
        await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
        await icoContract.buyDelphyToken(accounts[userIndex],{from:accounts[userIndex],value:web3.toWei(ethMount)});
        const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
        const gasMount = (new BigNumber(ethMount)).times(ether);
        assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[userIndex]))) === 0);
        assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
        assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
      }
    });

    it ('should success when call fallback function', async function () {
      const userIndex = 2;
      const loopCount = 5;
      const addr = await icoContract.address;
      for (let i=0; i<loopCount; i++) {
        let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[userIndex]));
        let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
        let tokenTimes = new BigNumber(250);
        const balance = new BigNumber(web3.eth.getBalance(wallet));
        const ethMount = 0.2;
        await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
        web3.eth.sendTransaction({from:accounts[userIndex], to:addr, value:web3.toWei(ethMount)});
        const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
        const gasMount = (new BigNumber(ethMount)).times(ether);
        assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[userIndex]))) === 0);
        assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
        assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
      }
    });

    it ('should success when buy from partner', async function () {
      const userIndex = 3;
      const partnerIndex = 4;
      const loopCount = 5;
      for (let i=0; i<loopCount; i++) {
        let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[partnerIndex]));
        let partnerToken = new BigNumber(await icoContract.partnersBought(accounts[partnerIndex]));
        let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
        let tokenTimes = new BigNumber(250);
        const balance = new BigNumber(web3.eth.getBalance(wallet));
        const ethMount = 0.2;
        await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
        await icoContract.buyDelphyToken(accounts[partnerIndex],{from:accounts[userIndex],value:web3.toWei(ethMount)});
        const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
        const gasMount = (new BigNumber(ethMount)).times(ether);
        assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[partnerIndex]))) === 0);
        assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
        assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
        assert(partnerToken.add(tokenMount).comparedTo(new BigNumber(await icoContract.partnersBought(accounts[partnerIndex]))) === 0);
      }
    });

    it ('should failed when buy later than endTime', async function () {
      await icoContract.setMockedBlockTime(endTime);
      await assertFail(async function () {
        await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
      });
    });

    it ('should success when buy exceed', async function () {
      const userIndex = 5;
      const loopCount = 1;
      for (let i=0; i<loopCount; i++) {
        let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
        let tokenTimes = new BigNumber(250);
        await icoContract.setMockedTokenTimes(total_delphy/2);
        const ethMount = 2;
        await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
        await icoContract.buyDelphyToken(accounts[userIndex],{from:accounts[userIndex],value:web3.toWei(ethMount)});
        // const gasMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
        assert(MAX_OPEN_SOLD_AMOUNT.comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
        let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[userIndex]));
        const total = openSoldToken.add(lockedToken);
        assert(total.comparedTo(MAX_OPEN_SOLD_AMOUNT) === 0);
        await icoContract.setMockedTokenTimes(250);
      }
    });

    it ('should failed when already exceed', async function () {
      await icoContract.setMockedBlockTime(endTime);
      await assertFail(async function () {
        await icoContract.buyDelphyToken(accounts[6],{from:accounts[6],value:web3.toWei(1)});
      });
    });
  });

  describe('CONTRACT claimTokens', () => {
    it ('should failed before endTime', async function () {
      await icoContract.setMockedBlockTime(endTime);
      await assertFail(async function() {
        await icoContract.claimTokens(accounts[1], {from:accounts[1]});
      });
    });
    it ('should success after endTime', async function () {
      const lockedCount = new BigNumber(await icoContract.lockedBalances(accounts[1]));
      await icoContract.setMockedBlockTime(endTime + 1);
      await icoContract.claimTokens(accounts[1], {from:accounts[1]});
      const tokenCount = new BigNumber(await tokenContract.balanceOf(accounts[1]));
      assert(lockedCount.comparedTo(tokenCount) === 0);
    });
  });

  describe('CONTRACT finishICO', () => {
    it ('should faile when caller is not wallet', async function () {
      await icoContract.setMockedBlockTime(endTime+1);
      await assertFail(async function() {
        await icoContract.finishICO({from:accounts[3]})
      });
    });
    it ('should failed before endTime', async function () {
      await icoContract.setMockedBlockTime(endTime);
      await assertFail(async function() {
        await icoContract.finishICO({from:wallet})
      });
    });
    it ('should success call from wallet', async function () {
      await icoContract.setMockedBlockTime(endTime+1);
      await icoContract.finishICO({from:wallet});
      const walletToken = new BigNumber(await tokenContract.balanceOf(wallet));
      const openSoldToken = new BigNumber(await icoContract.openSoldTokens());
      assert(walletToken.add(openSoldToken).comparedTo(MAX_OPEN_SOLD_AMOUNT) === 0);
    });
  });

});