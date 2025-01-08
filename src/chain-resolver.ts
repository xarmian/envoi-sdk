import algosdk from "algosdk";
import { CONTRACT } from "ulujs";
import { queryAddress, resolverAppId, vnsTokenAppId } from "./config.js";
import { isVoiAddress, namehash, stripNullBytes, uint8ArrayToBigInt } from "./utils.js";

export interface EnvoiChainResolver {
  getNameFromAddress: (address: string) => Promise<string>;
  getAddressFromName: (name: string) => Promise<string>;
}

export interface AlgodConfig {
  token: string;
  url: string;
  port: number;
}

function createAlgodClient(config: AlgodConfig): algosdk.Algodv2 {
  return new algosdk.Algodv2(config.token, config.url, config.port);
}

interface ContractResponse {
  success: boolean;
  returnValue: string;
}

export function createChainResolver(userConfig: AlgodConfig): EnvoiChainResolver {
  const algodClient = createAlgodClient(userConfig);

  const ciResolver = new CONTRACT(
    resolverAppId,
    algodClient,
    null,
    {
      name: "resolver",
      description: "resolver",
      methods: [
        {
          name: "name",
          args: [
            { type: "byte[32]" }
          ],
          returns: { type: "byte[256]" }
        },
        {
          name: "arc72_ownerOf",
          args: [
            { type: "uint256" }
          ],
          returns: { type: "address" }
        }
      ],
      events: []
    },
    {
      addr: queryAddress,
      sk: new Uint8Array([])
    }
  );

  return {
    getNameFromAddress: async (address: string): Promise<string> => {
      if (!isVoiAddress(address)) {
        return '';
      }

      (ciResolver as any).contractId = resolverAppId;
      
      const lookup = await namehash(`${address}.addr.reverse`);
      const nameR = await (ciResolver as any).name(lookup) as ContractResponse;

      if (nameR.success) {
        return stripNullBytes(nameR.returnValue);
      }
      return '';
    },

    getAddressFromName: async (name: string): Promise<string> => {
      (ciResolver as any).contractId = vnsTokenAppId;

      const lookup = uint8ArrayToBigInt(await namehash(`${name}`));
      const nameR = await (ciResolver as any).arc72_ownerOf(lookup) as ContractResponse;

      if (nameR.success) {
        return stripNullBytes(nameR.returnValue);
      }
      return '';
    }
  };
} 