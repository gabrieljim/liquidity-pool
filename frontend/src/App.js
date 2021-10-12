import "./App.css";
import SpaceCoinInfo from "./components/SpaceCoinInfo/SpaceCoinInfo";
import "react-toastify/dist/ReactToastify.css";
import "react-tabs/style/react-tabs.css";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import useContract from "./utils/hooks/useContract";

const App = () => {
  const contract = useContract();

  return (
    <div className="App">
      <h1>Space Coin</h1>
      {contract ? (
        <Tabs>
          <TabList>
            <Tab>Space Coin Info</Tab>
            <Tab>Manage Liquidity</Tab>
            <Tab>Trading</Tab>
          </TabList>

          <TabPanel>
            <SpaceCoinInfo />
          </TabPanel>
          <TabPanel>Tab 1</TabPanel>
          <TabPanel>Tab 2</TabPanel>
        </Tabs>
      ) : (
        "Please connect your wallet to use the dapp!"
      )}
    </div>
  );
};

export default App;
