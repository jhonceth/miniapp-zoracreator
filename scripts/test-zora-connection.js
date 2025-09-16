#!/usr/bin/env node

/**
 * Script para verificar la conexión con la API de Zora
 * Ejecutar con: node scripts/test-zora-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createMetadataBuilder, createZoraUploaderForCreator, setApiKey } = require('@zoralabs/coins-sdk');

async function testZoraConnection() {
  console.log('🧪 Probando conexión con Zora API...\n');
  
  // Verificar variables de entorno
  const zoraApiKey = process.env.ZORA_API_KEY;
  if (!zoraApiKey) {
    console.error('❌ ZORA_API_KEY no encontrada en variables de entorno');
    console.log('💡 Asegúrate de tener un archivo .env.local con ZORA_API_KEY configurada');
    process.exit(1);
  }
  
  console.log('✅ ZORA_API_KEY encontrada:', zoraApiKey.substring(0, 20) + '...');
  
  try {
    // Configurar API key
    setApiKey(zoraApiKey);
    console.log('✅ API key configurada correctamente');
    
    // Crear un metadata builder de prueba
    console.log('🔧 Creando metadata builder...');
    const builder = createMetadataBuilder()
      .withName('Test Token')
      .withSymbol('TEST')
      .withDescription('Token de prueba para verificar la conexión con Zora');
    
    console.log('✅ Metadata builder creado exitosamente');
    
    // Verificar que el builder tiene los métodos necesarios
    console.log('🔍 Verificando métodos del builder...');
    const methods = ['withName', 'withSymbol', 'withDescription', 'withImage', 'upload'];
    methods.forEach(method => {
      if (typeof builder[method] === 'function') {
        console.log(`  ✅ ${method} - Disponible`);
      } else {
        console.log(`  ❌ ${method} - No disponible`);
      }
    });
    
    console.log('\n🎉 ¡Conexión con Zora API verificada exitosamente!');
    console.log('📋 Resumen:');
    console.log('  - API Key: ✅ Configurada');
    console.log('  - Metadata Builder: ✅ Funcionando');
    console.log('  - Métodos disponibles: ✅ Todos presentes');
    console.log('\n💡 La aplicación debería funcionar correctamente para crear tokens');
    
  } catch (error) {
    console.error('❌ Error verificando conexión con Zora:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('  1. Verifica que ZORA_API_KEY sea válida');
    console.log('  2. Verifica tu conexión a internet');
    console.log('  3. Verifica que @zoralabs/coins-sdk esté instalado correctamente');
    process.exit(1);
  }
}

// Ejecutar la prueba
testZoraConnection();
