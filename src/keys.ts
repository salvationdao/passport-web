enum HubKey {
	AuthRegister = "AUTH:REGISTER",
	AuthSendVerifyEmail = "AUTH:SEND_VERIFY_EMAIL",
	AuthGenerateTFA = "AUTH:GENERATE:TFA",
	AuthCancelTFA = "AUTH:TFA:CANCEL",
	AuthTwitter = "AUTH:TWITTER",
	AuthTFAVerification = "AUTH:TFA:VERIFICATION",
	AuthTFARecoveryCodeGet = "AUTH:TFA:RECOVERY:CODE:GET",
	AuthTFARecoveryCodeSet = "AUTH:TFA:RECOVERY:CODE:SET",
	AuthTFARecovery = "AUTH:TFA:RECOVERY",

	User = "USER",
	UserUpdate = "USER:UPDATE",
	UserVerifySend = "USER:VERIFY:SEND",

	// TFA
	UserTFAGenerate = "USER:TFA:GENERATE",
	UserTFACancel = "USER:TFA:CANCEL",
	UserTFAVerification = "USER:TFA:VERIFICATION",
	UserTFARecoveryCodeGet = "AUTH:TFA:RECOVERY:GET",
	UserTFARecoveryCodeSet = "AUTH:TFA:RECOVERY:VERIFY",

	/** Tracks user changes */
	UserUsernameUpdate = "USER:USERNAME:UPDATE",
	UserOnlineStatus = "USER:ONLINE_STATUS",
	UserSupsSubscribe = "USER:SUPS:SUBSCRIBE",
	UserFingerprint = "USER:FINGERPRINT",
	UserLock = "USER:LOCK",
	UserInit = "USER:INIT",
	UserAddWallet = "USER:ADD_WALLET",

	ImageList = "IMAGE:LIST",

	AssetList721 = "ASSET:LIST:721",
	AssetGet721 = "ASSET:GET:721",
	AssetList1155 = "ASSET:LIST:1155",
	AssetGet1155 = "ASSET:GET:1155",

	AssetTransferToSupremacy = "ASSET:TRANSFER:TO:SUPREMACY",
	AssetTransferFromSupremacy = "ASSET:TRANSFER:FROM:SUPREMACY",
	Asset1155TransferToSupremacy = "ASSET:1155:TRANSFER:TO:SUPREMACY",
	Asset1155TransferFromSupremacy = "ASSET:1155:TRANSFER:FROM:SUPREMACY",
	Asset1155Deposit = "ASSET:1155:DEPOSIT",
	Asset1155DepositList = "ASSET:1155:DEPOSIT:LIST",

	CollectionSubscribe = "COLLECTION:SUBSCRIBE",

	TransactionGroups = "TRANSACTION:GROUPS",
	TransactionList = "TRANSACTION:LIST",
	TransactionSubscribe = "TRANSACTION:SUBSCRIBE",

	SupTotalRemaining = "SUPS:TREASURY",
	SupExchangeRates = "SUPS:EXCHANGE",
	SupsDeposit = "SUPS:DEPOSIT",
	SupsDepositList = "SUPS:DEPOSIT:LIST",

	// OAUTH
	UserRemoveFacebook = "USER:FACEBOOK:REMOVE",
	UserAddFacebook = "USER:FACEBOOK:ADD",
	UserRemoveGoogle = "USER:GOOGLE:REMOVE",
	UserAddGoogle = "USER:GOOGLE:ADD",
	UserRemoveTwitch = "USER:REMOVE_TWITCH",
	UserAddTwitch = "USER:ADD_TWITCH",
	UserRemoveTwitter = "USER:TWITTER:REMOVE",
	UserAddTwitter = "USER:TWITTER:ADD",
	UserRemoveDiscord = "USER:REMOVE_DISCORD",
	UserAddDiscord = "USER:ADD_DISCORD",
}

export default HubKey
