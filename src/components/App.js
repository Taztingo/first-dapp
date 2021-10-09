import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
import Navbar from './Navbar'
import Main from './Main';
import './App.css'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'

const App = () => {
  const [account, setAccount] = useState('0x0');
  const [daiToken, setDaiToken] = useState({});
  const [dappToken, setDappToken] = useState({});
  const [tokenFarm, setTokenFarm] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState('0');
  const [dappTokenBalance, setDappTokenBalance] = useState('0');
  const [stakingBalance, setStakingBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlockchain = async () => {
      await loadWeb3();
      await loadBlockchainData();
    }
    loadBlockchain();
  }, []);

  const loadWeb3 = async () => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } 
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  }

  const loadBlockchainData = async () => {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    
    const daiTokenData = DaiToken.networks[networkId];
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address);
      setDaiToken(daiToken);

      let daiTokenBalance = await daiToken.methods.balanceOf(accounts[0]).call();
      setDaiTokenBalance(daiTokenBalance.toString());

    } else {
      window.alert("DaiToken contract has not been deployed to the detected network.");
    }

    const dappTokenData = DappToken.networks[networkId];
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address);
      setDappToken(dappToken);

      let dappTokenBalance = await dappToken.methods.balanceOf(accounts[0]).call();
      setDappTokenBalance(dappTokenBalance.toString());
      
    } else {
      window.alert("DappToken contract has not been deployed to the detected network.");
    }

    const tokenFarmData = TokenFarm.networks[networkId];
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address);
      setTokenFarm(tokenFarm);

      let stakingBalance = await tokenFarm.methods.stakingBalance(accounts[0]).call();
      setStakingBalance(stakingBalance.toString());
      
    } else {
      window.alert("TokenFarm contract has not been deployed to the detected network.");
    }

    setLoading(false);
  }

  const stakeTokens = (amount) => {
    setLoading(true);
    daiToken.methods.approve(tokenFarm._address, amount).send({from: account}).on('transactionHash', (hash) => {
      tokenFarm.methods.stakeTokens(amount).send({from: account}).on('transactionHash', (hash) => {
        setLoading(false);
      })
    })
  }

  const unstakeTokens = (amount) => {
    setLoading(true);
    tokenFarm.methods.unstakeTokens().send({from: account}).on('transactionHash', (hash) => {
      setLoading(false);
    })
  }

  let content;
  if(loading) {
    content = <p id="loader" className="text-center">Loading...</p>
  } else {
    content = <Main
      daiTokenBalance = {daiTokenBalance}
      dappTokenBalance = {dappTokenBalance}
      stakingBalance = {stakingBalance}
      stakeTokens = {stakeTokens}
      unstakeTokens = {unstakeTokens}
    />
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>

              {content}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
