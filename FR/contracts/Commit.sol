// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Commit {
  // block number => (index => commitHash)
  mapping (uint => mapping(uint => bytes32)) public Commitments;
  // block number => (length of commitment)
  mapping (uint => uint) public length;

  event TransactionCommit(bytes EncryptedTX, string rand, uint blockNumber, uint index);

  constructor() public {
  }
  // Users' commitment should be the hash of plain message
  function makeCommitment (bytes memory EncryptedTX, string memory rand, bytes32 commitment ,uint blockNumber) public payable {
    // Could adding more requirements to control the structures
    require(block.number < blockNumber, "Can only commit to future block");
    require(msg.value > 0, "Pay gas fee");

    // Make commitment
    uint index = length[blockNumber]; //default is 0
    length[blockNumber] = index + 1; // increment
    // commitment for both identity and tx commitment
    Commitments[blockNumber][index] = keccak256(abi.encodePacked(msg.sender, commitment));
    emit TransactionCommit(EncryptedTX, rand, blockNumber, index);
  }

  // get commitment
  function getCommitment(uint blockNumber, uint index) public view returns (bytes32) {
    return Commitments[blockNumber][index];
  }

  function getLength(uint blockNUmber) public view returns (uint) {
    return length[blockNUmber];
  }
}
