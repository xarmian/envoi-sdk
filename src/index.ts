import { AlgodConfig, createChainResolver, EnvoiChainResolver } from './chain-resolver.js';
import { createHttpClient, EnvoiHttpClient } from './http-client.js';

export interface EnvoiSDK {
  http: EnvoiHttpClient;
  chain: EnvoiChainResolver;
}

export function init(config: AlgodConfig): EnvoiSDK {
  return {
    http: createHttpClient(),
    chain: createChainResolver(config)
  };
}

export default { init }; 