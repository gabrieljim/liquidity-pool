import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "./styles.css";

import { callContractMethod } from "../../utils";
import { BigNumber } from "ethers";

const TokensPurchased = ({ contract, account, setIsLoading }) => {
  const [tokens, setTokens] = useState(null);

  const getTokensAssigned = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      contract.balancesToClaim(account)
    );

    if (error) {
      setIsLoading(false);
      return toast.error(error);
    }

    const decimals = BigNumber.from("10000000000000000"); //16 zeroes, the contract has 18 decimals so this would show 2
    const tokens = result.div(decimals).toString();
    setTokens(tokens / 100); //Divided by 100 so to move the comma two spaces left
  }, [account, contract, setIsLoading]);

  useEffect(() => {
    if (contract && account) {
      getTokensAssigned();
    }
  }, [contract, account, getTokensAssigned]);

  useEffect(() => {
    if (contract && account) {
      const filter = contract.filters.TokensBought(account);
      contract.on(filter, () => getTokensAssigned());
    }
  }, [contract, account, getTokensAssigned]);

  return tokens >= 0 ? (
    <div className="wallet-info">
      <div>
        <strong>Your wallet:</strong> {account}
      </div>
      <div>
        When the token gets to its final phase, you'll get: {tokens}{" "}
        <strong>SC</strong>
      </div>
    </div>
  ) : (
    "Loading... (Make sure you are on the correct network!)"
  );
};

export default TokensPurchased;
