import "./App.css";
import useContract from "./utils/hooks/useContract";

const App = () => {
  const contract = useContract();

  console.log(contract);
  return <div className="App">a</div>;
};

export default App;
