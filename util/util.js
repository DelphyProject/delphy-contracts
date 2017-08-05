
var ethUtil = require('ethereumjs-util');

var isAddress = function (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    // check if it has the basic requirements of an address
    return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
    // If it's all small caps or all all caps, return true
    return true;
  } else {
    // Otherwise check each case
    address = address.replace('0x','');

    // creates the case map using the binary form of the hash of the address
    var caseMap = parseInt(web3.sha3('0x'+address.toLowerCase()),16).toString(2).substring(0, 40);

    for (var i = 0; i < 40; i++ ) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
      if ((caseMap[i] == '1' && address[i].toUpperCase() != address[i])|| (caseMap[i] == '0' && address[i].toLowerCase() != address[i])) {
        return false;
      }
    }
    return true;
  }
};


/**
 * Makes a checksum address
 *
 * @method toChecksumAddress
 * @param {String} address the given HEX adress
 * @return {String}
 */
var toChecksumAddress = function (address) {

  var checksumAddress = '0x';
  address = address.toLowerCase().replace('0x','');

  // creates the case map using the binary form of the hash of the address
  var caseMap = parseInt(ethUtil.sha3('0x'+address),16).toString(2).substring(0, 40);

  for (var i = 0; i < address.length; i++ ) {
    if (caseMap[i] == '1') {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }

  console.log('create: ', address, caseMap, checksumAddress)
  return checksumAddress;
};

var getTimeInSeconds = function (time) {
  var timenow = time;
  var left = timenow % 1000;
  var timeseconds = (timenow - left) / 1000;
  console.log("time=" + timeseconds);
};

getTimeInSeconds(new Date().getTime());

toChecksumAddress("0x0d0844f4d8be3c89c6e086fd00b35a6ae3312d8f");
toChecksumAddress("0x369b5f168bb9e6dadbe4ebcb6ebade158068eb74");
toChecksumAddress("0x76a1892a475c3345ef1f4806d54c74c477ba4f35");
toChecksumAddress("0xd89c2f4a537b3c488cf41896ef93244a0cd54e4c");
toChecksumAddress("0x6cbfa00b79208dcc842380e3790883a6e705f9f2");
toChecksumAddress("0xfa3f264ebb836c9567ad9be28840e8dff841123d");
