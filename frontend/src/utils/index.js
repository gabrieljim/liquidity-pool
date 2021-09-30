import SpaceCoin from "../artifacts/contracts/SpaceCoin.sol/SpaceCoin.json";
import { ethers } from "ethers";

const spaceCoinAdress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const requestAccount = async () => {
  await window.ethereum.request({ method: "eth_requestAccounts" });
};

export const getContractInstance = async (withSigner = false) => {
  if (typeof window.ethereum !== undefined) {
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
  if (typeof window.ethereun !== undefined) {
    const signer = provider.getSigner();

    return signer;
  }
};
