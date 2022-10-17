/* eslint-disable func-names */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Caver = require('caver-js');
// eslint-disable-next-line import/no-unresolved
const contract = require('../../contracts/simpleOrder.json');

const getKlaytnRpcUrl = ({ network }) =>
  `https://public-node-api.klaytnapi.com/v1/${network}`;

async function execution() {
  try {
    const input = {
      network: process.argv[2], // baobab
      ca: process.argv[3],
      strOrderId: process.argv[4], // orderId
    };

    const chainName = input.network;
    const caver = new Caver(getKlaytnRpcUrl({ network: chainName }));

    const contractInst = await caver.contract.create(contract.abi, input.ca);
    const getOrderRouteCountFunc = await contractInst.methods
      .getOrderRouteCount(input.strOrderId)
      .call();
    const getOrderCodeFunc = await contractInst.methods
      .getOrderCode(input.strOrderId)
      .call();
    const getOrdersFunc = await contractInst.methods
      .getOrders(input.strOrderId)
      .call();
    console.log('getOrderRouteCountFunc result:', getOrderRouteCountFunc);
    console.log('getOrderCodeFunc result:', getOrderCodeFunc);
    console.log('getOrdersFunc result:', getOrdersFunc);
  } catch (err) {
    console.log(err);
  }
}

execution();
