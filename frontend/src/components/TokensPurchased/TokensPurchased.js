import React, { useEffect } from "react";
import useContract from "../../utils/hooks/useContract";
import { ToastContainer, toast } from "react-toastify";

import { callContractMethod } from "../../utils";

const TokensPurchased = () => {
  const contract = useContract(true);

  useEffect(() => {
    if (contract) {
      getTokensAssigned();
    }
  }, [contract]);

  const getTokensAssigned = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.balancesToClaim()
    );
    if (error) {
      return toast.error(error);
    }
  };

  return (
    <>
      <div>Tokens</div>
      <ToastContainer />
    </>
  );
};

export default TokensPurchased;
