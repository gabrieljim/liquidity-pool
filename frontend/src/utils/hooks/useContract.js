import { useEffect, useState } from "react";
import { getContractInstance } from "..";

const useContract = (contractToGet, withSigner = false) => {
  const [contract, setContract] = useState(undefined);

  useEffect(() => {
    (async () => {
      const contractInstance = await getContractInstance(
        contractToGet,
        withSigner
      );
      setContract(contractInstance);
    })();
  }, [contractToGet, withSigner]);

  return contract;
};

export default useContract;
