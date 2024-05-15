require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require('path');
const app = express();
const port = 3000;

// Setup Web3 provider
const provider = new HDWalletProvider(process.env.MNEMONIC, `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const web3 = new Web3(provider);

// Smart Contract details
const contractABI = require('./OliveOilContractABI.json');
const contractAddress = '0x865dd686CB31482366A24Fb12fe19D8527032036';
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Serve static files
app.use(express.static(__dirname));


// Serve the index.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global object to store processed data
let processedData = {};

// Function to read and process CSV data
async function processCSV(filePath) {
  const results = await readCSV(filePath);
  const accounts = await web3.eth.getAccounts();

  for (const data of results) {
    const Number = parseInt(data.Number);
    const acidity = parseFloat(data.Acidity);
    const k268 = parseFloat(data.K268);
    const k232 = parseFloat(data.K232);
    const dissadvantagemd = parseInt(data.Dissadvantagemd);
    const polyphenols = parseFloat(data.Polyphenols);
    const vitaminE = parseFloat(data.VitaminE);
    const pesticides = parseInt(data.Pesticides);
    const fertilizers = parseInt(data.Fertilizers);
    const dehydratedSterols = parseInt(data.DehydratedSterols);
    const temperature = parseInt(data.Temperature);
    const plasticizers = parseFloat(data.Plasticizers);

    // Check for invalid data before proceeding
    if (isNaN(acidity) || isNaN(k268) || isNaN(k232) || isNaN(polyphenols) || isNaN(vitaminE) || isNaN(plasticizers)) {
        console.error(`Error in data conversion for Number ${Number}: Check data formatting.`);
        continue; // Skip this entry if data is invalid
    }

    // If data is valid, store it in the processedData object
    processedData[Number] = {
        Acidity: acidity,
        K268: k268,
        K232: k232,
        Dissadvantagemd: dissadvantagemd,
        Polyphenols: polyphenols,
        VitaminE: vitaminE,
        Pesticides: pesticides,
        Fertilizers: fertilizers,
        DehydratedSterols: dehydratedSterols,
        Temperature: temperature,
        Plasticizers: plasticizers
    };

      // Scale the data for blockchain compatibility
      try {
          const transaction = await contract.methods.addNumber(
              Number,
              Math.round(acidity * 100), Math.round(k268 * 100), Math.round(k232 * 100),
              dissadvantagemd,
              Math.round(polyphenols * 100), Math.round(vitaminE * 100),
              pesticides, fertilizers, dehydratedSterols,
              temperature,
              Math.round(plasticizers * 100)
          ).send({ from: accounts[0] });
          console.log(`Data for ${Number} added successfully. Transaction Hash: ${transaction.transactionHash}`);
      } catch (error) {
          console.error(`Error adding data for ${Number}:`, error);
      }
  }
  console.log('All data processed successfully.');
}

// Function to check olive oil quality
function checkOilQuality(data) {
    const failurePoints = [];
    if (parseFloat(data.Acidity) > 0.8) failurePoints.push('acidity');
    if (parseFloat(data.K268) > 0.22) failurePoints.push('K268');
    if (parseFloat(data.K232) > 2.5) failurePoints.push('K232');
    if (parseInt(data.Dissadvantagemd) !== 0) failurePoints.push('dissadvantagemd');
    if (parseFloat(data.Polyphenols) < 5) failurePoints.push('polyphenols');
    if (parseFloat(data.VitaminE) < 20) failurePoints.push('vitaminE');
    if (parseInt(data.Pesticides) !== 0) failurePoints.push('pesticides');
    if (parseInt(data.Fertilizers) !== 0) failurePoints.push('fertilizers');
    if (parseInt(data.DehydratedSterols) !== 0) failurePoints.push('dehydrated sterols');
    if (parseInt(data.Temperature) >= 27) failurePoints.push('temperature');
    if (parseFloat(data.Plasticizers) > 0) failurePoints.push('plasticizers');

    return failurePoints.length === 0 ? { passed: true } : { passed: false, failureReason: failurePoints.join(', ') };
}

// Utility function to read CSV data
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                reject(err);
            });
    });
}

// Start the server and process CSV on startup
processCSV("C:\\Users\\vvita\\OneDrive\\Desktop\\olive\\oliveoil_data.csv").then(() => {
    console.log('CSV data processed and uploaded to smart contract.');
}).catch(error => {
    console.error('Failed to process CSV:', error);
});

// Endpoint to get data for a specific number from the smart contract
app.get('/getData/:number', async (req, res) => {
  const number = parseInt(req.params.number);  // Convert the parameter to integer
  if (isNaN(number)) {
      return res.status(400).send('Invalid number provided.');
  }

  try {
      const raw = await contract.methods.getNumberData(number).call();
      if (!raw) {
          return res.status(404).send('No data found for the provided number.');
      }
     
      // Format the data to be more readable if necessary
      const data = {
          Number: number,
          Acidity: raw.acidity / 100,  // Assuming data was scaled by 100
          K268: raw.k268 / 100,
          K232: raw.k232 / 100,
          Dissadvantagemd: raw.dissadvantagemd,
          Polyphenols: raw.polyphenols / 100,
          VitaminE: raw.vitaminE / 100,
          Pesticides: raw.pesticides,
          Fertilizers: raw.fertilizers,
          DehydratedSterols: raw.dehydratedSterols,
          Temperature: raw.temperature,
          Plasticizers: raw.plasticizers / 100,
         
      };

      // Process the data with the checkOilQuality function POSSIBLE BUG INSTANCE
      const qualityResult = checkOilQuality(data);

       // Combine both results to send to the client
       const responseData = {
        ...data,
        QualityCheck: qualityResult
    };

      res.json(responseData);

  } catch (error) {
      console.error('Failed to retrieve data:', error);
      res.status(500).send('Error retrieving data from the blockchain.');
  }
});

// New endpoint to check the quality of olive oil based on number
app.get('/checkQuality/:number', async (req, res) => {
    const number = parseInt(req.params.number);
    if (!processedData[number]) {
        return res.status(404).send('No data found for the provided number.');
    }

    const data = processedData[number];
    const qualityResult = checkOilQuality(data);
    res.json(qualityResult);  // Send the result of the quality check directly
});


app.listen(port, () => {
    console.log(`Server running at ${port}`);
});
