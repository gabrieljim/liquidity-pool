import "./App.css";
import SpaceCoinInfo from "./components/SpaceCoinInfo/SpaceCoinInfo";
import "react-toastify/dist/ReactToastify.css";

import useContract from "./utils/hooks/useContract";

const App = () => {
  const contract = useContract();

  return (
    <div className="App">
      <h1>Space Coin</h1>
      {contract ? (
        <SpaceCoinInfo />
      ) : (
        "Please connect your wallet to use the dapp!"
      )}
    </div>
  );
};

export default App;
