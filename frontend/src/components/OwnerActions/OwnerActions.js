import React from "react";
import { toast } from "react-toastify";
import {
  callContractMethod,
  handleContractInteractionResponse,
} from "../../utils";
import "./styles.css";

const OwnerActions = ({ contract }) => {
  const advancePhase = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.advancePhase()
    );

    handleContractInteractionResponse(result, error, toast);
  };

  const toggleTax = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.toggleTax()
    );

    handleContractInteractionResponse(result, error, toast);
  };

  const togglePause = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.togglePauseContract()
    );

    handleContractInteractionResponse(result, error, toast);
  };

  return (
    <div className="owner-container">
      <h1>Owner</h1>
      <button className="cool-button" onClick={advancePhase}>
        Advance phase
      </button>
      <button className="cool-button toggle-tax" onClick={toggleTax}>
        Toggle tax
      </button>
      <button className="cool-button toggle-tax" onClick={togglePause}>
        Toggle pause
      </button>
    </div>
  );
};

export default OwnerActions;
