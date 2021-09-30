import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { bigNumberToDecimal, callContractMethod } from "../../utils";
import "./styles.css";

const PHASE = {
  0: { name: "SEED", limit: 15000 },
  1: { name: "GENERAL", limit: 30000 },
  2: { name: "", limit: 30000 },
};

const PhaseInfo = ({ contract, account }) => {
  const [phase, setPhase] = useState();
  const [totalContributed, setTotalContributed] = useState();

  const getPhase = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      contract.currentPhase()
    );

    if (error) {
      return toast.error(error);
    }

    setPhase(PHASE[result]);
  }, [contract]);

  const getTotalContributed = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      contract.totalContributed()
    );

    if (error) {
      return toast.error(error);
    }

    const totalContributedDecimal = bigNumberToDecimal(result);
    setTotalContributed(totalContributedDecimal);
  }, [contract]);

  const getPhaseInfo = useCallback(() => {
    getPhase();
    getTotalContributed();
  }, [getPhase, getTotalContributed]);

  useEffect(() => {
    getPhaseInfo();
  }, [getPhaseInfo]);

  useEffect(() => {
    const filter = contract.filters.TokensBought;
    contract.on(filter, getPhaseInfo);
  }, [contract, getPhaseInfo]);

  return phase && totalContributed >= 0 ? (
    <div className="phase-info-container">
      <div className="info-row">
        <span className="key">Current project phase:</span>
        <span className="value">{phase.name}</span>
      </div>
      <div className="info-row">
        <span className="key">Overall raised funds:</span>
        <span className="value">{totalContributed} ETH</span>
      </div>
      <div className="info-row">
        <span className="key">Remaining contributions before phase limit:</span>
        <span className="value">{phase.limit - totalContributed} ETH</span>
      </div>
    </div>
  ) : (
    "Getting extra info..."
  );
};

export default PhaseInfo;
