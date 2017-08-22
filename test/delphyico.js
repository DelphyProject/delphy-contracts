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
    const minBuy = 0.1;
    const maxBuy = 20;
    const minEther = new BigNumber(Math.pow(10, decimals)).times(minBuy);
    const maxEther = new BigNumber(Math.pow(10, decimals)).times(maxBuy);

    // DelphyICO constant fields
    const BONUS_TOKENS = 50;  // 50%
    const PUBLIC_FIRST_TOKENS = 18;   // 18%
    const PUBLIC_SECOND_TOKENS = 2.5;   //e
    const PUBLIC_SECOND_PRESOLD_TOKENS = 5.5;   //e
    const PRE_ICO_TOKENS = 5;         //
    const DEV_TEAM_TOKENS = 10;       //
    const FOUNDATION_TOKENS = 9;      //

    const total_delphy = new BigNumber(100000000);
    const persent_token = new BigNumber(1000000).times(ether);

    const TOTAL_TOKENS_AMOUNT = new BigNumber(100).times(persent_token);
    const BONUS_TOKENS_AMOUNT = new BigNumber(BONUS_TOKENS).times(persent_token);
    const PUBLIC_FIRST_TOKENS_AMOUNT = new BigNumber(PUBLIC_FIRST_TOKENS).times(persent_token);
    const PUBLIC_SECOND_TOKENS_AMOUNT = new BigNumber(PUBLIC_SECOND_TOKENS).times(persent_token);
    const PUBLIC_SECOND_PRESOLD_TOKENS_AMOUNT = new BigNumber(PUBLIC_SECOND_PRESOLD_TOKENS).times(persent_token);
    const PRE_ICO_TOKENS_AMOUNT = new BigNumber(PRE_ICO_TOKENS).times(persent_token);
    const DEV_TEAM_TOKENS_AMOUNT = new BigNumber(DEV_TEAM_TOKENS).times(persent_token);
    const FOUNDATION_TOKENS_AMOUNT = new BigNumber(FOUNDATION_TOKENS).times(persent_token);

    const MAX_OPEN_SOLD_AMOUNT = new BigNumber(PUBLIC_SECOND_TOKENS).times(persent_token);



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
        it('Set startTime as now', async () => {
            const latestBlock = await web3.eth.getBlock('latest');
            initalBlockTime = latestBlock.timestamp;
            startTime = initalBlockTime + startDelay;
            endTime = startTime + totalDuring;
        });
    });

    //deploy contract and reset related context
    async function resetContractTestEnv() {
        //deploy contract
        const latestBlock = await web3.eth.getBlock('latest');
        startTime = latestBlock.timestamp;
        icoContract = await DelphyICOMock.new(wallet, startTime);
        tokenContract = DelphyTokenContract.at(await icoContract.delphyToken());

        endTime = startTime + totalDuring;
    }

    describe('CONTRIBUTION CONTRACT STATIC CHECK', () => {
        it('Total Stake equal 100', (done) => {
            assert.equal( BONUS_TOKENS + PUBLIC_FIRST_TOKENS + PUBLIC_SECOND_TOKENS + PUBLIC_SECOND_PRESOLD_TOKENS
                + PRE_ICO_TOKENS + DEV_TEAM_TOKENS + FOUNDATION_TOKENS,
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
            assert(BONUS_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.BONUS_HOLDER()))) === 0);
            assert(PUBLIC_FIRST_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PUBLIC_FIRST_HOLDER()))) === 0);
            console.log("address:" + new BigNumber(await tokenContract.balanceOf(await icoContract.address)));
            console.log("amount1:" + PUBLIC_SECOND_TOKENS_AMOUNT);

            console.log("address:" + new BigNumber(await tokenContract.balanceOf(await icoContract.PUBLIC_SECOND_PRESOLD_HOLDER())));
            console.log("amount2:" + PUBLIC_SECOND_PRESOLD_TOKENS_AMOUNT);
            assert(PUBLIC_SECOND_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.address))) === 0);
            assert(PUBLIC_SECOND_PRESOLD_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PUBLIC_SECOND_PRESOLD_HOLDER()))) === 0);
            assert(PRE_ICO_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.PRE_ICO_HOLDER()))) === 0);
            assert(DEV_TEAM_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.DEV_TEAM_HOLDER()))) === 0);
            assert(FOUNDATION_TOKENS_AMOUNT.comparedTo(new BigNumber(await tokenContract.balanceOf(await icoContract.FOUNDATION_HOLDER()))) === 0);

            assert(MAX_OPEN_SOLD_AMOUNT.comparedTo(new BigNumber(await icoContract.MAX_OPEN_SOLD())) === 0);

            assert.equal("0", await icoContract.halted());
            assert.equal(wallet, await icoContract.wallet());
            assert.equal(startTime, await icoContract.startTime());
            assert.equal(endTime, await icoContract.endTime());
            assert.equal("0", await icoContract.openSoldTokens());
        });
    });

    describe('CONTRACT HALT & UNHalt', () => {
        it ('halted should be true when halt() is called', async function () {
            await icoContract.halt({from:wallet});
            assert.equal("1", await icoContract.halted());
        });
        it ('halted should be false when unHalt() is called', async function () {
            await icoContract.unHalt({from:wallet});
            assert.equal("0", await icoContract.halted());
        });
        it ('only wallet address can be halted', async function () {
            await assertFail(async function() {
                await icoContract.halt({from:accounts[1]})
            });
        });
        it ('only wallet address can be unhalt', async function () {
            await assertFail(async function() {
                await icoContract.unHalt({from:accounts[1]})
            });
        });
    });

    describe('CONTRACT buyDelphyToken', () => {
        before('Check accounts balance', () => {
            assert((new BigNumber(web3.eth.getBalance(accounts[0]))).comparedTo(new BigNumber(25).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[1]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[2]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[3]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[4]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[5]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
            assert((new BigNumber(web3.eth.getBalance(accounts[6]))).comparedTo(new BigNumber(3).times(ether)) >= 0);
        });

        it ('buy should fail when ico contract is not initialized', async function () {
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
            });
        });

        it ('buy should fail when halted', async function () {
            await icoContract.halt({from:wallet});
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
            });
        });

        it ('should fail when buy earlier than startTime', async function () {
            await icoContract.unHalt({from:wallet});
            await icoContract.setMockedBlockTime(startTime - 1);
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[0],{from:accounts[0],value:web3.toWei(1)});
            });
        });

        it ('should fail when value < 0.1 ether', async function () {
            await icoContract.unHalt({from:wallet});
            await icoContract.setMockedBlockTime(startTime);
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[0],{from:accounts[0],value:(new BigNumber(minEther).minus(1))});
            });
        });

        it ('should fail when value > 20 ether', async function () {
            const balance = web3.fromWei(web3.eth.getBalance(accounts[0]));
            await icoContract.unHalt({from:wallet});
            await icoContract.setMockedBlockTime(startTime);
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[0],{from:accounts[0],value:(new BigNumber(maxEther).add(1))});
            });
        });

        it ('should succeed when value is between 0.1ether and 20ether', async function () {
            const userIndex = 0;
            const loopCount = 2;
            console.log("value>20.1ether ? balance=" + web3.fromWei(web3.eth.getBalance(accounts[userIndex])));
            for (let i=1; i<loopCount; i++) {
                console.log("wallet:" + new BigNumber(web3.eth.getBalance(wallet)));
                let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[userIndex]));
                let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
                let tokenTimes = new BigNumber(250);
                const balance = new BigNumber(web3.eth.getBalance(wallet));
                let ethMount = minBuy;
                if (i === 1) {
                    ethMount = maxBuy;
                }
                await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
                await icoContract.buyDelphyToken(accounts[userIndex],{from:accounts[userIndex],value:web3.toWei(ethMount)});
                const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
                const gasMount = (new BigNumber(ethMount)).times(ether);
                console.log("accout0=" + web3.fromWei(web3.eth.getBalance(accounts[userIndex])));
                console.log(tokenMount);
                console.log(gasMount);
                console.log("wallet:" + new BigNumber(web3.eth.getBalance(wallet)));
                assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[userIndex]))) === 0);
                assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
                assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
            }
        });

        it ('should succeed when buy between startTime and endTime', async function () {
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

        it ('should succeed when receiver address is 0', async function () {
            const userIndex = 1;
            const loopCount = 1;
            for (let i=0; i<loopCount; i++) {
                let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[userIndex]));
                let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
                let tokenTimes = new BigNumber(250);
                const balance = new BigNumber(web3.eth.getBalance(wallet));
                const ethMount = 0.2;
                await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
                await icoContract.buyDelphyToken('0x00',{from:accounts[userIndex],value:web3.toWei(ethMount)});
                const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
                const gasMount = (new BigNumber(ethMount)).times(ether);
                assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[userIndex]))) === 0);
                assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
                assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
            }
        });

        it ('should succeed when calling fallback function', async function () {
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

        it ('should succeed when buy for other users', async function () {
            const userIndex = 3;
            const receiverIndex = 4;
            const loopCount = 5;
            for (let i=0; i<loopCount; i++) {
                let lockedToken = new BigNumber(await icoContract.lockedBalances(accounts[receiverIndex]));
                let openSoldToken = new BigNumber(await icoContract.openSoldTokens());
                let tokenTimes = new BigNumber(250);
                const balance = new BigNumber(web3.eth.getBalance(wallet));
                const ethMount = 0.2;
                await icoContract.setMockedBlockTime(startTime + (endTime - startTime) * i / loopCount);
                await icoContract.buyDelphyToken(accounts[receiverIndex],{from:accounts[userIndex],value:web3.toWei(ethMount)});
                const tokenMount = (new BigNumber(ethMount)).times(ether).times(tokenTimes);
                const gasMount = (new BigNumber(ethMount)).times(ether);
                assert((lockedToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.lockedBalances(accounts[receiverIndex]))) === 0);
                assert((openSoldToken.add(tokenMount)).comparedTo(new BigNumber(await icoContract.openSoldTokens())) === 0);
                assert(balance.add(gasMount).comparedTo(new BigNumber(web3.eth.getBalance(wallet))) === 0);
            }
        });

        it ('should fail when buy later than endTime', async function () {
            await icoContract.setMockedBlockTime(endTime);
            await assertFail(async function () {
                await icoContract.buyDelphyToken(accounts[1],{from:accounts[1],value:web3.toWei(1)});
            });
        });

        it ('should succeed when the last purchase exceeds the left-over', async function () {
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

        it ('should fail when MAX_OPEN_SOLD_AMOUNT is sold out', async function () {
            await icoContract.setMockedBlockTime(startTime);
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

        it ('should succeed after endTime', async function () {
            const lockedCount = new BigNumber(await icoContract.lockedBalances(accounts[1]));
            await icoContract.setMockedBlockTime(endTime + 1);
            await icoContract.claimTokens(accounts[1], {from:accounts[1]});
            const tokenCount = new BigNumber(await tokenContract.balanceOf(accounts[1]));
            assert(lockedCount.comparedTo(tokenCount) === 0);
        });

        it ('should succeed if receiver == 0x0 and the receiver should be msg.sender', async function () {
            const lockedCount = new BigNumber(await icoContract.lockedBalances(accounts[0]));
            await icoContract.setMockedBlockTime(endTime + 1);
            await icoContract.claimTokens('0x0', {from:accounts[0]});
            const tokenCount = new BigNumber(await tokenContract.balanceOf(accounts[0]));
            assert(lockedCount.comparedTo(tokenCount) === 0);
        });

        it ('should fail when user locked token == 0', async function () {
            await icoContract.setMockedBlockTime(endTime + 1);
            await assertFail(async function() {
                await icoContract.claimTokens(accounts[1], {from:accounts[1]});
            });
        });
    });

    describe('CONTRACT finishICO', () => {
        it ('should fail when caller is not wallet', async function () {
            await icoContract.setMockedBlockTime(endTime+1);
            await assertFail(async function() {
                await icoContract.finishICO({from:accounts[3]})
            });
        });
        it ('should fail before endTime', async function () {
            await icoContract.setMockedBlockTime(endTime);
            await assertFail(async function() {
                await icoContract.finishICO({from:wallet})
            });
        });
        it ('should succeed when call from wallet', async function () {
            await icoContract.setMockedBlockTime(endTime+1);
            await icoContract.finishICO({from:wallet});
            const walletToken = new BigNumber(await tokenContract.balanceOf(wallet));
            const openSoldToken = new BigNumber(await icoContract.openSoldTokens());
            assert(walletToken.add(openSoldToken).comparedTo(MAX_OPEN_SOLD_AMOUNT) === 0);
        });
    });

});
