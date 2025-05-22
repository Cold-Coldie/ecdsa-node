const secp = require("ethereum-cryptography/secp256k1")
const { keccak256 } = require("ethereum-cryptography/keccak")
const { toHex } = require("ethereum-cryptography/utils")

const generateBalances = () => {
    const balances = {}

    for (let i = 0; i < 3; i++) {
        const privateKey = secp.utils.randomPrivateKey();
        const publicKey = secp.getPublicKey(privateKey);
        const address = "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));

        balances[address] = 100;
        console.log(`Account ${i + 1}:`, { privateKey: toHex(privateKey), address })
    }

    return balances
}

module.exports = { generateBalances }