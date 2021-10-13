import React from "react";
import { toast } from "react-toastify";
import {
  callContractMethod,
  handleContractInteractionResponse,
} from "../../../utils";
import "./styles.css";

const WithdrawLiquidity = ({ spaceRouter, lpBalance }) => {
  const withdrawLiquidity = async () => {
    const { result, error } = await callContractMethod(() =>
      spaceRouter.pullLiquidity()
    );

    handleContractInteractionResponse(result, error, toast);
  };

  return (
    <>
      <div className="ownings">
        <strong>You currently own:</strong> {lpBalance} LP Tokens
      </div>
      <button onClick={withdrawLiquidity} className="cool-button">
        Withdraw liquidity
      </button>
    </>
  );
};

export default WithdrawLiquidity;
