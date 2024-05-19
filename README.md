In the development of the application, two main actors were identified: a state-certified laboratory and end users, which may include consumers, the state and traders who buy olive oil. The latter acquire olive oil from the producers with a view to securing an agreement that is fully transparent and ensures fair pricing for each party. Eleven quality parameters have been defined as part of the quality assurance of olive oil. 
1) Acidity
2) Κ268
3) Κ232
4) Median of defects
5) Polyphenol content
6) alpha-tocopherols (vitamin E)
7) Pesticide residues
8) Insecticide residues
9) Plasticizers
10) Dehydrated sterols (adulteration index)
11) Celsius temperature at the time of oil extraction
Copy the Project to Remix Ethereum

Copy the URL https://remix.ethereum.org/ and open it in your browser.

Create a New Contract File

In the Remix File Explorer, navigate to the contracts folder and create a new file named OliveOilQualityChecker.sol. Paste the smart contract code from the project folder into this new file.

Compile the Contract

Go to the third icon from the top in the sidebar, which is the Compiler.
Select the compiler version 0.8.0.
In the Advanced Configurations section below, enable optimization and set it to 200.
Click the blue button to compile OliveOilQualityChecker.sol.
Deploy the Contract

After compiling, go to the Deploy & Run Transactions tab (the icon just below the Compiler).
In the Environment dropdown, select "Injected Provider - MetaMask" and connect your MetaMask wallet, ensuring it is set to the Sepolia Testnet network.
Click the Deploy button.
Configure Environment Variables

In the .env file, each user needs to add their own details (MNEMONIC/PROJECT ID).

Update Contract Address in Server.js

Replace the contract address in the server.js file with the new address from the deployment.

Update Contract ABI

Replace the ABI in the Contract ABI JS file with the ABI of the newly deployed contract (even if it is the same as the existing one to avoid potential bugs).

Start the Server

Open the Command Prompt (CMD) in the root folder of the project and run the node server.js command
