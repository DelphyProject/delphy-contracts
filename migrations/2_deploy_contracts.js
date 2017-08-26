var ConvertLib = artifacts.require("./ConvertLib.sol");
var Math = artifacts.require("./Math.sol");
var DelphyICO = artifacts.require("./DelphyICO.sol");
var DelphyICOMock = artifacts.require("./DelphyICOMock.sol");

module.exports = function(deployer,network, accounts) {
    // var timenow = new Date().getTime();
    var timenow = new Date('2017/08/31 20:00:00').getTime();
    var left = timenow % 1000;
    var timeseconds = (timenow - left) / 1000;
    deployer.deploy(ConvertLib);
    // deployer.link(ConvertLib, [DelphyToken, DelphyICO]);
    deployer.link(ConvertLib, [DelphyICO,DelphyICOMock]);
    deployer.deploy(Math);
    // deployer.link(Math, [DelphyToken, DelphyICO]);
    deployer.link(Math, [DelphyICO,DelphyICOMock]);
    // deployer.deploy(DelphyICO, accounts[9], timeseconds);
    deployer.deploy(DelphyICO, "0x068bE8672E0df9E827d0F2f94B7Eef84D708B5Ff", timeseconds);
};
