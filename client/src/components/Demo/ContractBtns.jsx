import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK('a03c672af5ea0a119f02', '2deae47984cdb680ba2a9bc3e4d65691382ce9f51c7f875fb0354880686eed52');

function ContractBtns({ setValue }) {
  const { state: { contract, accounts } } = useEth();
  const [username, setUsername] = useState("");
  const [tweet, setTweet] = useState("");
  const [userAccount, setUserAccount] = useState("");

  const getAllUsers = async () => {
    const value = await contract.methods.getUsers().call({ from: userAccount });
    setValue(value);
  };

  const addNewUser = async e => {
    if (username === "") {
      alert("Please enter a username.");
      return;
    }
    const res = await contract.methods.addUser(username).send({ from: userAccount });
    console.log({res});
  };

  const postTweet = async e => {
    const res = await pinata.testAuthentication()
    console.log(res)
    if (tweet === "") {
      alert("Please enter a tweet.");
      return;
    }
    await contract.methods.postTweet(tweet).send({ from: userAccount });
  };

  const likeTweet = async () => {
    const res = await contract.methods.likeTweet(userAccount).send({ from: userAccount });
    console.log({res});
  };

  const retweet = async () => {
    const res = await contract.methods.retweet(userAccount).send({ from: userAccount });
    console.log({res});
  };

  const getUserTweet = async () => {
    const value = await contract.methods.getUserTweet(userAccount).call({ from: userAccount });
    setValue(value);
  };

  return (
    <div className="btns">

      <select onChange={(e) => setUserAccount(String(e.target.value))}>
        <option>Select Option</option>
        {accounts.map((account) => (
          <option value={account}>{account}</option>
        ))}
      </select>
      <br/><br/>
      <button onClick={getAllUsers}>
        Get All Users
      </button>
      <br/><br/>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(String(e.target.value))}
        />
        <button onClick={addNewUser}>
          Add New User
        </button>
      </div>
      <br/><br/>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Tweet"
          value={tweet}
          onChange={(e) => setTweet(String(e.target.value))}
        />
        <button onClick={postTweet}>
          Tweet
        </button>
      </div>
      <br/><br/>
      <button onClick={likeTweet}> Like Tweet </button>
      <button onClick={retweet}> Retweet </button>
      <button onClick={getUserTweet}> Get Tweet </button>

    </div>
  );
}

export default ContractBtns;
