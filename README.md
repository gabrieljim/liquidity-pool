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

By default the frontend is connected to the deployed version on Rinkeby: `0xfb5C614E957162dDa1cb218002896CCC6CBCa249`

If you'd like to change that:

- In your env, set `TREASURY_WALLET` to the account that will receive the 2% tax
- Run `npx hardhat run scripts/deploy.js --network rinkeby`
- You'll get the new contract's address in your console, change it at `frontend/src/utils/index.js`
