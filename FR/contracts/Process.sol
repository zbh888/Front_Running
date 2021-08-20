// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {Commit} from "./Commit.sol";
import {Participate} from "./Participate.sol";

contract Process {
  // BlockNumber => which one to execute
  mapping (uint => uint) public ProcessOrderList;

  event ProcessSuccess(uint BlockNumber, uint order);
  event ProcessFailure(uint BlockNumber, uint order);

  Commit CommitContract;
  Participate ParticipateContract;

  constructor(Commit CommitAddress, Participate ParticipateAddress) public {
    CommitContract = CommitAddress;
    ParticipateContract = ParticipateAddress;
  }

  function executeCipherBatch(uint BlockNumber, bytes memory transactions) public {
    uint length = CommitContract.getLength(BlockNumber);
    bytes32 commitment = keccak256(transactions);

    require(ParticipateContract.contains(msg.sender), "Not in participating list.");
    require(ProcessOrderList[BlockNumber] < length, "index out of block commitment list range.");

    if(commitment == CommitContract.getCommitment(BlockNumber, ProcessOrderList[BlockNumber])) {
      emit ProcessSuccess(BlockNumber, ProcessOrderList[BlockNumber]);
      // TODO Pass the transaction to target address
    } else {
      emit ProcessFailure(BlockNumber, ProcessOrderList[BlockNumber]);
    }

    ProcessOrderList[BlockNumber] = ProcessOrderList[BlockNumber] + 1;
  }


}
