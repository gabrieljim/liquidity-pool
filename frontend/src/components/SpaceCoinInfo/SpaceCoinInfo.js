import React  from "react";
import { ToastContainer } from "react-toastify";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import TokensPurchased from "../TokensPurchased/TokensPurchased";
import DepositETH from "../DepositETH/DepositETH";

const SpaceCoinInfo = () => {
  const contract = useContract(true);
  const account = useMetamaskAccount();

  return (
    <div>
      <TokensPurchased contract={contract} account={account} />
      <DepositETH contract={contract} />
      <ToastContainer />
    </div>
  );
};

export default SpaceCoinInfo;
