import SpaceCoin from "../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json";
import { ethers } from "ethers";

export const spaceCoinAdress = "0xF785177DFb4aB890582676d9a3Bcb34927D18819";

export const requestAccount = async () => {
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return account;
};

export const handleContractCallError = (error) => {
  console.log(error);
  let errorReason = error?.data?.message;

  return errorReason || "An error occured calling this method!";
};

export const callContractMethod = async (method) => {
  let error, result;
  try {
    result = await method();
  } catch (e) {
    error = handleContractCallError(e);
  }

  return {
    error,
    result,
  };
};

export const getContractInstance = async (withSigner = false) => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let contract, signer;

    if (withSigner) {
      await requestAccount();
      signer = getSigner(provider);
    }

    contract = new ethers.Contract(
      spaceCoinAdress,
      SpaceCoin.abi,
      signer ? signer : provider
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
