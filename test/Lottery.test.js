// Run command => npm install mocha ganache-cli web3
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');   // constructor
const web3 = new Web3(ganache.provider()); // instance to connect with local test network (ganache)
const { interface, bytecode } = require('../compile'); // getting access to bytecode from compile.js

let accounts;
let lottery;

beforeEach(async () => {
    // Get a list of all accounts
    // Note := every function we call tied to web3 returns a promise
    // Note: when we use await then mark async in the function that contains await
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async ()=> {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length)
    });

    it('allows multiple accounts to enter', async ()=> {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length)
    });

    // it('requires a minimum amount of ether to enter', async () => {
    //     try{
    //         await lottery.methods.enter().send({
    //             from: accounts[0],
    //             value: 0
    //         }); 
    //         assert(false); // Deliberately failing the test if the above lines don't give error.
    //     } catch (err) {
    //         assert(err);
    //     } 
    // });

    it('requires a minimum amount of ether to enter', async () => {
        let executed;
        try {
          await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.001', 'ether')  // To enter ether must be greater than 0.01
          });
          executed = 'player added';
        } catch (err) {
          executed = 'player not added'
        }
        console.log(executed);
        assert.equal('player not added', executed);
      });

    // it('only manager can call pickWinner', async () => {
    //     try{
    //         await lottery.methods.pickWinner().send({
    //             from: accounts[0]
    //         });
    //         assert(false);
    //     } catch( err) {
    //         assert(err);
    //     }
    // });
     
    it('only manager can call pickWinner', async () => {
        let executed;
        try {
          // At least one person must enter the lottery else pickWinner will fail
          // even if invoked by the manager and this test will pass
          // because the error will be caught by the catch block.
          await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
          });
     
          await lottery.methods.pickWinner().send({
            from: accounts[1] // change index here. 
          });
          console.log("manager is accounts[0], catch block skipped");
     
          executed = 'success';
        } catch (err) {
          console.log("manager is not accounts[0], catch block triggers");
          executed = 'fail';
        }
        
        assert.equal('fail', executed);
      });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
      //  console.log(finalBalance - initialBalance);
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});