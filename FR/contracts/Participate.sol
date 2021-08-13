// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Participate {

  mapping (address => bool) public Decrypters;
  uint EntryFee;

  event Join(address _from);
  event Leave(address _from);

  constructor() public {
    EntryFee = 10;
  }


  function join() payable public {
    require(contains(msg.sender) == false); // not in the list
    require(msg.value >= EntryFee); // enough payment

    Decrypters[msg.sender] = true;
    emit Join(msg.sender);
  }


  function leave() public returns (bool) {
    if(contains(msg.sender)){
      Decrypters[msg.sender] = false;
      emit Leave(msg.sender);
      return true;
      // TODO; potential reward could be given.
    }
    return false;
  }


  function contains(address addr) public returns (bool){
    return Decrypters[addr];
  }
}
