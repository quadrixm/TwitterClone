import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { Stack } from '../../stack';
import { myPinata, pinataJwtToken } from '../../ui_env';
const axios = require('axios');

// TODO Fix for next after clicking on previous.
function InstaForm() {
  const { state: { contract, accounts } } = useEth();
  const [post, setPost] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [currentHash, setCurrentHash] = useState("");
  const [prevHash, setPrevHash] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [pinStack, setPinStack] = useState([]);

  const fileChangeHandler = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const accountCangeHandler = async (e) => {
    const val = String(e.target.value);
    setUserAccount(val);
    const hash = await contract.methods.get(val).call({ from: val }) ?? '';
    console.log({hash});
    setIpfsHash(hash);
    setCurrentHash(hash);
  };

  useEffect(() => {
    const tryGetPin = async (pinHash) => {
      try {
        const res = await axios.get(`https://api.pinata.cloud/data/pinList?includeCount=false&hashContains=${pinHash}`, {
          maxBodyLength: "Infinity",
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${pinataJwtToken}`
          }
        });
        console.log(res.data.rows);

        if (res.data.rows.length) {
          const item = res.data.rows[0];
          if (item.metadata.keyvalues) {
            setPrevHash(item.metadata.keyvalues.prevHash);
            const newPinStack = [...pinStack];
            newPinStack.push({hash: pinHash, post: item.metadata.keyvalues.post});
            setPinStack(newPinStack);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (currentHash) {
      tryGetPin(currentHash);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHash]);

  const handlePreviousClick = async () => {
    const newPintack = [...pinStack];
    const newPin = Stack.pop(newPintack);
    setPrevHash(newPin.hash);
    setPinStack(newPintack);
  }

  const handleSubmission = async () => {
    // const res = await pinata.testAuthentication()
    // console.log(res)
    if (!post) {
      alert("Please enter a post.");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    // const prevHash = await contract.methods.get().call({ from: userAccount }) ?? '';

    // console.log(prevHash);

    const formData = new FormData();
    
    formData.append('file', selectedFile);

    const metadata = JSON.stringify({
      name: selectedFile.name,
      keyvalues: {
        post,
        prevHash: ipfsHash,
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${pinataJwtToken}`
        }
      });
      console.log(res.data.IpfsHash);

      if (res.data.IpfsHash) {
        await contract.methods.post(res.data.IpfsHash).send({ from: userAccount });
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="btns">
      <select onChange={accountCangeHandler}>
        <option>Select Option</option>
        {accounts.map((account) => (
          <option value={account}>{account}</option>
        ))}
      </select>
      {userAccount ? (
        <div className="input-btn">
          <input
            type="text"
            placeholder="Post"
            value={post}
            onChange={(e) => setPost(String(e.target.value))}
          />
          <input type="file"  onChange={fileChangeHandler}/>
          <button onClick={handleSubmission}>
            Submit
          </button>
        </div>
      ) : []}
      {Stack.peek(pinStack) ? (
        <div>
          <img alt={currentHash} src={`https://${myPinata}.mypinata.cloud/ipfs/${Stack.peek(pinStack).hash}`} />
          <p>{Stack.peek(pinStack).post}</p>
          {Stack.size(pinStack) > 1 ? (
            <button onClick={handlePreviousClick}>Previous</button>
          ) : []}
          {prevHash ? (
            <button onClick={(e) => setCurrentHash(prevHash)}>Next</button>
          ) : []}
        </div>
      ) : []}
      <br/><br/>
    </div>
  );
}

export default InstaForm;
