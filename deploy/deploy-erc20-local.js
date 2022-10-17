/* eslint-disable func-names */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Web3 = require('web3');
// eslint-disable-next-line import/no-unresolved
const Tx = require('ethereumjs-tx').Transaction;
const Common = require('@ethereumjs/common').default;
const erc20 = require('../contracts/ERC20.json');

const NETWORK_CHAIN_ID = {
  mainnet: 0x1,
  goerli: 0x5,
  localhost: 0x9b,
  cypress: 0x2019,
  baobab: 0x3e9,
};
const deployerPrivKey = process.env.DEPLOY_PRIVKEY;

const localhostRpcUrl = 'http://localhost:8545';

async function deploy() {
  try {
    const input = {
      network: process.argv[2], // ropsten
      name: process.argv[3], // DKA
      symbol: process.argv[4], // DKA
      supply: process.argv[5], // ETH 단위
    };
    const supply = `${input.supply}000000000000000000`; // wei

    const chainName = input.network;
    const chainId = NETWORK_CHAIN_ID[`${chainName}`];
    const web3 = new Web3(localhostRpcUrl);

    const deployerAcc = web3.eth.accounts.privateKeyToAccount(deployerPrivKey);
    const deployerAddr = deployerAcc.address;

    const erc20Inst = new web3.eth.Contract(erc20.abi);
    const deployFunc = erc20Inst.deploy({
      data: erc20.bytecode,
      arguments: [input.name, input.symbol, supply],
    });
    const deployData = deployFunc.encodeABI();

    const txCurCnt = await web3.eth.getTransactionCount(deployerAddr);

    const rawTx = {
      from: deployerAddr,
      nonce: txCurCnt,
      data: deployData,
      gas: 4500000,
      gasPrice: 20000000000, // 20 gwei
      chainId,
    };

    const cbHash = async function (txHash) {
      console.log(`Deploy TX:['${txHash}'] Created!`);
    };
    const cbReceipt = async function (receipt) {
      console.log(`Deploy TX:['${receipt.transactionHash}'] Done!`);
      console.log(`- BlockNumber:[${parseInt(receipt.blockNumber, 10)}]`);
      console.log(`- contractAddress:[${receipt.contractAddress}]`);
      console.log(`- receipt:[${JSON.stringify(receipt)}]`);
    };
    const cbError = async function (error) {
      console.log(`Error:['${error}']`);
    };

    const customCommon = Common.custom({ chainId: 0x9b });

    const tx = new Tx(rawTx, { common: customCommon });
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
