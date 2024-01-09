import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
// const pinataSDK = require('@pinata/sdk');
// const pinata = new pinataSDK('a03c672af5ea0a119f02', '2deae47984cdb680ba2a9bc3e4d65691382ce9f51c7f875fb0354880686eed52');
const axios = require('axios');

const jwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYzIwYzdmNi1kY2NjLTQwNzYtOGI3Yi1jM2IwYTAzMDAzY2UiLCJlbWFpbCI6InF1YWRyaXhtQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyODZlMDM2MjRjYzdmMzg5MjEwNCIsInNjb3BlZEtleVNlY3JldCI6IjhjY2VlYzExYWQwNTMxZTc3ZDczNTI5YjYxMDhlMDYxYmI0NTE0YTNkZWExYmZlZjdlOTQzNDI3NzU4ODIyNjAiLCJpYXQiOjE3MDQ3Nzk4OTN9.znQ71IA49zwdqYZk8JY89tbpkd-hpv1WGARZ92v3PUs`;

function InstaForm({ setValue }) {
  const { state: { contract, accounts } } = useEth();
  const [post, setPost] = useState("");
  const [userAccount, setUserAccount] = useState("");

  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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

    const prevHash = await contract.methods.get().call({ from: userAccount }) ?? '';

    console.log(prevHash);

    const formData = new FormData();
    
    formData.append('file', selectedFile)

    const metadata = JSON.stringify({
      name: selectedFile.name,
      keyvalues: {
        post,
        prevHash,
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
          Authorization: `Bearer ${jwtToken}`
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
      <select onChange={(e) => setUserAccount(String(e.target.value))}>
        <option>Select Option</option>
        {accounts.map((account) => (
          <option value={account}>{account}</option>
        ))}
      </select>
      <div className="input-btn">
        <input
          type="text"
          placeholder="Post"
          value={post}
          onChange={(e) => setPost(String(e.target.value))}
        />
        <input type="file"  onChange={changeHandler}/>
        <button onClick={handleSubmission}>
          Submit
        </button>
      </div>
      <br/><br/>
    </div>
  );
}

export default InstaForm;
