/* eslint-disable func-names */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Web3 = require('web3');
// eslint-disable-next-line import/no-unresolved
const Tx = require('ethereumjs-tx').Transaction;
const erc20 = require('../contracts/ERC20.json');

const NETWORK_CHAIN_ID = {
  mainnet: 0x1,
  ropsten: 0x3,
  rinkeby: 0x4,
  goerli: 0x5,
  cypress: 0x2019,
  baobab: 0x3e9,
};
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const deployerPrivKey = process.env.DEPLOY_PRIVKEY;

const getRpcUrl = ({ network }) =>
  `https://${network}.infura.io/v3/${infuraProjectId}`;
const getKlaytnRpcUrl = ({ network }) =>
  `https://public-node-api.klaytnapi.com/v1/${network}`;

async function deploy() {
  try {
    const input = {
      network: process.argv[2], // ropsten
      ca: process.argv[3], // ca address
      to: process.argv[4], // to address
      amount: process.argv[5], // amount, ETH 단위
    };
    const amount = `${input.amount}000000000000000000`; // wei

    const chainName = input.network;
    const chainId = NETWORK_CHAIN_ID[`${chainName}`];
    const web3 = new Web3(
      new Web3.providers.HttpProvider(getRpcUrl({ network: chainName })),
    );

    const deployerAcc = web3.eth.accounts.privateKeyToAccount(deployerPrivKey);
    const deployerAddr = deployerAcc.address;

    const erc20Inst = new web3.eth.Contract(erc20.abi, input.ca);
    const transferFunc = erc20Inst.methods.transfer(input.to, amount);
    const transferData = transferFunc.encodeABI();

    const txCurCnt = await web3.eth.getTransactionCount(deployerAddr);

    const rawTx = {
      from: deployerAddr,
      to: input.ca,
      nonce: txCurCnt,
      data: transferData,
      gas: 500000,
      gasPrice: 20000000000, // 20 gwei
      chainId,
    };

    const cbHash = async function (txHash) {
      console.log(`Transfer TX:['${txHash}'] Created!`);
    };
    const cbReceipt = async function (receipt) {
      console.log(`Transfer TX:['${receipt.transactionHash}'] Done!`);
      console.log(`- BlockNumber:[${parseInt(receipt.blockNumber, 10)}]`);
      console.log(`- receipt:[${JSON.stringify(receipt)}]`);
    };
    const cbError = async function (error) {
      console.log(`Error:['${error}']`);
    };

    const tx = new Tx(rawTx, { chain: chainName });
    const signKey = Buffer.from(deployerPrivKey, 'hex');
    tx.sign(signKey);
    const serialized = tx.serialize();
    const rawData = `0x${serialized.toString('hex')}`;

    await web3.eth
      .sendSignedTransaction(rawData)
      .on('transactionHash', async function (txHash) {
        await cbHash(txHash);
      })
      .on('receipt', async function (receipt) {
        await cbReceipt(receipt);
      })
      .on('error', async function (error) {
        await cbError(error);
      });
  } catch (err) {
    console.log(err);
  }
}

deploy();
