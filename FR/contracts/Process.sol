// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {Commit} from "./Commit.sol";
import {Participate} from "./Participate.sol";
import {HelloWorld} from "./HelloWorld.sol";
import {Commit} from "./Commit.sol";

contract Process {
  // BlockNumber => which one to execute
  mapping (uint => mapping (uint => bool)) public ProcessedList;

  event CommitmentConfirmed(uint BlockNumber, uint order);
  event CommitmentNotConfirmed(uint BlockNumber, uint order);
  event ExFailure();

  Commit CommitContract;
  Participate ParticipateContract;
  HelloWorld TargetContract;
  bytes4 FUNC_SELECTOR;

  constructor(Commit CommitAddress, Participate ParticipateAddress, HelloWorld TargetAddress) public {
    CommitContract = CommitAddress;
    ParticipateContract = ParticipateAddress;
    TargetContract = TargetAddress;
    FUNC_SELECTOR = bytes4(keccak256("sayHello(bytes)"));
  }

  function executeTX(uint BlockNumber, uint index, bytes memory transaction, string memory rand) public payable {
   // require(block.number == BlockNumber, "Block number not matching");
    uint length = CommitContract.getLength(BlockNumber);
    TX memory aTX = _decode(transaction);
    bytes32 commitment = keccak256(abi.encodePacked(transaction, rand));
    commitment = keccak256(abi.encodePacked(aTX.owner, commitment));

    require(ParticipateContract.contains(msg.sender), "Not in participating list.");
    require(index < length, "index out of block commitment list range.");
    require(ProcessedList[BlockNumber][index] == false, "has been processed");
    ProcessedList[BlockNumber][index] = true;

    if(commitment == CommitContract.getCommitment(BlockNumber, index)) {
      emit CommitmentConfirmed(BlockNumber, index);
      // Pass the transaction to target address
      bytes memory data = abi.encodeWithSelector(FUNC_SELECTOR, transaction);
      (bool success, bytes memory returnData) = address(TargetContract).call(data);
      if (!success) {
        emit ExFailure();
      }
    } else {
      emit CommitmentNotConfirmed(BlockNumber, index);
     }
  }

  struct TX {
    // TODO could add field like signature, from, to...
    bytes data; // additional data left for messages
    address owner; // transaction sender
  }

  function _decode(bytes memory transaction) internal returns (TX memory) {
    bytes memory data;
    address owner;
    (data, owner) = abi.decode(transaction, (bytes, address));
    return TX(data, owner);
  }
}
