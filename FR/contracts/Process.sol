// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {Commit} from "./Commit.sol";
import {Participate} from "./Participate.sol";
import {HelloWorld} from "./HelloWorld.sol";
import {Commit} from "./Commit.sol";

contract Process {
  // BlockNumber => which one to execute
  mapping (uint => uint) public ProcessOrderList;

  event ProcessSuccess(uint BlockNumber, uint order);
  event ProcessFailure(uint BlockNumber, uint order);

  event ExFailure();

  Commit CommitContract;
  Participate ParticipateContract;
  HelloWorld TargetContract;
  bytes4 FUNC_SELECTOR;

  constructor(Commit CommitAddress, Participate ParticipateAddress, HelloWorld TargetAddress) public {
    CommitContract = CommitAddress;
    ParticipateContract = ParticipateAddress;
    TargetContract = TargetAddress;
    FUNC_SELECTOR = bytes4(keccak256("sayHello()"));
  }

  function executeTX(uint BlockNumber, bytes memory transaction, string memory rand) public {
    uint length = CommitContract.getLength(BlockNumber);
    bytes32 commitment = keccak256(abi.encodePacked(transaction, rand));

    require(ParticipateContract.contains(msg.sender), "Not in participating list.");
    require(ProcessOrderList[BlockNumber] < length, "index out of block commitment list range.");

    if(commitment == CommitContract.getCommitment(BlockNumber, ProcessOrderList[BlockNumber])) {
      emit ProcessSuccess(BlockNumber, ProcessOrderList[BlockNumber]);
      // Pass the transaction to target address
      bytes memory data = abi.encodeWithSelector(FUNC_SELECTOR, transaction);
      (bool success, bytes memory returnData) = address(TargetContract).call(data);
      if (!success) {
        emit ExFailure();
      }
    } else {
      emit ProcessFailure(BlockNumber, ProcessOrderList[BlockNumber]);
    }

    ProcessOrderList[BlockNumber] = ProcessOrderList[BlockNumber] + 1;
  }
}
