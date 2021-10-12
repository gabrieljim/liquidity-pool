import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { callContractMethod } from "../../utils";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import TokensPurchased from "../../components/TokensPurchased/TokensPurchased";
import DepositETH from "../../components/DepositETH/DepositETH";
import PhaseInfo from "../../components/PhaseInfo/PhaseInfo";
import OwnerActions from "../../components/OwnerActions/OwnerActions";
import { SPACE_COIN } from "../../utils/contractNamesConstants";

const SpaceCoinInfo = () => {
  const [owner, setOwner] = useState(null);
  const spaceCoin = useContract(SPACE_COIN, true);
  const account = useMetamaskAccount();

  const getOwner = useCallback(async () => {
    const { result, error } = await callContractMethod(spaceCoin.owner);

    if (error) {
      return toast.error(error);
    }

    setOwner(result.toLowerCase());
  }, [spaceCoin]);

  useEffect(() => {
    if (spaceCoin && account) {
      getOwner();
    }
  }, [spaceCoin, account, getOwner]);

  return (
    <div>
      {account && spaceCoin ? (
        <>
          <TokensPurchased spaceCoin={spaceCoin} account={account} />
          <PhaseInfo spaceCoin={spaceCoin} account={account} />
          {account === owner && <OwnerActions spaceCoin={spaceCoin} />}
          <DepositETH spaceCoin={spaceCoin} account={account} />
          <ToastContainer />
        </>
      ) : (
        "Updating... (you might need to refresh your browser)"
      )}
    </div>
  );
};

export default SpaceCoinInfo;
