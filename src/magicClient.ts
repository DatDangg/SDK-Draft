// src/magicClient.ts
import { OAuthExtension } from '@magic-ext/oauth';
import { Magic as MagicBase } from 'magic-sdk';
import { Magic } from './types';
import { getChainId, getNetworkUrl } from './utils/network';

let instance: Magic | null = null;
export function initMagic(apiMagicKey: string, network: string, apiNetworkKey?: string): Magic {
  if (instance) return instance;
  const key = apiMagicKey;
  if (!key) {
    throw new Error('Magic API key not provided. Set NEXT_PUBLIC_MAGIC_API_KEY or pass apiKey to initMagic().');
  }

  instance = new MagicBase(key, {
    network: {
      rpcUrl: getNetworkUrl(network, apiNetworkKey),
      chainId: getChainId(network),
    },
    extensions: [new OAuthExtension()],
  }) as Magic;

  return instance;
}

export function getMagic() {
  if (!instance) {
    return null;
  }
  return instance;
}
