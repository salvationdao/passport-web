import { Alert, Box, Snackbar, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom"
import { BlockConfirmationSnackList } from "./components/blockConfirmationSnackList"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { Loading } from "./components/loading"
import { Maintenance } from "./components/maintenance"
import { Sidebar } from "./components/sidebar"
import { API_ENDPOINT_HOSTNAME } from "./config"
import { useAuth } from "./containers/auth"
import { useFingerprint } from "./containers/fingerprint"
import { useSidebarState } from "./containers/sidebar"
import { useSnackbar } from "./containers/snackbar"
import { useWeb3 } from "./containers/web3"
import { usePassportCommandsUser } from "./hooks/usePassport"
import HubKey from "./keys"
import { CorrectWalletConnected } from "./pages/auth/correctWalletConnected"
import { PassportReady } from "./pages/auth/onboarding"
import { SignUpPage } from "./pages/auth/signup"
import { BuyPage } from "./pages/buy"
import { DepositPage } from "./pages/deposit/depositPage"
import { ContractAssetPage } from "./pages/DepositAssets/ContractAssetPage"
import { DepositAssetsPage } from "./pages/DepositAssets/DepositAssetsPage"
import { DepositHistoryPage } from "./pages/DepositAssets/DepositHistoryTable/DepositHistoryPage"
import { FarmsPage } from "./pages/farms/farmsPage"
import { Home } from "./pages/home"
import { IFrameBuyPage } from "./pages/iFrameBuy"
import { LoginPage } from "./pages/login"
import { TwitterRedirect } from "./pages/login/twitterRedirect"
import { AssetRedirectPage } from "./pages/Profile/Assets/721/SingleAssetView/AssetRedirectPage"
import { ProfilePage } from "./pages/Profile/ProfilePage"
import { StorePage } from "./pages/Store/StorePage"
import { TransactionsPage } from "./pages/transactions/transactions"
import { TwoFactorAuthenticationRecoveryCode } from "./pages/twoFactorAuthentication/recoveryCode"
import { TwoFactorAuthenticationSetup } from "./pages/twoFactorAuthentication/setup"
import VerifyEmail from "./pages/verify"
import { WithdrawPage } from "./pages/withdraw/withdrawPage"
import { IFrameTransactionPage } from "./pages/iFrameTransactionPage"

export const Routes: React.FC = () => {
	const { account } = useWeb3()
	const { send } = usePassportCommandsUser("/commander")
	const { setSidebarOpen } = useSidebarState()
	const { fingerprint } = useFingerprint()
	const { setSessionID, user, loading: authLoading } = useAuth()
	const { message, snackbarProps, alertSeverity, resetSnackbar } = useSnackbar()
	const [okCheck, setOkCheck] = useState<boolean | undefined>(undefined)
	const [loadingText, setLoadingText] = useState<string>()
	const searchParams = new URLSearchParams(window.location.search)
	const sessionID = searchParams.get("sessionID")
	const mobileScreen = useMediaQuery("(max-width:1024px)")

	// Fingerprinting
	useEffect(() => {
		if (!fingerprint) return
		;(async () => {
			await send(HubKey.UserFingerprint, {
				fingerprint,
			})
		})()
	}, [send, fingerprint])

	useEffect(() => {
		if (mobileScreen || window.location.pathname.includes("external")) {
			setSidebarOpen(false)
		} else {
			if (authLoading) {
				setSidebarOpen(false)
			} else {
				setSidebarOpen(true)
			}
		}
	}, [setSidebarOpen, mobileScreen, authLoading])

	useEffect(() => {
		if (sessionID) setSessionID(sessionID)
	}, [sessionID, setSessionID])

	useEffect(() => {
		if (authLoading) {
			setLoadingText("Loading...")
			return
		}
	}, [authLoading, setSidebarOpen])

	useEffect(() => {
		try {
			fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/check`)
				.then((res) => {
					if (res.status === 200) {
						setOkCheck(true)
					} else {
						setOkCheck(false)
					}
				})
				.catch(() => {
					setOkCheck(false)
				})
		} catch (error) {
			setOkCheck(false)
		}
	}, [])

	if (okCheck === false) {
		return (
			<>
				<Route path="/">
					<Maintenance />
					<ConnectionLostSnackbar app="public" />
					<BlockConfirmationSnackList />
				</Route>
				<Redirect to="/" />
			</>
		)
	}

	if (!user && authLoading) return <Loading text={loadingText} />

	return (
		<Box sx={{ height: "100%" }}>
			<BrowserRouter>
				<Snackbar
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					open={!!message}
					autoHideDuration={6000}
					onClose={(_, reason) => {
						if (reason === "clickaway") return
						resetSnackbar()
					}}
					{...snackbarProps}
				>
					<Alert severity={alertSeverity || "info"}>{message}</Alert>
				</Snackbar>

				<Switch>
					<Redirect from="/farms" to="/staking" exact />
					<Route path="/external/login">
						<LoginPage />
					</Route>
					<Sidebar onClose={() => setSidebarOpen(false)}>
						<Switch>
							<Route exact path="/">
								<LoginPage />
							</Route>
							<Route exact path="/login">
								<LoginPage />
							</Route>
							<Route path="/verify">
								<VerifyEmail />
							</Route>

							<Route path="/twitter-redirect">
								<TwitterRedirect />
							</Route>

							<Route path="/tfa/:username/setup">
								<TwoFactorAuthenticationSetup />
							</Route>

							<Route path="/tfa/:username/recovery-code">
								<TwoFactorAuthenticationRecoveryCode />
							</Route>

							<Route path="/signup">
								<SignUpPage />
							</Route>
							<Route path="/onboarding">
								<PassportReady />
							</Route>
							<Route path="/privacy-policy">
								<Home />
							</Route>
							<Route path="/terms-and-conditions">
								<Home />
							</Route>
							<Route path="/transactions">
								<TransactionsPage />
							</Route>
							<Route path="/staking">
								<FarmsPage />
							</Route>
							<Route path="/withdraw">
								<WithdrawPage />
							</Route>
							<Route path="/deposit/history">
								<DepositHistoryPage />
							</Route>
							<Route path="/deposit">
								<DepositPage />
							</Route>
							<Route path="/buy">
								<BuyPage />
							</Route>
							<Route path="/external/buy">
								<IFrameBuyPage />
							</Route>
							<Route path="/transact/supremacy-world/:amount/:claim_id">
								<IFrameTransactionPage />
							</Route>
							<Route path="/deposit-assets/:collection_slug">
								<ContractAssetPage />
							</Route>
							<Route path="/deposit-assets">
								<DepositAssetsPage />
							</Route>
							{/* User-authenticated routes */}
							{/* profile */}
							<Route path={"/profile/:username?"}>
								<ProfilePage />
							</Route>
							<Route path="/asset/:asset_hash">
								<AssetRedirectPage />
							</Route>
							<Route path="/store">
								<StorePage />
							</Route>
							<Redirect to="/profile" />
						</Switch>
					</Sidebar>
				</Switch>
			</BrowserRouter>
			<ConnectionLostSnackbar app="public" />
			<BlockConfirmationSnackList />
			{user && account && <CorrectWalletConnected />}
		</Box>
	)
}
