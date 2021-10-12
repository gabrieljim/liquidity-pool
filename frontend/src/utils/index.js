import SpaceCoin from "../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json";
import LPT from "../artifacts/contracts/LPT.sol/LPT.json";
import SpaceRouter from "../artifacts/contracts/SpaceRouter.sol/SpaceRouter.json";
import LiquidityPool from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import { BigNumber } from "ethers";
import { ethers } from "ethers";

const contracts = {
  SPACE_COIN: {
    abi: SpaceCoin.abi,
    address: "0x326f6C56468B02367900eE8eEF183d16b102538E",
  },
  LIQUIDITY_POOL: {
    abi: LiquidityPool.abi,
    address: "0x343B0341458f709f5eC4777A945e0CdC58D73aCb",
  },
  LPT: {
    abi: LPT.abi,
    address: "0x510ACD46d7b903aA5845A63e51e9f5b022aC5C9c",
  },
  SPACE_ROUTER: {
    abi: SpaceRouter.abi,
    address: "0x60C70Aa7996aC0282Eccdd6cB105FAc931819fDE",
  },
};

export const requestAccount = async () => {
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return account;
};

const mapErrorToFriendlyMessage = (error) => {
  switch (error) {
    case "OWNER_ONLY":
      return "This is meant for the owner! What are you doing here?";
    case "FUNDS_MOVED_TO_LP":
      return "Funds have been already moved to the liquidity pool!";
    case "CONTRACT_PAUSED":
      return "Contract is paused!";
    case "NOT_ALLOWED":
      return "You don't have permission to contribute!";
    case "User denied transaction":
      return "Transaction denied by user!";
    case "errorSignature=null":
      return "Error getting contract! Are you on the rinkeby network?";
    case "insufficient funds":
      return "Insufficient funds!";
    default:
      return "An error occured calling this method!";
  }
};

const getErrorFromReversion = (revertReason) => {
  console.log(revertReason);
  const revertErrors = [
    "NOT_ALLOWED",
    "OWNER_ONLY",
    "FUNDS_MOVED_TO_LP",
    "CONTRACT_PAUSED",
    "User denied transaction",
    "errorSignature=null",
    "insufficient funds",
  ];

  const error = revertErrors.find((errorConstant) =>
    revertReason.includes(errorConstant)
  );

  return mapErrorToFriendlyMessage(error);
};

export const handleContractCallError = (error) => {
  let errorReason = getErrorFromReversion(error?.message);

  return errorReason;
};

export const handleContractInteractionResponse = async (
  result,
  error,
  toast
) => {
  if (error) {
    return toast.error(error);
  }

  toast.success(
    "Transaction sent! Waiting for confirmation from the network..."
  );
  await result.wait();
  toast.success("Transaction confirmed!");
};

export const bigNumberToDecimal = (number) => {
  const decimals = BigNumber.from("10000000000000000"); //16 zeroes, the contract has 18 decimals so this would show 2
  const tokens = number.div(decimals).toString();
  return tokens / 100;
};

export const callContractMethod = async (method) => {
  let error, result;
  try {
    result = await method();
  } catch (e) {
    error = handleContractCallError(e.error || e);
  }

  return {
    error,
    result,
  };
};

export const getContractInstance = async (
  contractToGet,
  withSigner = false
) => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let contract, signer;

    if (withSigner) {
      await requestAccount();
      signer = getSigner(provider);
    }

    contract = new ethers.Contract(
      contracts[contractToGet].address,
      contracts[contractToGet].abi,
      signer || provider
    );

    return contract;
  }
};

export const getSigner = (provider) => {
  if (window.ethereum) {
    const signer = provider.getSigner();

    return signer;
  }
};
