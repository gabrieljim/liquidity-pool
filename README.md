# Space Coin ICO

Second project for the optilistic bootcamp.

An ICO with a 2% tax on every token transfer. A frontend to interact with it.

The frontend was done with react, which was probably an overkill but I wanted to try a more "real" workflow to see how everything worked.

Implemented some custom hooks too, `useContract` and `useMetamaskAccount`

#### Project extensions

- [x] In the frontend, show total contributed for each phase, total contributed overall, remaining available to contribute.
- [x] Extend the frontend to detect and show a different UI for the ICO contract owner so they can manage their contract

## Running it

You can start the frontend by:

- Setting `PRIVATE_KEY` to your account's private key (so hardhat.config.js knows from which account to deploy)

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

- Add a .env file on the root of the project, and add the fields `PRIVATE_KEY` and `TREASURY_WALLET`
- Set `PRIVATE_KEY` to your account's private key (so hardhat.config.js knows from which account to deploy)
- Set `TREASURY_WALLET` to the account that will receive the 2% tax
- Run `npx hardhat run scripts/deploy.js --network rinkeby`
- You'll get the new contract's address in your console, change it at `frontend/src/utils/index.js`
