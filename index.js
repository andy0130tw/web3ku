import Web3 from 'web3'

let web3 = null

const netDesc = {
   1: { id:  1, name: 'mainnet',           etherscanPrefix: '' },
   3: { id:  3, name: 'testnet (Ropsten)', etherscanPrefix: 'ropsten.' },
   4: { id:  4, name: 'testnet (Rinkeby)', etherscanPrefix: 'rinkeby.' },
  42: { id: 42, name: 'testnet (Kovan)',   etherscanPrefix: 'kovan.' },
}

function getEthereumProvider() {
  if (!Web3.givenProvider)
    return null

  if (web3 && !web3.currentProvider)
    web3.setProvider(Web3.givenProvider)

  return Web3.givenProvider
}

function getWeb3Instance() {
  if (!web3) {
    web3 = new Web3()
    getEthereumProvider()
  }
  return web3
}

function getCurrentAddress() {
  getWeb3Instance()
  const prov = getEthereumProvider()

  return Promise.resolve()
  .then(() => {
    if (web3.currentProvider.enable) {
      return web3.currentProvider.enable()
    } else {
      return web3.eth.getAccounts()
    }
  })
  .then(accList => {
    if (accList.length) {
      web3.eth.defaultAccount = accList[0]
    }
    return Promise.resolve(accList)
  })
}

// sometimes we may expected the callback be called for multiple times,
// the function thus does not return a promise by design
function watchAccountChange(web3, callback) {
  return setInterval(() => {
    web3.eth.getAccounts().then(acc => {
      if (!acc || acc[0] != web3.eth.defaultAccount) {
        callback(acc)
      }
    });
  }, 500)
}

export default {
  netDesc,

  getEthereumProvider,
  getWeb3Instance,
  getCurrentAddress,
  watchAccountChange,
}
