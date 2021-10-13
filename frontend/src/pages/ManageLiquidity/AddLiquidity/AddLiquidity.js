import { parseEther } from "ethers/lib/utils";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  callContractMethod,
  handleContractInteractionResponse,
} from "../../../utils";
import "./styles.css";

const AddLiquidity = ({ spaceRouter }) => {
  const [allowCustomAmounts, setAllowCustomAmounts] = useState(true);
  const [ethAmount, setEthAmount] = useState("");
  const [spcAmount, setSpcAmount] = useState("");

  const handleInputChange = (token, eventValue) => {
    const value = eventValue
      .replace(/[^.\d]/g, "")
      .replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2");

    if (token === "eth") {
      setEthAmount(value);
      if (allowCustomAmounts) setSpcAmount(value * 5);
    } else if (token === "spc") {
      setSpcAmount(value);
      if (allowCustomAmounts) setEthAmount(value / 5);
    }
  };

  const depositLiquidity = async () => {
    const { result, error } = await callContractMethod(() =>
      spaceRouter.addLiquidity(parseEther(spcAmount.toString()), {
        value: parseEther(ethAmount.toString()),
      })
    );

    handleContractInteractionResponse(result, error, toast);
  };

  const handleCheckboxClick = () => {
    setAllowCustomAmounts((prevState) => !prevState);
    if (!allowCustomAmounts) setSpcAmount(ethAmount * 5);
  };

  return (
    <div>
      <div className="input-amounts">
        <div className="input-container">
          <input
            type="text"
            value={ethAmount}
            onChange={(e) => handleInputChange("eth", e.target.value)}
            placeholder="ETH amount..."
            className="lp-input"
          />
          ETH
        </div>
        <div className="input-container">
          <input
            type="text"
            value={spcAmount}
            placeholder="SPC amount..."
            onChange={(e) => handleInputChange("spc", e.target.value)}
            className="lp-input"
          />
          SPC
        </div>
        <div className="assist-container">
          <label>
            <input
              type="checkbox"
              name="assist-on"
              value={allowCustomAmounts}
              onChange={handleCheckboxClick}
            />{" "}
            Allow custom amounts
          </label>
        </div>
      </div>
      {ethAmount && spcAmount ? (
        <button onClick={depositLiquidity} className="cool-button">
          Add liquidity
        </button>
      ) : null}
    </div>
  );
};

export default AddLiquidity;
