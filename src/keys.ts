enum HubKey {
	Welcome = "WELCOME",

	AuthLogin = "AUTH:LOGIN",
	AuthLoginToken = "AUTH:TOKEN",
	AuthLoginGoogle = "AUTH:GOOGLE",
	AuthLoginFacebook = "AUTH:FACEBOOK",
	AuthLoginTwitch = "AUTH:TWITCH",
	AuthLoginTwitter = "AUTH:TWITTER",
	AuthLoginDiscord = "AUTH:DISCORD",
	AuthLoginWallet = "AUTH:WALLET",
	AuthLogout = "AUTH:LOGOUT",
	AuthSuccess = "AUTH:SUCCESS",
	AuthRegister = "AUTH:REGISTER",
	AuthSendVerifyEmail = "AUTH:SEND_VERIFY_EMAIL",
	AuthVerifyAccount = "AUTH:VERIFY_ACCOUNT",
	AuthGenerateTFA = "AUTH:GENERATE:TFA",
	AuthCancelTFA = "AUTH:TFA:CANCEL",
	AuthTFAVerification = "AUTH:TFA:VERIFICATION",
	AuthTFARecoveryCodeGet = "AUTH:TFA:RECOVERY:CODE:GET",
	AuthTFARecoveryCodeSet = "AUTH:TFA:RECOVERY:CODE:SET",
	AuthTFARecovery = "AUTH:TFA:RECOVERY",

	UserGet = "USER:GET",
	UserList = "USER:LIST",
	UserCreate = "USER:CREATE",
	UserUpdate = "USER:UPDATE",
	/** Tracks user changes */
	UserUpdated = "USER:SUBSCRIBE",
	UserArchive = "USER:ARCHIVE",
	UserUnarchive = "USER:UNARCHIVE",
	UserChangePassword = "USER:CHANGE_PASSWORD",
	UserOnlineStatus = "USER:ONLINE_STATUS",
	UserForceDisconnect = "USER:FORCE_DISCONNECT",
	UserForceDisconnected = "USER:FORCE_DISCONNECTED",
	UserRemoveWallet = "USER:REMOVE_WALLET",
	UserAddWallet = "USER:ADD_WALLET",
	UserRemoveFacebook = "USER:REMOVE_FACEBOOK",
	UserAddFacebook = "USER:ADD_FACEBOOK",
	UserRemoveGoogle = "USER:REMOVE_GOOGLE",
	UserAddGoogle = "USER:ADD_GOOGLE",
	UserRemoveTwitch = "USER:REMOVE_TWITCH",
	UserAddTwitch = "USER:ADD_TWITCH",
	UserRemoveTwitter = "USER:REMOVE_TWITTER",
	UserAddTwitter = "USER:ADD_TWITTER",
	UserRemoveDiscord = "USER:REMOVE_DISCORD",
	UserAddDiscord = "USER:ADD_DISCORD",

	RoleGet = "ROLE:GET",
	RoleList = "ROLE:LIST",
	RoleCreate = "ROLE:CREATE",
	RoleUpdate = "ROLE:UPDATE",
	RoleArchive = "ROLE:ARCHIVE",
	RoleUnarchive = "ROLE:UNARCHIVE",

	OrganisationGet = "ORGANISATION:GET",
	OrganisationList = "ORGANISATION:LIST",
	OrganisationCreate = "ORGANISATION:CREATE",
	OrganisationUpdate = "ORGANISATION:UPDATE",
	OrganisationArchive = "ORGANISATION:ARCHIVE",
	OrganisationUnarchive = "ORGANISATION:UNARCHIVE",

	ProductGet = "PRODUCT:GET",
	ProductList = "PRODUCT:LIST",
	ProductCreate = "PRODUCT:CREATE",
	ProductUpdate = "PRODUCT:UPDATE",
	ProductArchive = "PRODUCT:ARCHIVE",
	ProductUnarchive = "PRODUCT:UNARCHIVE",

	ImageList = "IMAGE:LIST",

	UserActivityList = "USER_ACTIVITY:LIST",
	UserActivityGet = "USER_ACTIVITY:GET",
	UserActivityCreate = "USER_ACTIVITY:CREATE",

	AssetListUpdated = "ASSET_LIST:SUBSCRIBE",
	AssetUpdated = "ASSET:SUBSCRIBE",
	AssetJoinQue = "ASSET:QUEUE:JOIN",
}

export default HubKey
