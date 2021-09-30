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
    const { result, error } = await callContractMethod(() =>
      contract.contribute({ value: parseEther(amount) })
    );

    if (error) {
      return toast.error(error);
    }

    console.log(result);
  };

  return (
    <div>
      <h3>Buy SpaceCoin!</h3>
      <input type="text" value={amount} onChange={handleAmountChange} /> ETH
      {amount && (
        <>
          <div className="estimated-sc">
            Will get you: {amount * 5} <strong>SC</strong>
          </div>
          <button onClick={contribute}>Contribute</button>
        </>
      )}
    </div>
  );
};

export default DepositETH;
