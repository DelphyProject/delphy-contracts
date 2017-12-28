var PaySal = artifacts.require("./sample/PaySal.sol");

module.exports = function(deployer,network, accounts) {
    deployer.deploy(PaySal);
};
