import { ethers } from "ethers";

const ZORA_ADDRESS = "0x1111111111166b7FE7bd91427724B487980aFc69";
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

async function verifyZoraToken() {
  console.log("🔍 Verificando token ZORA...");
  
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  try {
    // 1. Verificar que el token existe
    console.log("\n📋 Verificando información del token...");
    const erc20Abi = [
      "function symbol() view returns (string)",
      "function name() view returns (string)", 
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ];
    
    const token = new ethers.Contract(ZORA_ADDRESS, erc20Abi, provider);
    
    const symbol = await token.symbol();
    const name = await token.name();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    
    console.log(`✅ Token encontrado:`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Name: ${name}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
    
    // 2. Verificar si tiene balance en algún address conocido
    console.log("\n💰 Verificando balances...");
    const balances = await Promise.all([
      provider.getBalance("0x0000000000000000000000000000000000000000"),
      provider.getBalance("0x1111111111111111111111111111111111111111"),
      provider.getBalance(ZORA_ADDRESS)
    ]);
    
    console.log(`   Balance en 0x0: ${ethers.formatEther(balances[0])} ETH`);
    console.log(`   Balance en 0x1: ${ethers.formatEther(balances[1])} ETH`);
    console.log(`   Balance del token: ${ethers.formatEther(balances[2])} ETH`);
    
    // 3. Verificar si hay transferencias recientes
    console.log("\n📊 Verificando actividad reciente...");
    try {
      const filter = {
        address: ZORA_ADDRESS,
        fromBlock: "latest",
        toBlock: "latest"
      };
      
      const logs = await provider.getLogs(filter);
      console.log(`   Logs recientes: ${logs.length}`);
    } catch (error) {
      console.log(`   Error obteniendo logs: ${error.message}`);
    }
    
  } catch (error) {
    console.error("❌ Error verificando token:", error);
  }
}

verifyZoraToken().catch(console.error);
