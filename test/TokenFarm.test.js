const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) { 
    return web3.utils.toWei(n, 'Ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        // Load the contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        // Transfer tokens
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))
        await daiToken.transfer(investor, tokens('100'), {from: owner});
    })

    describe('Mock Dai deployment', async () => {
        it('has a name', async() => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token');
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async() => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async() => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm Test')
        })

        it('contract has tokens', async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'));
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance is correct before staking');
        
            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            // Check staking result
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance is correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking!');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(true, result, 'Investor is in isStaking mapping');

            // Issue Tokens
            await tokenFarm.issueTokens({from: owner});
            result = await dappToken.balanceOf(investor);
            assert.equal(tokens('100'), result.toString(), "Issued tokens matches staked tokens.");

            // Ensure owner is the only one that can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;
        })
    })
})