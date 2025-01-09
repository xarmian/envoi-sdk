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
console.log(address); // BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ

// Reverse lookup: get name from address
const name = await resolver.http.getNameFromAddress('BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ');
console.log(name); // en.voi

// Search for names
const searchResults = await resolver.http.search('voi');
searchResults.forEach(result => {
  console.log(`Name: ${result.name}`);
  console.log(`Address: ${result.address}`);
  if (result.metadata) {
    console.log('Metadata:', result.metadata);
  }
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

#### `http.getNameFromAddress(address: string): Promise<string>`

Performs a reverse lookup to find a name associated with a Voi address using the HTTP API.

- Returns an empty string if no name is found or if the request fails.
- Fast and suitable for most applications.

#### `http.getAddressFromName(name: string): Promise<string>`

Resolves a name to its associated Voi address using the HTTP API.

- Returns an empty string if no address is found or if the request fails.
- Fast and suitable for most applications.

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

- Returns an empty array if no matches are found or if the request fails.
- Results are returned in order of relevance.
- The search is case-insensitive.

### Chain Resolver Methods

#### `chain.getNameFromAddress(address: string): Promise<string>`

Performs a reverse lookup to find a name associated with a Voi address by querying the blockchain directly.

- Returns an empty string if no name is found or if the address is invalid.
- Provides on-chain verification but may be slower than HTTP queries.

#### `chain.getAddressFromName(name: string): Promise<string>`

Resolves a name to its associated Voi address by querying the blockchain directly.

- Returns an empty string if no address is found.
- Provides on-chain verification but may be slower than HTTP queries.

## Command Line Interface

The SDK includes a command-line tool for quick lookups and testing:

```bash
# Resolve a name to an address
resolve address en.voi

# Resolve an address to a name
resolve name BRB3JP4LIW5Q755FJCGVAOA4W3THJ7BR3K6F26EVCGMETLEAZOQRHHJNLQ

# Search for names
resolve search voi
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