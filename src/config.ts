export const XGRID_LICENSE = process.env.XGRID_LICENSE_KEY

export const SENTRY_CONFIG = {
	DSN: process.env.REACT_APP_SENTRY_DSN_FRONTEND,
	RELEASE: process.env.REACT_APP_SENTRY_CURRENT_RELEASE_NAME,
	ENVIRONMENT: process.env.REACT_APP_SENTRY_ENVIRONMENT,
	get SAMPLERATE(): number {
		let rate = Number(process.env.REACT_APP_SENTRY_SAMPLERATE)

		// Check rate is a number between 0 and 1
		if (isNaN(rate) || rate > 1 || rate < 0) {
			return 0.01
		}
		return rate
	},
}

export const SUPREMACY_IMAGE_FOLDER = process.env.REACT_APP_SUPREMACY_IMAGE_FOLDER || "https://afiles.ninja-cdn.com/supremacy/images"

export const TOKEN_SALE_ENDPOINT = process.env.REACT_APP_TOKEN_SALE_ENDPOINT || `${window.location.protocol}//${"api.xsyndev.io"}/buy`

export const API_ENDPOINT_HOSTNAME = process.env.REACT_APP_PASSPORT_API_ENDPOINT_HOSTNAME || "passport.supremacygame.io" || "api.xsyndev.io"

export const SIGN_MESSAGE = process.env.REACT_APP_PASSPORT_METAMASK_SIGN_MESSAGE || ""
export const BYPASS_WHITELIST = process.env.REACT_APP_BYPASS_WHITELIST || "false"
export const BATTLE_ARENA_LINK = process.env.REACT_APP_BATTLE_ARENA_LINK || "https://play.supremacygame.io"

export const SUPS_CONTRACT_ADDRESS = process.env.REACT_APP_SUPS_CONTRACT_ADDRESS || "0x5e8b6999B44E011F485028bf1AF0aF601F845304"
export const USDC_CONTRACT_ADDRESS = process.env.REACT_APP_USDC_CONTRACT_ADDRESS || "0x8BB4eC208CDDE7761ac7f3346deBb9C931f80A33"
export const BUSD_CONTRACT_ADDRESS = process.env.REACT_APP_BUSD_CONTRACT_ADDRESS || "0xeAf33Ba4AcA3fE3110EAddD7D4cf0897121583D0"

export const ETH_SCAN_SITE = process.env.REACT_APP_ETH_SCAN_SITE || "goerli.etherscan.io"
export const BSC_SCAN_SITE = process.env.REACT_APP_BSC_SCAN_SITE || "testnet.bscscan.com"

export const ETHEREUM_CHAIN_ID = process.env.REACT_APP_ETHEREUM_CHAIN_ID || "5"
export const BINANCE_CHAIN_ID = process.env.REACT_APP_BINANCE_CHAIN_ID || "97"
export const PURCHASE_ADDRESS = process.env.REACT_APP_PURCHASE_ADDRESS || "0x7D6439fDF9B096b29b77afa28b3083c0a329c7fE"
export const WITHDRAW_ADDRESS = process.env.REACT_APP_WITHDRAW_ADDRESS || "0x9DAcEA338E4DDd856B152Ce553C7540DF920Bb15"
export const REDEEM_ADDRESS = process.env.REACT_APP_REDEEM_ADDRESS || "0xc01c2f6DD7cCd2B9F8DB9aa1Da9933edaBc5079E"
export const WALLET_CONNECT_RPC = process.env.REACT_APP_WALLET_CONNECT_RPC || "1375aa321ac8ac6cfba6aa9c"
export const SAFT_AGREEMENT_PDF = process.env.SAFT_AGREEMENT_PDF || "/09_03_22_Token_Subscription_Agreement_Wallet_Address_Signature_Sups.pdf"
export const FARM_CONTRACT_ADDRESS = process.env.REACT_APP_FARM_CONTRACT_ADDRESS || "0x20034d860bf43ef6d6dded79a8d73e857e10960c"
export const PANCAKE_POOL_ADDRESS = process.env.REACT_APP_PANCAKE_POOL_ADDRESS || "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
export const LP_TOKEN_ADDRESS = process.env.REACT_APP_LP_TOKEN_ADDRESS || "0xd96e4e2e0b1b41cad0627431a8cda64aaa5acd01"
export const WRAPPED_BNB_ADDRESS = process.env.REACT_APP_WRAPPED_BNB_ADDRESS || "0xae13d989dac2f0debff460ac112a837c89baa7cd"
export const PANCAKE_SWAP_ADDRESS = process.env.REACT_APP_PANCAKE_SWAP_ADDRESS || "pancake.kiemtienonline360.com/#"
export const AVANT_API_ENDPOINT = process.env.REACT_APP_AVANT_API_ENDPOINT || "v3-staging.supremacy-api.avantdata.com:3001"

// oauth
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_PASSPORT_GOOGLE_CLIENT_ID
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID
