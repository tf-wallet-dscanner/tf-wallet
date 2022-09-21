/* eslint-disable func-names */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Web3 = require('web3');
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
const deployerPrivKey = process.env.DEPLOY_PRIKEY;

const getRpcUrl = ({ network }) =>
  `https://${network}.infura.io/v3/${infuraProjectId}`;
const getKlaytnRpcUrl = ({ network }) =>
  `https://public-node-api.klaytnapi.com/v1/${network}`;

async function deploy() {
  try {
    const chainName = 'ropsten';
    const chainId = NETWORK_CHAIN_ID[`${chainName}`];
    const web3 = new Web3(
      new Web3.providers.HttpProvider(getRpcUrl({ network: chainName })),
    );

    const name = 'DKA';
    const symbol = 'DKA';
    const supply = '10000000000000000000000'; // 10000 ETH

    const deployerAcc = web3.eth.accounts.privateKeyToAccount(deployerPrivKey);
    const deployerAddr = deployerAcc.address;

    const erc20Inst = new web3.eth.Contract(erc20.abi);
    const deployFunc = erc20Inst.deploy({
      data: erc20.bytecode,
      arguments: [name, symbol, supply],
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
