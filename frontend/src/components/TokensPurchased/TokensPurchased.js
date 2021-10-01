import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "./styles.css";

import { bigNumberToDecimal, callContractMethod } from "../../utils";

const TokensPurchased = ({ contract, account }) => {
  const [tokens, setTokens] = useState(null);

  const getTokensAssigned = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      contract.balancesToClaim(account)
    );

    if (error) {
      return toast.error(error);
    }

    const tokens = bigNumberToDecimal(result);
    setTokens(tokens); //Divided by 100 so to move the comma two spaces left
  }, [account, contract]);

  useEffect(() => {
    getTokensAssigned();
  }, [contract, account, getTokensAssigned]);

  useEffect(() => {
    const filter = contract.filters.TokensBought(account);
    contract.on(filter, () => getTokensAssigned());
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
