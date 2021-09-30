import { useEffect, useState } from "react";
import { requestAccount } from "..";

const useMetamaskAccount = () => {
  const [account, setAccount] = useState(undefined);

  useEffect(() => {
    (async () => {
      const metamaskAccount = await requestAccount();
      setAccount(metamaskAccount);
    })();
  }, []);

  return account;
};

export default useMetamaskAccount;
