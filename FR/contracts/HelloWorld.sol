// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract HelloWorld {
  constructor() public {
  }
    function sayHello() public returns (string memory) {
        return ("Hello World");
    }
}
