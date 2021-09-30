import "./App.css";
import TokensPurchased from "./components/TokensPurchased/TokensPurchased";
import "react-toastify/dist/ReactToastify.css";

import useContract from "./utils/hooks/useContract";

const App = () => {
  const contract = useContract();

  return (
    <div className="App">
      <h1>Space Coin</h1>
      {contract ? (
        <>
          <TokensPurchased />
        </>
      ) : (
        "Please connect your wallet to use the dapp!"
      )}
    </div>
  );
};

export default App;
