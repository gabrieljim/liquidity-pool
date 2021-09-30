import React, { useState, useEffect, useCallback } from "react";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import { ToastContainer, toast } from "react-toastify";

import { callContractMethod } from "../../utils";

const TokensPurchased = () => {
  const [tokens, setTokens] = useState();
  const contract = useContract(true);
  const account = useMetamaskAccount();

  const getTokensAssigned = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      contract.balancesToClaim(account)
    );

    if (error) {
      return toast.error(error);
    }

    setTokens(result.toString());
  }, [account, contract]);

  useEffect(() => {
    if (contract && account) {
      getTokensAssigned();
    }
  }, [contract, account, getTokensAssigned]);

  return tokens ? (
    <>
      <div>{tokens}</div>
      <ToastContainer />
    </>
  ) : (
    "Loading"
  );
};

export default TokensPurchased;
