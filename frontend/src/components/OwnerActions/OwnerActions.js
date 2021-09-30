import React from "react";
import { toast } from "react-toastify";
import { callContractMethod } from "../../utils";
import "./styles.css";

const OwnerActions = ({ contract }) => {
  const advancePhase = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.advancePhase()
    );

    if (error) {
      return toast.error(error);
    }

    toast.success(
      "Transaction sent! Waiting for confirmation from the network..."
    );
    await result.wait();
    toast.success("Transaction confirmed!");
  };

  const toggleTax = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.toggleTax()
    );

    if (error) {
      return toast.error(error);
    }

    toast.success(
      "Transaction sent! Waiting for confirmation from the network..."
    );
    await result.wait();
    toast.success("Transaction confirmed!");
  };

  const togglePause = async () => {
    const { result, error } = await callContractMethod(() =>
      contract.togglePauseContract()
    );

    if (error) {
      return toast.error(error);
    }

    toast.success(
      "Transaction sent! Waiting for confirmation from the network..."
    );
    await result.wait();
    toast.success("Transaction confirmed!");
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
