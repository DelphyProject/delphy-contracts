const HDWalletProvider = require('truffle-hdwallet-provider');
//a4369e77024c2ade4994a9345af5c47598c7cfb36c65e8a4a3117519883d9014
const mnemonic = process.env.TEST_MNEMONIC || 'delphy mnemonic delphy mnemonic delphy mnemonic delphy mnemonic delphy mnemonic delphy mnemonic';
const providerRopsten = new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/', 0);
const providerRinkeby = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/', 0);
const providerKovan = new HDWalletProvider(mnemonic, 'https://kovan.infura.io', 0);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4000000,
      gasPrice: 20e9,
    },
    development_migrate: {
      network_id: "*",
      host: "localhost",
      port: 8545,
      gas: 4000000,
      gasPrice: 20e9,
      from: "0xf93df8c288b9020e76583a6997362e89e0599e99",
    },
    live: {
      host: "178.25.19.88",
      port: 80,
      network_id: 1,
      // optional config values:
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
      // provider - web3 provider instance Truffle should use to talk to the Ethereum network.
      //          - if specified, host and port are ignored.
    },
    mainnet: {
      network_id: 1,
      host: "https://mainnet.infura.io/metamask",
      port: 80,
      gas: 4000000,
      gasPrice: 20e9,
      from: "0xf93df8c288b9020e76583a6997362e89e0599e99",
    },
    ropsten: {
      network_id: 3,
      provider: providerRopsten,
      gas: 4000000,
      gasPrice: 20e9,
    },
    rinkeby: {
        host: "118.190.71.27",
        port: 8545,
        network_id: 4,
        gas: 4000000,
        gasPrice: 20e9,
        from: "0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e",
    },
    kovan: {
      network_id: 42,
      provider: providerKovan,
      gas: 4000000,
      gasPrice: 20e9,
    },
    ours: {
      host: "192.168.0.34",
      port: 6545,
      network_id: "*",
      gas: 4000000,
      gasPrice: 20e9,
      from: "0x5dfe021f45f00ae83b0aa963be44a1310a782fcc",
    },
  }
};
