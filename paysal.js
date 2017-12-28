const fs = require('fs');
const csv = require("comma-separated-values");
const argv = require('yargs').argv;
const BigNumber = require("bignumber.js");
const assert = require("assert");
const config = require("./truffle.js");
var Web3 = require('web3');

function usage() {
    let path = process.argv[1].split('\\');
    let scriptname = path[path.length-1];

    console.log("Usage: node " + scriptname +
                " --network name --infile data.csv --delphy address --paysal address");
};

function help() {
    console.log('Options:\n    --network name   \tEthereum network name\n' + 
                          '    --infile data.csv  \tInput payment csv file name\n' +
                          '    --delphy address   \tAddress of DelphyToken contract\n' + 
                          '    --paysal address   \tAddress of PalSal contract\n' +
                          '    --version          \tShow version number\n' +
                          '    -h                 \tPrint this help');
}

async function main() {
    if (argv.h != undefined) {
        help();
        return;
    }

    if (argv.infile == undefined ) 
    {
        usage();
        return;
    }

    let infile = argv.infile;
    let network = argv.network;
    if (network == undefined) {
        network = config.networks[0];
    }
    let delphyTokenAddress = argv.delphy;
    let paySalAddress = argv.paysal;

    const ether = new BigNumber(Math.pow(10, 18));
    const dpy = ether;

    try {
        let data;
        let paymentList;
        let url;

        data = fs.readFileSync(infile,'utf-8');
        paymentList = new csv(data,{header:true,cast:['String', 'Number','Number','Number','Number', 'String']}).parse();

        url = "http://"+config.networks[network].host+":"+config.networks[network].port;
        let web3 = new Web3(new Web3.providers.HttpProvider(url));
        let networkId = web3.version.network;
        let account_0 = web3.eth.accounts[0];

        /// Construct a DelphyICO contract
        contractAbs = require("./build/contracts/DelphyICO.json");
        let delphyICOAbs = web3.eth.contract(contractAbs["abi"]);
        let delphyICOAddress = contractAbs.networks[networkId].address;
        let delphyICOContract = delphyICOAbs.at(delphyICOAddress);

        await delphyICOContract.finishICO({from:account_0, gas:200000});

        /// Construct a DelphyToken contract
        contractAbs = require("./build/contracts/DelphyToken.json");
        let delphyTokenAbs = web3.eth.contract(contractAbs["abi"]);
        let delphyTokenAddress = delphyICOContract.delphyToken();
        let delphyTokenContract = delphyTokenAbs.at(delphyTokenAddress);

        /// Construct a PaySal contract
        contractAbs = require("./build/contracts/PaySal.json");
        let paySalAbs = web3.eth.contract(contractAbs["abi"]);
        paySalAddress = contractAbs.networks[networkId].address;
        let paySalContract = paySalAbs.at(paySalAddress);
        await paySalContract.setDelphy(delphyTokenAddress, {from:account_0, gas:1000000});

        /// Send some 30 Eth and 30000 Dpy to PaySal contract so we can test it. 
        await web3.eth.sendTransaction({from:account_0, to:paySalAddress, value:'10000000000000000000'});
        await delphyTokenContract.transfer(paySalAddress, 300000000000000000000, {from:account_0, gas:100000});

        /// Balance of paySalContract before testing;
        let ethBalanceOfPaySalB = web3.fromWei(web3.eth.getBalance(paySalAddress),'ether').toString();
        let dpyBalanceOfPaySalB = web3.fromWei(delphyTokenContract.balanceOf(paySalAddress),'ether').toString();
        console.log("Initially PaySal Contract has " + ethBalanceOfPaySalB +
                    " ETH and " + dpyBalanceOfPaySalB + " DPY\n");

        /// getFrozen should retrun all 0;
        let frozenInit = paySalContract.getFrozen();
        assert.deepEqual(frozenInit[0] ,new BigNumber(0), "FrozenEth should return (0,0) initially");
        assert.deepEqual(frozenInit[1] ,new BigNumber(0), "FrozenDpy should return (0,0) initially");
        console.log("Passed: Initial frozen (ETH, DPY) is (0, 0)\n");

        let ethPaid = new BigNumber(0);
        let dpyPaid = new BigNumber(0);
        let withdrawAccount;

        paymentList.forEach(async function(payment, index) {
            //console.log(payment);
            
            ethPaid = ethPaid.add(payment.ethPaid);
            dpyPaid = dpyPaid.add(payment.dpyPaid);

            let releaseTime = new Date(payment.releaseTime).getTime();
            let left = releaseTime % 1000;
            releaseTime = (releaseTime - left) / 1000;

            let releaseNow = new Date().getTime();
            left = releaseNow % 1000;
            releaseNow = (releaseNow - left) / 1000;
            releaseNow += 2;

            if (index == 0) {
                // first a delayed pay, when iteration of paymentList is over, 
                // withdraw this payment
                releaseTime = releaseNow;
                withdrawAccount = payment['payeeAddress'];
            }
            
            console.log("About to pay " + payment.ethPaid.toString() +
                        " ETH and " + payment.dpyPaid.toString() + 
                        " DPY to account " + payment['payeeAddress'] + "\n");
            let ethbalance = web3.fromWei(web3.eth.getBalance(payment['payeeAddress']),'ether').toString();
            let dpybalance = web3.fromWei(delphyTokenContract.balanceOf(payment['payeeAddress']),'ether').toString();
            console.log("Before payment, balance of account '" + payment['payeeAddress'] + 
                        " is:" + ethbalance + " ETH, " + dpybalance + " DPY\n");
            
            await paySalContract.paySalary(payment['payeeAddress'],
                                           new BigNumber(payment.salary).times(100),
                                           new BigNumber(payment.nounce),
                                           web3.toWei(payment.ethPaid),
                                           web3.toWei(payment.dpyPaid),
                                           releaseTime,
                                           {from:account_0, gas:2000000});
            
            ethbalance = web3.fromWei(web3.eth.getBalance(payment['payeeAddress']),'ether').toString();
            dpybalance = web3.fromWei(delphyTokenContract.balanceOf(payment['payeeAddress']),'ether').toString();
            console.log("After payment, balance of account '" + payment['payeeAddress'] + 
                        " is:" + ethbalance + " ETH, " + dpybalance + " DPY\n");

            let frozenValue = paySalContract.getFrozen();
            let fozEth = web3.fromWei(frozenValue[0],'ether').toString();
            let fozDpy = web3.fromWei(frozenValue[1],'ether').toString();
            console.log("Frozen value now is :" + fozEth + 
                        " ETH, " + fozDpy + " DPY\n");
        });

        setTimeout(async () => {
            let delayed = await paySalContract.getBalance({from:withdrawAccount});
            let delayEth = web3.fromWei(delayed[1],'ether').toString();
            let delayDpy = web3.fromWei(delayed[2],'ether').toString();
            console.log("Delayed payment balance of account " + withdrawAccount +
                        "is: " + delayEth + " ETH, " + delayDpy + " DPY\n");

            await paySalContract.withdrawSalary({from:withdrawAccount, gas:2000000});
            
            console.log("Accoutn:" + withdrawAccount + " now withdrawed!\n");
            delayed = paySalContract.getBalance();
            delayEth = web3.fromWei(delayed[1],'ether').toString();
            delayDpy = web3.fromWei(delayed[2],'ether').toString();
            console.log("Now delayed payment balance of account " + withdrawAccount +
                        "is: " + delayEth + " ETH, " + delayDpy + " DPY\n");
            
            ethbalance = web3.fromWei(web3.eth.getBalance(withdrawAccount),'ether').toString();
            dpybalance = web3.fromWei(delphyTokenContract.balanceOf(withdrawAccount),'ether').toString();
            console.log("Balance of account '" + withdrawAccount + 
                        " is:" + ethbalance + " ETH, " + dpybalance + " DPY\n");

            let ethBalanceOfPaySalA = web3.fromWei(web3.eth.getBalance(paySalAddress),'ether').toString();
            let dpyBalanceOfPaySalA = web3.fromWei(delphyTokenContract.balanceOf(paySalAddress),'ether').toString();
            console.log("Now before reclaim PaySal Contract has " + ethBalanceOfPaySalA +
                        " ETH and " + dpyBalanceOfPaySalA + "DPY\n");

            await paySalContract.reClaim({from:account_0, gas:200000});
            
            ethBalanceOfPaySalA = web3.fromWei(web3.eth.getBalance(paySalAddress),'ether').toString();
            dpyBalanceOfPaySalA = web3.fromWei(delphyTokenContract.balanceOf(paySalAddress),'ether').toString();
            console.log("After reclaim PaySal Contract has " + ethBalanceOfPaySalA +
                        " ETH and " + dpyBalanceOfPaySalA + " DPY\n");

        }, 9000 /* 9 seconds as average block minning time*/);
        
    }
    catch(err) {
        console.error(err);
        return;
    }
}

main();
