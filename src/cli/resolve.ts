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

  if (!command || !query || !['name', 'address', 'search', 'token'].includes(command)) {
    console.log(`
Usage: resolve <command> <query>

Commands:
  name <address[,address,...]>     Resolve addresses to names using both HTTP and chain resolvers
  address <name[,name,...]>     Resolve names to addresses using both HTTP and chain resolvers
  search <pattern>   Search for names matching a pattern using the HTTP resolver
  token <token_id[,token_id,...]>   Get information about token IDs using the HTTP resolver

Examples:
  resolve name BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ
  resolve name BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  resolve address en.voi
  resolve address en.voi,test.voi
  resolve search voi
  resolve token 80067632360305829899847207196844336417360777167721505904064743996533051131418
  resolve token 80067632360305829899847207196844336417360777167721505904064743996533051131418,80067632360305829899847207196844336417360777167721505904064743996533051131419
`);
    process.exit(1);
  }

  try {
    let httpResults: string[] = [];
    let searchResults: Array<{ name: string; address: string; metadata?: unknown }> = [];
    let tokenInfos: Array<{ token_id: string; name: string; address: string; metadata?: unknown }> = [];

    const queries = query.split(',');

    switch (command) {
      case 'name': {
        httpResults = await sdk.http.getNameFromAddress(queries);
        const chainResult = await sdk.chain.getNameFromAddress(queries[0]); // Chain resolver doesn't support multiple yet
        console.log('\nResolving address(es) to name(s)...');
        console.log('\nHTTP Results:');
        queries.forEach((addr, i) => {
          console.log(`${addr}: ${httpResults[i] || '(not found)'}`);
        });
        if (queries.length === 1) {
          console.log('\nChain Result:', chainResult || '(not found)');
        }
        break;
      }

      case 'address': {
        httpResults = await sdk.http.getAddressFromName(queries);
        const chainResult = await sdk.chain.getAddressFromName(queries[0]); // Chain resolver doesn't support multiple yet
        console.log('\nResolving name(s) to address(es)...');
        console.log('\nHTTP Results:');
        queries.forEach((name, i) => {
          console.log(`${name}: ${httpResults[i] || '(not found)'}`);
        });
        if (queries.length === 1) {
          console.log('\nChain Result:', chainResult || '(not found)');
        }
        break;
      }

      case 'search': {
        console.log('\nSearching for names matching:', query);
        searchResults = await sdk.http.search(query);
        if (searchResults.length === 0) {
          console.log('No results found');
        } else {
          console.log('\nResults:');
          searchResults.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.name}`);
            console.log(`   Address: ${result.address}`);
            if (result.metadata) {
              console.log('   Metadata:', JSON.stringify(result.metadata, null, 2));
            }
          });
        }
        break;
      }

      case 'token': {
        console.log('\nResolving token ID(s)...');
        tokenInfos = await sdk.http.getTokenInfo(queries);
        if (tokenInfos.length === 0) {
          console.log('No tokens found via HTTP');
        } else {
          console.log('\nHTTP Results:');
          tokenInfos.forEach((info, index) => {
            if (index > 0) console.log(''); // Add spacing between tokens
            console.log(`Token ${index + 1}:`);
            console.log('  Name:', info.name);
            console.log('  Address:', info.address);
            console.log('  Token ID:', info.token_id);
            if (info.metadata) {
              console.log('  Metadata:', JSON.stringify(info.metadata, null, 2));
            }
          });
        }

        // For single token ID, also try chain resolution
        if (queries.length === 1) {
          const chainName = await sdk.chain.getNameFromToken(queries[0]);
          console.log('\nChain Result:');
          console.log('  Name:', chainName || '(not found)');
        }
        break;
      }
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