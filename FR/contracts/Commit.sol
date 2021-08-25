// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Commit {
  // block number => (index => commitHash)
  mapping (uint => mapping(uint => bytes32)) public Commitments;
  // block number => (length of commitment)
  mapping (uint => uint) public length;

  event TransactionCommit(bytes32 EncryptedTX, uint blockNumber, uint index);

  constructor() public {
  }
  // Users' commitment should be the hash of plain message
  function makeCommitment (bytes memory EncryptedTX, bytes32 commitment ,uint blockNumber) public payable {
    // Could adding more requirements to control the structures
    require(block.number < blockNumber, "Can only commit to future block");
    require(msg.value > 0, "Pay gas fee");

    // Make commitment
    uint index = length[blockNumber]; //default is 0
    length[blockNumber] = index + 1; // increment

    // Simple commitment, could consider putting previous commitment to make it like a chain
    //bytes memory package =
    //abi.encodePacked(
    //  index, // index of commitment in the storage
    //  transaction, // encrypted transactions
    //  blockNumber  // block number
    //);
    //bytes32 commitment = keccak256(package);

    Commitments[blockNumber][index] = commitment;

    emit TransactionCommit(EncryptedTX, blockNumber, index);
  }

  // get commitment
  function getCommitment(uint blockNumber, uint index) public view returns (bytes32) {
    return Commitments[blockNumber][index];
  }

  function getLength(uint blockNUmber) public view returns (uint) {
    return length[blockNUmber];
  }
}
