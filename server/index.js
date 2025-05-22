const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1")
const { generateBalances } = require("./scripts/generate");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = generateBalances()

console.log({ balances })

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from the client-side application
  // Recover the public address from the signature 

  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  // Step 1: Recoveer public key from signature 
  const message = `${amount}${recipient}`;
  const messageHash = keccak256(utf8ToBytes(message))
  const publicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);

  // Step 2: Derive address from public key
  const recoveredAddress = "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));


  // Step 3: Verify sender matches recovered address
  if (recoveredAddress !== sender) {
    return res.status(401).send({ message: "Invalid signature!" })
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
