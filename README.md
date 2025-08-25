# anomaly-motionbank-nft
MOTIONBANK-NFT用

A React SDK that wraps [Magic](https://magic.link/) (email OTP login) and wires it up to `ethers.js`.

<br/>

# Installation
## Option 1 – declare it manually in package.json

Add the SDK directly from GitHub in your `package.json` dependencies:

```json
{
  "dependencies": {
    "magic-wrapper-sdk": "github:FutureSpirits-SPD-SOL1/anomaly-motionbank-nft-front#magic-wrapper-sdk-dev",
  }
}
```

Then run:

```bash
npm install
# or
yarn install
```

## Option 2 – install directly from the CLI
You skip editing package.json manually and just run:
```bash
npm i github:FutureSpirits-SPD-SOL1/anomaly-motionbank-nft-front#magic-wrapper-sdk-dev
# or
yarn add github:FutureSpirits-SPD-SOL1/anomaly-motionbank-nft-front#magic-wrapper-sdk-dev
```
This command will automatically update your package.json and install the SDK.

<br/>

# Quick start

1) Initialize Magic (singleton)

    Call initMagic once at app bootstrap (before rendering your provider).
    
    This ensures all components use the same Magic instance.

    ```bash
    initMagic(
        process.env.NEXT_PUBLIC_MAGIC_API_KEY!, // required
        "ethereum-sepolia",                     // network (see list below)
        process.env.NEXT_PUBLIC_ALCHEMY_KEY     // optional: RPC provider key
    );
    ```

2) Wrap your app with provider

    Provide your contract ABIs/addresses so that SDK can build `ethers.Contract` instances for you.

    ```bash
    <MagicProvider MarketPlaceInfo={MarketPlaceInfo} NFTInfo={NFTInfo}>
        {children}
    </MagicProvider>
    ```

3) Use the hooks anywhere

<br/>

# API Reference

1. `initMagic(apiMagicKey: string, network: Network, apiNetworkKey?: string): Magic`

    Initialize the Magic client. Returns the same instance on subsequent calls.

    - `apiMagicKey` – your Magic publishable key

        - `network` – one of:

            - `polygon` (137)

            - `polygon-amoy` (80002)

            - `ethereum` (1)

            - `ethereum-sepolia` (11155111)

            - `zksync` (324)

            - `zksync-sepolia` (300)

            - `etherlink` (42793)

            - `etherlink-testnet` (128123)

            - `soneium` (1946)

        - `apiNetworkKey` – optional RPC key for some networks (e.g., Alchemy/Soneium)
</br></br>
2. `<MagicProvider MarketPlaceInfo, NFTInfo>`
    
    Context provider that:

    - Reads the Magic instance

    - Checks login status

    - Creates `ethers.BrowserProvider` and `ethers.Signer`

    - Constructs `ethers.Contract` for your two DI contracts
</br></br>
3. `useWeb3()`

    Returns the full Web3 context:

    ```bash
    {
        // Magic & auth
        magic: Magic | null;
        isLoggedMagic: boolean;
        loginMagic: (options: LoginOptions) => Promise<void>;
        verifyOTPMagic?: (otp: string) => Promise<any>;
        disconnectWallet: () => Promise<void>;
        checkLoggedInMagic: () => Promise<boolean>;
        cancelVerify: () => Promise<void>;

        // Ethers
        ethersProvider: ethers.BrowserProvider | null;
        ethersSigner: ethers.Signer | null;

        // Contracts
        marketContract: ethers.Contract | null;
        nftContract: ethers.Contract | null;

        // Utils
        getUserIdToken: () => Promise<string | null>;
        convertBalance: (value: string | number, from: Unit, to: Unit) => string;

        // UI helpers
        isSendingOTP: boolean;
        isVerifyingOTP: boolean;
        resetOTPCount: () => void;
    }

    ```
    #
    `loginMagic: ((props: LoginMagicType) => Promise<void>) | null`

    ```bash
    type LoginOptions = {
        email: string;
        onSuccess?: () => void;
        onFail?: () => void;
        onOTPSent?: () => void;
        onVerifyOTPFail?: () => void;
        onExpiredEmailOTP?: () => void;
        onLoginThrottled?: () => void;
        onDone?: (result: unknown) => void;
        onError?: (reason: unknown) => void;
        onIdTokenCreated?: (idToken: string) => void;
    }
    ```
    Events supported: 
    - `email-otp-sent` → fired when the OTP email has been sent successfully

    - `invalid-email-otp` → user entered an incorrect OTP

    - `expired-email-otp` → OTP expired before being verified

    - `login-throttled` → login requests are temporarily rate-limited

    - `done` → OTP flow finished successfully

    - `error` → an error occurred during login

    - `Auth/id-token-created` → a new ID token (JWT) has been created for the user

    #
    `getMagic(): Magic | null`

    Returns the initialized Magic instance (or null if not initialized).

    #
    `convertBalance(value, fromUnit, toUnit): string`

    Converts balances between Ethereum units.
    # 
    `verifyOTPMagic?: (otp: string) => Promise<any>;`
    
    Verifies a 6-digit OTP code after loginMagic has been called.

    #    
    `disconnectWallet: () => Promise<void>;`
    
    Logs the user out of Magic and clears cookies (MAGIC_AUTH, LOGGED_MAGIC).

    #
    `checkLoggedInMagic: () => Promise<boolean>;`

    Queries Magic to confirm whether the current user is logged in.

    #
    `cancelVerify: () => Promise<void>;`
    
    Cancels an ongoing OTP verification flow.