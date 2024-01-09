// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract InstaChain {
  mapping (address => string) instaHash;

  address owner;

  constructor() {
    owner = msg.sender;
  }

  event InstaPosted(string ipfsHash);

  // Modifier to check the length of a string
  modifier checkLength(string memory _string) {
      require(bytes(_string).length > 0, "Value not found");
      _;
  }

  function post(string memory _ipfsHash) checkLength(_ipfsHash) public {
    instaHash[msg.sender] = _ipfsHash;
    emit InstaPosted(_ipfsHash);
  }

  function get() public view returns(string memory) {
    return instaHash[msg.sender];
  }
}
