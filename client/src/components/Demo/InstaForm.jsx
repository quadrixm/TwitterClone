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

  const accountChangeHandler = async (e) => {
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <select onChange={accountChangeHandler} className="p-2 border border-gray-300 rounded">
          <option>Select Option</option>
          {accounts.map((account) => (
            <option value={account}>{account}</option>
          ))}
        </select>

        {userAccount && (
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Post"
              value={post}
              onChange={(e) => setPost(String(e.target.value))}
              className="flex-grow p-2 border border-gray-300 rounded"
            />
            <input type="file" onChange={fileChangeHandler} className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <button onClick={handleSubmission} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Submit
            </button>
          </div>
        )}

        {Stack.peek(pinStack) && (
          <div className="flex flex-col items-center gap-4">
            <img alt={currentHash} src={`https://${myPinata}.mypinata.cloud/ipfs/${Stack.peek(pinStack).hash}`} className="max-w-xs rounded-lg shadow-md"/>
            <p>{Stack.peek(pinStack).post}</p>
            <div className="flex gap-2">
              {Stack.size(pinStack) > 1 && (
                <button onClick={handlePreviousClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                  Previous
                </button>
              )}
              {prevHash && (
                <button onClick={(e) => setCurrentHash(prevHash)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstaForm;
