# enVoi SDK

A TypeScript/JavaScript SDK for interacting with enVoi, the naming service for Voi Network.

## Installation

```bash
npm install @xarmian/envoi-sdk
```

## Features

- Name resolution using Voi Network (algod) node (on-chain)
- HTTP API integration for fast queries
- Name search functionality
- TypeScript support
- Compatible with Algorand JS SDK v2.7

## Usage

### Initialize the SDK

```typescript
import envoiSDK from '@xarmian/envoi-sdk';

// Initialize with Algod node configuration
const resolver = envoiSDK.init({
  token: 'your-algod-token',
  url: 'https://your-algod-node',
  port: 443
});
```

### Using the HTTP Client (Fast Queries)

The HTTP client provides fast name resolution by querying the enVoi API directly. This is recommended for applications that need quick lookups and don't require on-chain verification.

```typescript
// Resolve a name to an address
const address = await resolver.http.getAddressFromName('en.voi');
console.log(address[0]); // BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ

// Resolve multiple names at once
const addresses = await resolver.http.getAddressFromName(['en.voi', 'test.voi']);
addresses.forEach(addr => console.log(addr));

// Reverse lookup: get name from address
const name = await resolver.http.getNameFromAddress('BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ');
console.log(name[0]); // en.voi

// Resolve multiple addresses at once
const names = await resolver.http.getNameFromAddress(['ADDRESS1', 'ADDRESS2']);
names.forEach(name => console.log(name));

// Search for names
const searchResults = await resolver.http.search('voi');
searchResults.forEach(result => {
  console.log(`Name: ${result.name}`);
  console.log(`Address: ${result.address}`);
  if (result.metadata) {
    console.log('Metadata:', result.metadata);
  }
});

// Get token information
const tokenInfo = await resolver.http.getTokenInfo('80067632360305829899847207196844336417360777167721505904064743996533051131418');
if (tokenInfo.length > 0) {
  console.log('Name:', tokenInfo[0].name);
  console.log('Address:', tokenInfo[0].address);
  console.log('Token ID:', tokenInfo[0].token_id);
  if (tokenInfo[0].metadata) {
    console.log('Metadata:', tokenInfo[0].metadata);
  }
}

// Get multiple tokens at once
const tokenInfos = await resolver.http.getTokenInfo([
  '80067632360305829899847207196844336417360777167721505904064743996533051131418',
  '80067632360305829899847207196844336417360777167721505904064743996533051131419'
]);
tokenInfos.forEach(info => {
  console.log('Name:', info.name);
  console.log('Address:', info.address);
  console.log('Token ID:', info.token_id);
});
```

### Using the Chain Resolver (On-chain Verification)

The chain resolver interacts directly with the Voi Network to resolve names. This provides the most up-to-date and verified information but may be slower than HTTP queries.

```typescript
// Resolve a name to an address
const address = await resolver.chain.getAddressFromName('example.voi');
console.log(address); // Returns the Voi address

// Reverse lookup: get name from address
const name = await resolver.chain.getNameFromAddress('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
console.log(name); // Returns the associated name

// Get name from token ID
const tokenName = await resolver.chain.getNameFromToken('80067632360305829899847207196844336417360777167721505904064743996533051131418');
console.log(tokenName); // Returns the name associated with the token
```

## API Documentation

### `init(config: AlgodConfig): EnvoiSDK`

Initializes the SDK with Algod node configuration.

Parameters:
- `config.token`: Algod node API token
- `config.url`: Algod node URL
- `config.port`: Algod node port

Returns an `EnvoiSDK` instance with the following interfaces:

### HTTP Client Methods

#### `http.getNameFromAddress(address: string | string[]): Promise<string[]>`

Performs a reverse lookup to find names associated with Voi addresses using the HTTP API.

- Returns an array of names, with empty strings for addresses that weren't found
- Fast and suitable for most applications
- Supports resolving multiple addresses in one call

#### `http.getAddressFromName(name: string | string[]): Promise<string[]>`

Resolves names to their associated Voi addresses using the HTTP API.

- Returns an array of addresses, with empty strings for names that weren't found
- Fast and suitable for most applications
- Supports resolving multiple names in one call

#### `http.search(query: string): Promise<Array<SearchResult>>`

Searches for names matching the given query pattern.

Parameters:
- `query`: The search pattern to match against names

Returns an array of search results, where each result has the following structure:
```typescript
interface SearchResult {
  name: string;      // The matched name
  address: string;   // The associated Voi address
  metadata?: unknown; // Optional metadata associated with the name
}
```

#### `http.getTokenInfo(tokenId: string | string[], avatarFormat?: 'thumb' | 'full'): Promise<Array<TokenInfo>>`

Gets information about one or more token IDs using the HTTP API.

Parameters:
- `tokenId`: Single token ID or array of token IDs to resolve
- `avatarFormat`: Optional format for avatar URLs ('thumb' or 'full', defaults to 'thumb')

Returns an array of token information, where each result has the following structure:
```typescript
interface TokenInfo {
  token_id: string;   // The token ID
  name: string;       // The name associated with the token
  address: string;    // The owner's address
  metadata?: unknown;  // Optional metadata associated with the token
}
```

### Chain Resolver Methods

#### `chain.getNameFromAddress(address: string): Promise<string>`

Performs a reverse lookup to find a name associated with a Voi address by querying the blockchain directly.

- Returns an empty string if no name is found or if the address is invalid
- Provides on-chain verification but may be slower than HTTP queries

#### `chain.getAddressFromName(name: string): Promise<string>`

Resolves a name to its associated Voi address by querying the blockchain directly.

- Returns an empty string if no address is found
- Provides on-chain verification but may be slower than HTTP queries

#### `chain.getNameFromToken(tokenId: string): Promise<string>`

Resolves a token ID to its associated name by querying the blockchain directly.

- Returns an empty string if no name is found or if the token ID is invalid
- Provides on-chain verification but may be slower than HTTP queries

## Command Line Interface

The SDK includes a command-line tool for quick lookups and testing:

```bash
# Resolve a name to an address
resolve address en.voi

# Resolve multiple names to addresses
resolve address en.voi,test.voi

# Resolve an address to a name
resolve name BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ

# Resolve multiple addresses to names
resolve name ADDRESS1,ADDRESS2

# Search for names
resolve search voi

# Get token information (shows both HTTP and chain results)
resolve token 80067632360305829899847207196844336417360777167721505904064743996533051131418

# Get multiple tokens' information
resolve token TOKEN_ID1,TOKEN_ID2
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Publishing

The package is automatically published to npm when a new GitHub release is created. To publish a new version:

1. Update the version in package.json:
```bash
npm version patch  # for bug fixes (0.0.X)
npm version minor  # for new features (0.X.0)
npm version major  # for breaking changes (X.0.0)
```

2. Push the changes and tags:
```bash
git push && git push --tags
```

3. Create a new release on GitHub:
   - Go to the repository's Releases page
   - Click "Create a new release"
   - Choose the new version tag
   - Add release notes
   - Publish the release

The GitHub Actions workflow will automatically:
- Run tests
- Build the package
- Publish to npm

For manual publishing:
```bash
npm login  # if not already logged in
npm publish
```

## License

MIT 