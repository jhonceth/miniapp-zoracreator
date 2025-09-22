// Test simple para verificar la función de Etherscan
const testEtherscan = async () => {
  try {
    console.log('🧪 Probando API de Etherscan directamente...');
    
    const userAddress = '0x79499A61e96A3B31a5DDfc992964647bB527B540';
    const tokenAddress = '0x2b5050F01d64FBb3e4Ac44dc07f0732BFb5ecadF';
    const apiKey = 'QCV4MDYE2YAHVPAUWT8UE977KIYGXF7URK';
    
    // Test ETH Balance
    console.log('📊 Probando ETH Balance...');
    const ethUrl = `https://api.etherscan.io/v2/api?module=account&action=balance&address=${userAddress}&chainid=8453&apikey=${apiKey}`;
    const ethResponse = await fetch(ethUrl);
    const ethData = await ethResponse.json();
    console.log('✅ ETH Balance Response:', ethData);
    
    // Test Token Balance
    console.log('🪙 Probando Token Balance...');
    const tokenUrl = `https://api.etherscan.io/v2/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${userAddress}&chainid=8453&apikey=${apiKey}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    console.log('✅ Token Balance Response:', tokenData);
    
    // Convertir a valores legibles
    const ethBalance = parseInt(ethData.result) / 1e18;
    const tokenBalance = parseInt(tokenData.result) / 1e18;
    
    console.log('📈 Balances convertidos:');
    console.log(`ETH: ${ethBalance.toFixed(6)} ETH`);
    console.log(`Token: ${tokenBalance.toFixed(6)} tokens`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testEtherscan();
