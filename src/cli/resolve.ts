#!/usr/bin/env node

import { init } from '../index.js';

const MAINNET_NODE = {
  token: '',
  url: 'https://mainnet-api.voi.nodely.dev',
  port: 443
};

async function main() {
  const sdk = init(MAINNET_NODE);
  const command = process.argv[2]?.toLowerCase();
  const query = process.argv[3];

  if (!command || !query || !['name', 'address', 'search'].includes(command)) {
    console.log(`
Usage: resolve <command> <query>

Commands:
  name <address>     Resolve an address to a name using both HTTP and chain resolvers
  address <name>     Resolve a name to an address using both HTTP and chain resolvers
  search <pattern>   Search for names matching a pattern using the HTTP resolver

Examples:
  resolve name BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ
  resolve address en.voi
  resolve search voi
`);
    process.exit(1);
  }

  try {
    switch (command) {
      case 'name':
        const httpName = await sdk.http.getNameFromAddress(query);
        const chainName = await sdk.chain.getNameFromAddress(query);
        console.log('\nResolving address to name...');
        console.log('HTTP Result:', httpName || '(not found)');
        console.log('Chain Result:', chainName || '(not found)');
        break;

      case 'address':
        const httpAddress = await sdk.http.getAddressFromName(query);
        const chainAddress = await sdk.chain.getAddressFromName(query);
        console.log('\nResolving name to address...');
        console.log('HTTP Result:', httpAddress || '(not found)');
        console.log('Chain Result:', chainAddress || '(not found)');
        break;

      case 'search':
        console.log('\nSearching for names matching:', query);
        const results = await sdk.http.search(query);
        if (results.length === 0) {
          console.log('No results found');
        } else {
          console.log('\nResults:');
          results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.name}`);
            console.log(`   Address: ${result.address}`);
            if (result.metadata) {
              console.log('   Metadata:', JSON.stringify(result.metadata, null, 2));
            }
          });
        }
        break;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('\nError:', err.message);
    } else {
      console.error('\nAn unknown error occurred');
    }
    process.exit(1);
  }
}

main().catch((err) => {
  if (err instanceof Error) {
    console.error('\nFatal error:', err.message);
  } else {
    console.error('\nAn unknown fatal error occurred');
  }
  process.exit(1);
}); 