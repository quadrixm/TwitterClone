// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TwitterClone {
  struct User {
    string username;
    address userAdddress;
  }

  struct Tweet {
    string ipfsHash;
    uint likes;
    uint retweets;
  }

  User[] public users;
  mapping (address => Tweet) userTweet;
  mapping (string => bool) usernameExistMap;
  mapping (address => bool) userExistMap;

  address admin;

  constructor() {
    admin = msg.sender;
  }

  event TweetPosted();
  event TweetLiked();
  event TweetRetweeted();

  modifier userNotExist(string memory _username) {
    require(!usernameExistMap[_username], "Username already exists");
    require(!userExistMap[msg.sender], "User exists");
    _;
  }

  modifier userExist() {
    require(userExistMap[msg.sender], "User not exists");
    _;
  }

  // Modifier to check the length of a string
  modifier checkLength(string memory _string, uint _length) {
      require(bytes(_string).length <= _length, "Value too long");
      _;
  }

  function addUser(string memory _username) checkLength(_username, 32) userNotExist(_username) public {
    users.push(User({
      username: _username,
      userAdddress: msg.sender
    }));
    usernameExistMap[_username] = true;
    userExistMap[msg.sender] = true;
  }

  function postTweet(string memory _ipfsHash) checkLength(_ipfsHash, 64) userExist public {
    userTweet[msg.sender] = Tweet({
      ipfsHash: _ipfsHash,
      likes: 0,
      retweets: 0
    });
    emit TweetPosted();
  }

  function likeTweet(address _user) public {
    userTweet[_user].likes += 1;
    emit TweetLiked();
  }

  function retweet(address _user) public {
    userTweet[_user].retweets += 1;
    userTweet[msg.sender] = userTweet[_user];
    emit TweetRetweeted();
  }

  function getUsers() public view returns (User[] memory) {
    return users;
  }

  function getUserTweet(address _user) public view returns (Tweet memory) {
    return userTweet[_user];
  }
}
