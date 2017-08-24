var ethUtil = require('ethereumjs-util');

function isChecksumAddress(address) {
    return address == toChecksumAddress(address);
};
function toChecksumAddress(address) {
    if (typeof address === 'undefined') return '';
    address = address.toLowerCase().replace('0x','');
    var addressHash = ethUtil.sha3(address).toString('hex');
    var checksumAddress = '0x';
    for (var i = 0; i < address.length; i++ )
        checksumAddress += parseInt(addressHash[i], 16) > 7 ? address[i].toUpperCase() : address[i];

    console.log(address,checksumAddress);
    return checksumAddress;
};

var getTimeInSeconds = function (time) {
    var timenow = time;
    var left = timenow % 1000;
    var timeseconds = (timenow - left) / 1000;
    console.log("time=" + timeseconds);
};

var timenow = new Date('2017/08/31 15:00:00').getTime();
console.log(timenow);
getTimeInSeconds(new Date().getTime());

// toChecksumAddress("0xad854341e7989f5542189bb52265337e2993b7bc");
// toChecksumAddress("0x431cf2c7310d15ec9316510daf6bbc48557ecb2c");
// toChecksumAddress("0x4a75c0bd3e9b71a99fc9a5caa92fcdb9bc62a374");
// toChecksumAddress("0x32d192a05030f3cf34ddb017b1306fb0e1378e1e");
// toChecksumAddress("0x24b7c7800a3636844898832463fb6934337d8518");
// toChecksumAddress("0xd6355e36b4715d7ef80432ed0f7063febe0806a5");
// toChecksumAddress("0x0ae113402585e65d52a047ff0b6936683b5de63f");

toChecksumAddress("0xfe2b768a23948eddd7d7caea55baa31e39045382");
toChecksumAddress("0xa9a418da22532bd1189ff8be5cdaf3570bf9da43");
toChecksumAddress("0x9f3a4bbed4660f2dccd6e980e2faa6d6214e5dc8");
toChecksumAddress("0xc10261166b4699d3c1535aa30ac29446c755f065");
toChecksumAddress("0xe480219e1904de4500cd8459c74d388457a3f3ec");
toChecksumAddress("0xed7211f84b37b0f62d345462ffeb56b57b787539");
toChecksumAddress("0x127e631e39eaeb0a214dfc5806bbdf26ba5ee214");
toChecksumAddress("0x407420ae394ec19893fdc0244470ff3b5cedc9f1");
