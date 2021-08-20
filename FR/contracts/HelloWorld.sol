// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract HelloWorld {
    string hello;
    constructor() public {
      hello = "Hi";
  }
    function sayHello() public returns (string memory) {
        return (hello);
    }
}
