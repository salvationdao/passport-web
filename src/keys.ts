enum HubKey {
	Welcome = "WELCOME",
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

	UserSupsSubscribe = "USER:SUPS",
	UserFingerprint = "USER:FINGERPRINT",

	ImageList = "IMAGE:LIST",

	CollectionList = "COLLECTION:LIST",
	CollectionUpdated = "COLLECTION:SUBSCRIBE",

	AssetList = "ASSET:LIST",
	AssetUpdated = "ASSET:SUBSCRIBE",
	AssetUpdateName = "ASSET:UPDATE:NAME",
	StoreItemSubscribe = "STORE:ITEM",
	StoreList = "STORE:LIST",
	StorePurchase = "STORE:PURCHASE",
	StoreLootBox = "STORE:LOOTBOX",
	StoreLootBoxAmount = "STORE:LOOTBOX:AMOUNT",

	TransactionGroups = "TRANSACTION:GROUPS",
	TransactionList = "TRANSACTION:LIST",
	TransactionSubscribe = "TRANSACTION:SUBSCRIBE",
	GetFactionsDetail = "FACTION:ALL",
	FactionEnlist = "FACTION:ENLIST",

	SupTotalRemaining = "SUPS:TREASURY",
	SupExchangeRates = "SUPS:EXCHANGE",
	SupsDeposit = "SUPS:DEPOSIT",
	SupsDepositList = "SUPS:DEPOSIT:LIST",

	FactionAvailables = "AVAILABLE:ITEM:AMOUNT",
}

export default HubKey
