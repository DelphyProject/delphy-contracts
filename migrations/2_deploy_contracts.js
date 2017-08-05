var ConvertLib = artifacts.require("./ConvertLib.sol");
var Math = artifacts.require("./Math.sol");
var DelphyICO = artifacts.require("./DelphyICO.sol");

module.exports = function(deployer,network, accounts) {
  var timenow = new Date().getTime();
  var left = timenow % 1000;
  var timeseconds = (timenow - left) / 1000;
  deployer.deploy(ConvertLib);
  // deployer.link(ConvertLib, [DelphyToken, DelphyICO]);
  deployer.link(ConvertLib, [DelphyICO]);
  deployer.deploy(Math);
  // deployer.link(Math, [DelphyToken, DelphyICO]);
  deployer.link(Math, [DelphyICO]);
  deployer.deploy(DelphyICO, accounts[0], timeseconds);
};
