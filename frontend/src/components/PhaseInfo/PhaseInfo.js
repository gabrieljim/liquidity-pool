import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { bigNumberToDecimal, callContractMethod } from "../../utils";
import "./styles.css";

const PHASE = {
  0: { name: "SEED", limit: 15000 },
  1: { name: "GENERAL", limit: 30000 },
  2: { name: "OPEN", limit: 30000 },
};

const PhaseInfo = ({ spaceCoin, account }) => {
  const [phase, setPhase] = useState();
  const [totalContributed, setTotalContributed] = useState();
  const [isTaxOn, setIsTaxOn] = useState();
  const [isPaused, setIsPaused] = useState();

  const getPhase = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.currentPhase()
    );

    if (error) {
      return toast.error(error);
    }

    setPhase(PHASE[result]);
  }, [spaceCoin]);

  const getTotalContributed = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.totalContributed()
    );

    if (error) {
      return toast.error(error);
    }

    const totalContributedDecimal = bigNumberToDecimal(result);
    setTotalContributed(totalContributedDecimal);
  }, [spaceCoin]);

  const getTaxOnOrOff = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.isTaxOn()
    );

    if (error) {
      return toast.error(error);
    }

    setIsTaxOn(result);
  }, [spaceCoin]);

  const getPausedOrNot = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.isContractPaused()
    );

    if (error) {
      return toast.error(error);
    }

    setIsPaused(result);
  }, [spaceCoin]);

  const getPhaseInfo = useCallback(() => {
    getPhase();
    getTotalContributed();
    getTaxOnOrOff();
    getPausedOrNot();
  }, [getPhase, getTotalContributed, getTaxOnOrOff, getPausedOrNot]);

  useEffect(() => {
    getPhaseInfo();
  }, [getPhaseInfo]);

  useEffect(() => {
    spaceCoin.on("TokensBought", getPhaseInfo);
    spaceCoin.on("OwnerAction", getPhaseInfo);
  }, [spaceCoin, getPhaseInfo]);

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
      <div className="info-row">
        <span className="key">Tax:</span>
        <span className="value">{isTaxOn ? "ON" : "OFF"}</span>
      </div>
      <div className="info-row">
        <span className="key">Paused:</span>
        <span className="value">{isPaused ? "YES" : "NO"}</span>
      </div>
    </div>
  ) : (
    "Getting extra info..."
  );
};

export default PhaseInfo;
