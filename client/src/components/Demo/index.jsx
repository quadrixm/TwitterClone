import useEth from "../../contexts/EthContext/useEth";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";
import InstaForm from "./InstaForm";

function Demo() {
  const { state } = useEth();

  const demo =
    <>
      <div className="welcome">
        <h1>👋 Welcome to the Twitter Clone</h1>
        <p>
          This will let you to create an account and post new tweets or like or retweet a tweet.
        </p>
      </div>
      <div>
        <InstaForm />
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
