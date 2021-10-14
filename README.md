# Liquidity pool

Third project for the optilistic bootcamp.

- Accepts depositing/withdrawing liquidity.
- Mints LP tokens on deposit and burning them on withdrawal.
- Allows swapping ETH/SPC.
- 1% tax for every trade

## Running it

You can start the frontend by:

- Add a .env file on the root of the project, and add the field `PRIVATE_KEY`
- Set `PRIVATE_KEY` to your account's private key (so hardhat.config.js knows from which account to deploy)

Then running:

```
npm install
npx hardhat compile (generates the artifacts the frontend will use)
cd frontend
npm install
npm start
```

## Re-deploying

By default the frontend is connected to the deployed version of all the contracts on Rinkeby:

```
export const contracts = {
  SPACE_COIN: {
    abi: SpaceCoin.abi,
    address: "0x0D369cF7A39857a6CAe2aE35f28Dc2A0A588789b",
  },
  LIQUIDITY_POOL: {
    abi: LiquidityPool.abi,
    address: "0xBD7A42cD59B86A4fE3ed895F3A57C903E072521e",
  },
  LPT: {
    abi: LPT.abi,
    address: "0xCC65b735696aA150639DBd691b6E87E7CFA05785",
  },
  SPACE_ROUTER: {
    abi: SpaceRouter.abi,
    address: "0xa730A14fEA7eC97bC59e61aeeC20695f7c72B5D6",
  },
};
```

If you'd like to change that:

- In your env, set `TREASURY_WALLET` to the account that will receive the 2% tax
- Run `npx hardhat run scripts/deploy.js --network rinkeby`
- You'll get the new addresses in your console, change them at `frontend/src/utils/index.js`
