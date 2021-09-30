import { useEffect, useState } from "react";
import { getContractInstance } from "..";

const useContract = (withSigner = false) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    (async () => {
      const contractInstance = await getContractInstance(withSigner);
      setContract(contractInstance);
    })();
  }, [withSigner]);

  return contract;
};

export default useContract;
