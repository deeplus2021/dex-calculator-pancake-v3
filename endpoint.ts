import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import dotenv from 'dotenv';
import { parseUnits } from 'ethers';

dotenv.config();

const calArtifact = require('./artifacts/PancakeV3Cal.json');
const quoterArtifact = require('./artifacts/QuoterV2.json');
const erc20Artifact = require('./artifacts/ERC20.json');

const rpcUrl = process.env.ENV == 'MAINNET' ? process.env.BSC_MAINNET_RPC_URL : process.env.BSC_TESTNET_RPC_URL;
const web3 = new Web3(rpcUrl);
const address = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(calArtifact.abi, address);
const quoter = new web3.eth.Contract(quoterArtifact.abi, address);

const account = web3.eth.accounts.wallet.add('0x'+String(process.env.PRIVATE_KEY));
const myAddress = account[0].address;

export async function swapableTokenAmountInThePool(
    pool: string,
    priceFrom: number,
    priceTo: number
) {
    try {
        
        // await contract.methods.swapTokensForExactTokens(
        //     amountOutN,
        //     amountInMaximumN,
        //     [tokenIn, tokenOut],
        //     recipient
        // ).send({from: myAddress});
        
        console.log("Success swapping");
    } catch(error) {
        console.error("Error swap v2 pair:", error);
        throw error;
    };
}

export async function tokenPriceInThePool(pool: string) {
    try {
        const returns: {
            'sqrtPriceX96': number,
            'token0': string,
            'token1': string
        } = await contract.methods.getPoolInfo(pool).call();

        const sqrtPriceX96: BigNumber = new BigNumber(returns.sqrtPriceX96);
        const token0Contract = new web3.eth.Contract(erc20Artifact.abi, returns.token0);
        const token1Contract = new web3.eth.Contract(erc20Artifact.abi, returns.token1);
        const decimals0 = await token0Contract.methods.decimals().call();
        const decimals1 = await token1Contract.methods.decimals().call();
        const symbol0 = await token0Contract.methods.symbol().call();
        const symbol1 = await token1Contract.methods.symbol().call();

        const Q96: BigNumber = BigNumber(2).pow(96);

        const price01: BigNumber = sqrtPriceX96.div(Q96).pow(2);
        const price10: BigNumber = BigNumber(1).div(price01);

        // output prices
        console.log(`${symbol0}/${symbol1}: ${convert(price01, 4)}`);
        console.log(`${symbol1}/${symbol0}: ${convert(price10, 4)}`);
    } catch(error) {
        console.error(error);
        throw error;
    };
}

export async function test() {
    console.log(parseUnits('0.34', 18));
}

function convert(
    num: BigNumber,
    precision: number,
    round: BigNumber.RoundingMode = 1
): string {
    if (num.gte(1)) return num.toFixed(precision, 1);

    const exponent = new BigNumber(Number(num.e));
    return num.toFixed(
        exponent.abs().plus(precision - 1).toNumber(),
        round
    );
}