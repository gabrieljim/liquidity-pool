import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import TokensPurchased from "../TokensPurchased/TokensPurchased";
import DepositETH from "../DepositETH/DepositETH";
import PhaseInfo from "../PhaseInfo/PhaseInfo";

const SpaceCoinInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const contract = useContract(true);
  const account = useMetamaskAccount();

  return (
    <div>
      {account && contract && !isLoading ? (
        <>
          <TokensPurchased
            contract={contract}
            account={account}
            setIsLoading={setIsLoading}
          />
          <PhaseInfo contract={contract} account={account} />
          <DepositETH contract={contract} account={account} />
          <ToastContainer />
        </>
      ) : (
        "Updating..."
      )}
    </div>
  );
};

export default SpaceCoinInfo;
