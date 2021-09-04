// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// This is a simple contract that keeps calling order
contract HelloWorld {
    uint order;
    event Hello(address _from, uint order);

    // every target contract should have a transaction structure
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

    constructor() public {
        order = 1;
  }
    function sayHello(bytes memory transaction) public {
        // TODO target contract should only accept what from process
        TX memory aTX = _decode(transaction);
        emit Hello(aTX.owner, order);
        order += 1;
    }
}
