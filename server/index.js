const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1")
const { toHex } = require("ethereum-cryptography/utils")
const { keccak256 } = require("ethereum-cryptography/keccak")
const { utf8ToBytes } = require("ethereum-cryptography/utils")

app.use(cors());
app.use(express.json());

const balances = {
  "04abffee3f2d333de95ac2d6fcfd6246f3e008f2e5c6d8344bf5d1233b8b6939b95c25454e8a8a1b17af6b4037454f66d1f740d54391930cccb6e9e5b11c4eec71": 100,
  "04601c435933c2a06a447d5d1cba4fbe87d4b8731828a78d4b0337ef7aa8fecc1556327902ade4c778f636da3e015e16c74c86407a864c8e0fb652080a30151778": 50,
  "040463fd474aba74ab530ba8f50ffb0b37b2b554ce18638faa8ee7b506feddfbc7d6b39b49cd46fcf3e4681eed81ac44a72acbfd5978dfb4ae53649e90f5b9f191": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { amount, recipient, singMessage } = req.body
  const sing = new Uint8Array(singMessage.sing);
  console.log(sing);
  const publicKey = toHex(secp.recoverPublicKey(toHex(keccak256(utf8ToBytes(recipient))), sing, singMessage.recovered))
  console.log(publicKey);
  // setInitialBalance(publicKey);
  setInitialBalance(recipient);

  if (balances[publicKey] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[publicKey] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[publicKey] }); 
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
