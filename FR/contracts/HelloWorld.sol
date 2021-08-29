// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// This is a simple contract that keeps calling order
contract HelloWorld {
    uint order;
    event Hello(address _from, uint order);

    constructor() public {
        order = 1;
  }
    function sayHello() public {
        emit Hello(msg.sender, order);
        order += 1;
    }
}
