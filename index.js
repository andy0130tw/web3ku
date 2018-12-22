import Web3 from 'web3'

let web3 = null

const netDesc = {
   1: { id:  1, name: 'mainnet',           etherscanPrefix: '' },
   3: { id:  3, name: 'testnet (Ropsten)', etherscanPrefix: 'ropsten.' },
   4: { id:  4, name: 'testnet (Rinkeby)', etherscanPrefix: 'rinkeby.' },
  42: { id: 42, name: 'testnet (Kovan)',   etherscanPrefix: 'kovan.' },
}

/**
 * Initiate the provider from the browser, aka givenProvider. This provider is
 * attached to the app-wide web3 instance if it is initiated.
 *
 * @return {Web3Provider} Web3 given provider
 */
function getEthereumProvider() {
  if (!Web3.givenProvider)
    return null

  if (web3 && !web3.currentProvider)
    web3.setProvider(Web3.givenProvider)

  return Web3.givenProvider
}

/**
 * Get an app-wide web3 instance. Initiate its provider if necessery.
 *
 * @return {Web3} The web3 instance
 */
function getWeb3Instance() {
  if (!web3) {
    web3 = new Web3()
    getEthereumProvider()
  }
  return web3
}

/**
 * Load the current address eagerly. If the address is hide because of
 * privacy mode or compliance of EIP-1102, ask for the user's permission first.
 *
 * @return {Promise<*>} Resolve to the account list; usually an array
 */
function getCurrentAddress() {
  getWeb3Instance()
  const ethProv = getEthereumProvider()

  return web3.eth.getAccounts()
  .then(accList_ => {
    if ((accList_ && accList_.length) || !ethProv.enable) {
      // older/unsupported EthereumProvider (for EIP-1102)
      return Promise.resolve(accList_);
    }
    // EP of MetaMask 5+ (EIP-1102-compliant) with privacy mode on
    return ethProv.enable()
  })
  .then(accList => {
    if (accList.length) {
      web3.eth.defaultAccount = accList[0]
    }
    return Promise.resolve(accList)
  })
}


/**
 * Poll for the wallet address with a `setInterval` call; when the account
 * changes, the callback is called.
 * Note: sometimes we may expected the callback be called for multiple times,
 * thus this function does not return a promise by design.
 *
 * @param  {Web3}     web3     A web3 instance to be listened
 * @param  {Function} callback The callback to be called
 * @return {Timer}             The return of setInterval()
 */
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
