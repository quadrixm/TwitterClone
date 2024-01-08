import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import ContractBtns from "./ContractBtns";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function Demo() {
  const { state } = useEth();
  const [value, setValue] = useState("?");

  const demo =
    <>
      <div className="welcome">
        <h1>👋 Welcome to the Twitter Clone</h1>
        <p>
          This will let you to create an account and post new tweets or like or retweet a tweet.
        </p>
      </div>
      <div>
        <p>{value} </p>
        <ContractBtns setValue={setValue} />
      </div>
    </>

  return (
    <div className="demo">
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            demo
      }
    </div>
  );
}

export default Demo;
