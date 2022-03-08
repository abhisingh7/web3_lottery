const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

// putting metamask 12 words nemonic and infura.io node address in provider.
const provider = new HDWalletProvider(
  // remember to change this to your own phrase!
  'stay school hello attitude run vocal canvas adjust cloth tonight relax battle',
  // remember to change this to your own endpoint!
  'https://rinkeby.infura.io/v3/871786a0ec3d4f94b81fa099d02113ef'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();

// node deploy.js
// After successful deployment , copy deployed contract address and go to
// https://rinkeby.etherscan.io/ 
// and paste and go and check the contract on our test network
