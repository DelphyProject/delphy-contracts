# A Simple Sample Contract #

A sample contract and a script that demonstrate usage of DelphyToken Contract.
Read in a csv file and pay(right now or delayed) salary to somebody accordinglly.

## Prerequisite ##

### A small modification of 2_deploy_contracts.js ###

For our test has some DPY to use, replace the next line in migrations/2_deploy_contracts.js

```js
deployer.deploy(DelphyICO, "0x068bE8672E0df9E827d0F2f94B7Eef84D708B5Ff", timeseconds);
```

with this line:

```js
deployer.deploy(DelphyICO, web3.eth.accounts[0], timeseconds);
```

### Modify data.csv ###

Open data.csv with any text editor, make sure 'payeeAddress' column contains effective address on your testnet. Initially they are effective address in Ganache.

Infile should be a csv with follow column:

* payeeAddress - Ethereum address.
* nounce - A always increase integer.
* salary - In USD for example.
* ethPaid - Number of ETH to pay
* dpyPaid - Number of DPY to pay
* releaseTime - Datetime to allow payee withdrawing.

## Prepare environment ##

Install dependence

```shell
npm install
```

Start Ganache or any testnet you like.
Compile and migrate contracts to your network:

```shell
truffle compile
truffle migrate --network development
```

## Run Sample ##

Suppose our testnet is development and in project root directory, run sample as follows:

```shell
node paysal.js --infile data.csv --network development
```
