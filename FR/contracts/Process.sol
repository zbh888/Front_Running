// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {Commit} from "./Commit.sol";
import {Participate} from "./Participate.sol";
import {HelloWorld} from "./HelloWorld.sol";

contract Process {
  // BlockNumber => which one to execute
  mapping (uint => mapping (uint => bool)) public ProcessedList;
  // Money bank
  mapping (address => uint) private balances;

  event Deposit(address depositer, uint value);
  event CommitmentConfirmed(uint BlockNumber, uint order);
  event CommitmentNotConfirmed(uint BlockNumber, uint order);
  event ExFailure();

  Commit CommitContract;
  Participate ParticipateContract;
  HelloWorld TargetContract;

  constructor(Commit CommitAddress, Participate ParticipateAddress, HelloWorld TargetAddress) public {
    CommitContract = CommitAddress;
    ParticipateContract = ParticipateAddress;
    TargetContract = TargetAddress;
  }

  function deposit() public payable returns (uint) {
    balances[msg.sender] += msg.value;
    emit Deposit(msg.sender, msg.value);
    return balances[msg.sender];
  }

  function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
    if (withdrawAmount <= balances[msg.sender]) {
      balances[msg.sender] -= withdrawAmount;
      msg.sender.transfer(withdrawAmount);
    }
    return balances[msg.sender];
  }

  // This function execute one transaction
  function executeTX(uint BlockNumber, uint index, bytes memory transaction, address owner) public {

    uint length = CommitContract.getLength(BlockNumber);
    TX memory aTX = _decode(transaction); // decoding

    //require(block.number >= BlockNumber, "Block number not matching");
    //require(block.number <= BlockNumber + aTX.threshold, "Block number not matching");
    bytes32 commitment = keccak256(abi.encodePacked(transaction));
    commitment = keccak256(abi.encodePacked(owner, commitment));

    require(ParticipateContract.contains(msg.sender), "Not in participating list.");
    require(index < length, "index out of block commitment list range.");
    require(ProcessedList[BlockNumber][index] == false, "has been processed"); // TODO gas fee should be returned

    if(commitment == CommitContract.getCommitment(BlockNumber, index)) {
      // TODO Pass commitment, end of participator's duty, reward should be given to processor msg.sender
      ProcessedList[BlockNumber][index] = true;
   //   require(balances[owner] >= aTX.value, "Not enough money");
      emit CommitmentConfirmed(BlockNumber, index);
      // Pass the transaction to target address
      bytes4 FUNC = bytes4(keccak256(bytes(aTX.FUNC_SELECTOR)));
      bytes memory data = abi.encodeWithSelector(FUNC, transaction, owner);
      (bool success, bytes memory returnData) = address(TargetContract).call(data);
      if (!success) {
        emit ExFailure();
      } else {
        address payable PayableContract = address(uint160(address(TargetContract)));
        bool sent = PayableContract.send(aTX.value);
        balances[owner] -= aTX.value;
        require(sent, "Failed to send Ether");
      }
    } else {
      // May be the issue of user sending an wrong commitment
      // or participator lie about changed the transaction
      // either way, no reward should be returned since participator could verify the commitment
      emit CommitmentNotConfirmed(BlockNumber, index);
     }
  }


  struct TX {
    bytes data; // additional data left for messages
    uint value; // Number of Wei
    string FUNC_SELECTOR; // Which function to call
    uint threshold; // waiting to be executed, 0 completely prevent front running
    bytes rand; // randomness for ordering

    address parameter1; // Say hello to
  }

  function _decode(bytes memory transaction) internal returns (TX memory) {
    bytes memory data;
    uint value;
    string memory FUNC_SELECTOR;
    uint threshold;
    bytes memory rand;

    address parameter1;

    (data, value, FUNC_SELECTOR, threshold, rand, parameter1) = abi.decode(transaction, (bytes, uint, string,uint,bytes, address));
    return TX(data, value, FUNC_SELECTOR,threshold, rand, parameter1);
  }
}
