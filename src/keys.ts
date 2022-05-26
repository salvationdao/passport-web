enum HubKey {
	AuthRegister = "AUTH:REGISTER",
	AuthSendVerifyEmail = "AUTH:SEND_VERIFY_EMAIL",
	AuthGenerateTFA = "AUTH:GENERATE:TFA",
	AuthCancelTFA = "AUTH:TFA:CANCEL",
	AuthTFAVerification = "AUTH:TFA:VERIFICATION",
	AuthTFARecoveryCodeGet = "AUTH:TFA:RECOVERY:CODE:GET",
	AuthTFARecoveryCodeSet = "AUTH:TFA:RECOVERY:CODE:SET",
	AuthTFARecovery = "AUTH:TFA:RECOVERY",

	User = "USER",
	UserUpdate = "USER:UPDATE",
	/** Tracks user changes */
	UserUsernameUpdate = "USER:USERNAME:UPDATE",

	UserOnlineStatus = "USER:ONLINE_STATUS",

	UserSupsSubscribe = "USER:SUPS:SUBSCRIBE",
	UserFingerprint = "USER:FINGERPRINT",
	UserLock = "USER:LOCK",

	ImageList = "IMAGE:LIST",

	AssetList721 = "ASSET:LIST:721",
	AssetSubscribe721 = "ASSET:GET:721",
	AssetList1155 = "ASSET:LIST:1155",
	AssetSubscribe1155 = "ASSET:GET:1155",
	CollectionSubscribe = "COLLECTION:SUBSCRIBE",

	TransactionGroups = "TRANSACTION:GROUPS",
	TransactionList = "TRANSACTION:LIST",
	TransactionSubscribe = "TRANSACTION:SUBSCRIBE",

	SupTotalRemaining = "SUPS:TREASURY",
	SupExchangeRates = "SUPS:EXCHANGE",
	SupsDeposit = "SUPS:DEPOSIT",
	SupsDepositList = "SUPS:DEPOSIT:LIST",
}

export default HubKey
