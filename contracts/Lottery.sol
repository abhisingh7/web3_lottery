pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        // condition for player to enter in a lottery to deposit .01 ether
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    // creating a large random value. because solidity doesn't have random module.
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted {
        // only manager can announce winner
        // require(msg.sender == manager); // using modifier for this.
        // algo for selecting random winner's index.
        uint index = random() % players.length;
        // transfering all the ethers deposited to the winner's address
        players[index].transfer(this.balance);
        // creating dynamic empty array to reset the lottery game.
        players = new address[](0);
    }

    // function modifiers can be used to reduce code redundancy.
    // The name of function modifier can be anything. for now we are using restricted.
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }
}