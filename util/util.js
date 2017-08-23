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

toChecksumAddress("0xad854341e7989f5542189bb52265337e2993b7bc");
toChecksumAddress("0x431cf2c7310d15ec9316510daf6bbc48557ecb2c");
toChecksumAddress("0x4a75c0bd3e9b71a99fc9a5caa92fcdb9bc62a374");
toChecksumAddress("0x32d192a05030f3cf34ddb017b1306fb0e1378e1e");
toChecksumAddress("0x24b7c7800a3636844898832463fb6934337d8518");
toChecksumAddress("0xd6355e36b4715d7ef80432ed0f7063febe0806a5");
toChecksumAddress("0x0ae113402585e65d52a047ff0b6936683b5de63f");

