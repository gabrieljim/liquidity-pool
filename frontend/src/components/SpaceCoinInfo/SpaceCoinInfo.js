import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { callContractMethod } from "../../utils";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import TokensPurchased from "../TokensPurchased/TokensPurchased";
import DepositETH from "../DepositETH/DepositETH";
import PhaseInfo from "../PhaseInfo/PhaseInfo";
import OwnerActions from "../OwnerActions/OwnerActions";

const SpaceCoinInfo = () => {
  const [owner, setOwner] = useState(null);
  const contract = useContract(true);
  const account = useMetamaskAccount();

  const getOwner = useCallback(async () => {
    const { result, error } = await callContractMethod(contract.owner);

    if (error) {
      return toast.error(error);
    }

    setOwner(result.toLowerCase());
  }, [contract]);

  useEffect(() => {
    if (contract && account) {
      getOwner();
    }
  }, [contract, account, getOwner]);

  return (
    <div>
      {account && contract ? (
        <>
          <TokensPurchased contract={contract} account={account} />
          <PhaseInfo contract={contract} account={account} />
          {account === owner && <OwnerActions contract={contract} />}
          <DepositETH contract={contract} account={account} />
          <ToastContainer />
        </>
      ) : (
        "Updating... (you might need to refresh your browser)"
      )}
    </div>
  );
};

export default SpaceCoinInfo;
