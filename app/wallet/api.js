import axios from 'axios';
import { getAccountsFromWIFKey, transferTransaction, signatureData, addContract } from './index.js';

const apiEndpoint = "http://testnet.antchain.xyz";
const rpcEndpoint = "http://api.otcgo.cn:20332"; // testnet = 20332

const ANS = '\u5c0f\u8681\u80a1';
const ANC = '\u5c0f\u8681\u5e01';

// hard-code asset ids for ANS and ANC
const ansId = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
const ancId = "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";

// hard-code asset names for ANS and ANC
const ansName = "小蚁股";
const ancName = "小蚁币";

const getAns = balance => balance.filter((val) => { return val.unit === ANS })[0];
const getAnc = balance => balance.filter((val) => { return val.unit === ANC })[0];

export const getBalance = (address) => {
    return axios.get(apiEndpoint + '/api/v1/address/info/' + address)
      .then((res) => {
        if (res.data.result !== 'No Address!') {
          // get ANS
          const ans = getAns(res.data.balance);
          const anc = getAnc(res.data.balance);
          return {ANS: ans, ANC: anc};
        }
      })
};

export const getTransactions = (address, assetId) => {
  return axios.get(apiEndpoint + '/api/v1/address/utxo/' + address).then((response) => {
    return response.data.utxo[assetId];
  });
};

export const sendAssetTransaction = (toAddress, fromWif, assetType, amount) => {
  let assetId, assetName, assetSymbol;
  if (assetType === "AntShares"){
    assetId = ansId;
    assetName = ansName;
    assetSymbol = 'ANS';
  } else if (assetType === "AntCoins") {
    assetId = ancId;
    assetName = ancName;
    assetSymbol = 'ANC';
  }
  const fromAccount = getAccountsFromWIFKey(fromWif)[0];
  return getBalance(fromAccount.address).then((response) => {
    const balance = response[assetSymbol];
    return getTransactions(fromAccount.address, assetId).then((transactions) => {
      const coinsData = {
        "assetid": assetId,
        "list": transactions,
        "balance": balance,
        "name": assetName
      }
      const txData = transferTransaction(coinsData, fromAccount.publickeyEncoded, toAddress, amount);
      const sign = signatureData(txData, fromAccount.privatekey);
      const txRawData = addContract(txData, sign, fromAccount.publickeyEncoded);
      let jsonRequest = axios.create({
        headers: {"Content-Type": "application/json"}
      });
      const jsonRpcData = {"jsonrpc": "2.0", "method": "sendrawtransaction", "params": [txRawData], "id": 4};
      return jsonRequest.post(rpcEndpoint, jsonRpcData).then((response) => {
        return response.data;
      });
    });
  });
};
