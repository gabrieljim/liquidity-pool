# Space Coin ICO

Second project for the optilistic bootcamp.

An ICO with a 2% tax on every token transfer. A frontend to interact with it.

The frontend was done with react, which was probably an overkill but I wanted to try a more real workflow to see how everything worked.

## Running it

You can start the frontend by running

```
npm install
cd frontend
npm install
cd ..
npm run frontend
```

By default the frontend is connected to the deployed version on Rinkeby: 0xfb5C614E957162dDa1cb218002896CCC6CBCa249

If you'd like to change that, you can do so at `frontend/src/utils/index.js`

#### Project extensions

- [x] In the frontend, show total contributed for each phase, total contributed overall, remaining available to contribute.
- [x] Extend the frontend to detect and show a different UI for the ICO contract owner so they can manage their contract
