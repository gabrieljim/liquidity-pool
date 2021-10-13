import React, { useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddLiquidity from "./AddLiquidity/AddLiquidity";
import { bigNumberToDecimal, callContractMethod } from "../../utils";
import {
  LIQUIDITY_POOL,
  LPT,
  SPACE_COIN,
  SPACE_ROUTER,
} from "../../utils/contractNamesConstants";
import useContract from "../../utils/hooks/useContract";
import useMetamaskAccount from "../../utils/hooks/useMetamaskAccount";
import WithdrawLiquidity from "./WithdrawLiquidity/WithdrawLiquidity";
import Loading from "../../components/Loading/Loading";

const ManageLiquidity = () => {
  const lp = useContract(LIQUIDITY_POOL, true);
  const lpToken = useContract(LPT, true);
  const spaceRouter = useContract(SPACE_ROUTER, true);
  const spaceCoin = useContract(SPACE_COIN, true);
  const account = useMetamaskAccount();

  const [lpBalance, setLPBalance] = useState(null);
  const [areFundsMoved, setAreFundsMoved] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const getFundsMovedOrNot = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      spaceCoin.fundsAlreadyMoved()
    );

    if (error) {
      return toast.error(error);
    }

    setAreFundsMoved(result);
  }, [spaceCoin]);

  const getBalance = useCallback(async () => {
    const { result, error } = await callContractMethod(() =>
      lpToken.balanceOf(account)
    );

    if (error) {
      return toast.error(error);
    }

    setLPBalance(bigNumberToDecimal(result));
  }, [account, lpToken]);

  const getInfo = useCallback(async () => {
    if (lp && lpToken && account && spaceCoin) {
      await getBalance();
      await getFundsMovedOrNot();
      setIsLoading(false);
    }
  }, [lp, lpToken, account, spaceCoin, getBalance, getFundsMovedOrNot]);

  useEffect(getInfo, [getInfo]);

  if (areFundsMoved === false) {
    return "Funds haven't been moved to LP yet!";
  }

  return (
    <Loading isLoading={isLoading && lpBalance === null}>
      <div className="liquidity-container">
        {lpBalance === 0 ? (
          <AddLiquidity lpBalance={lpBalance} spaceRouter={spaceRouter} />
        ) : (
          <WithdrawLiquidity lpBalance={lpBalance} spaceRouter={spaceRouter} />
        )}
      </div>
    </Loading>
  );
};

export default ManageLiquidity;
