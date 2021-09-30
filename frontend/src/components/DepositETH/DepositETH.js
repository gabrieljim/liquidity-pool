import { parseEther } from "ethers/lib/utils";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { callContractMethod } from "../../utils";
import "./styles.css";

const DepositETH = ({ contract }) => {
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e) => {
    const limit = e.target.value.includes(".") ? 6 : 5;
    if (e.target.value.length < limit) {
      setAmount(e.target.value.replace(/[^\d.]/g, ""));
    }
  };

  const contribute = async () => {
    if (amount <= 0) {
      return toast.error("You can't donate zero!");
    }

    const { result, error } = await callContractMethod(() =>
      contract.contribute({ value: parseEther(amount) })
    );

    if (error) {
      return toast.error(error);
    }

    setAmount("");
    toast.success(
      "Transaction sent! Waiting for confirmation from the network..."
    );
    await result.wait();
    toast.success("Transaction confirmed!");
  };

  return (
    <div className="deposit-eth-container">
      <h3>Buy SpaceCoin!</h3>
      <div className="contribute-container">
        <input
          className="contribute-amount"
          placeholder="Amount to contribute..."
          type="text"
          value={amount}
          onChange={handleAmountChange}
        />{" "}
        <span className="eth">ETH</span>
      </div>
      {amount && (
        <>
          <div className="estimated-sc">
            Will get you: {amount * 5} <strong>SC</strong>
          </div>
          <button className="contribute-button" onClick={contribute}>
            Contribute
          </button>
        </>
      )}
    </div>
  );
};

export default DepositETH;
