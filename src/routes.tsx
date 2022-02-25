import { Alert, Snackbar } from "@mui/material"
import { useEffect, useState } from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { BlockConfirmationSnackList } from "./components/blockConfirmationSnackList"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { Loading } from "./components/loading"
import { Sidebar } from "./components/sidebar"
import { useAuth } from "./containers/auth"
import { useSidebarState } from "./containers/sidebar"
import { useSnackbar } from "./containers/snackbar"
import { AssetRedirectPage } from "./pages/assetRedirect"
import { LoginPage } from "./pages/auth/login"
import { LogoutPage } from "./pages/auth/logout"
import { PassportReady } from "./pages/auth/onboarding"
import { SignUpPage } from "./pages/auth/signup"
import { BattleArenaPage } from "./pages/battle_arena/battle_arena"
import { BuyPage } from "./pages/buy"
import { CollectionPage } from "./pages/collections/collection"
import { CollectionsPage } from "./pages/collections/collections"
import { Home } from "./pages/home"
import { IFrameBuyPage } from "./pages/iFrameBuy"
import { ProfilePage } from "./pages/profile/profile"
import { ProfileEditPage } from "./pages/profile/profileEdit"
import { SalePage } from "./pages/sale/salePage"
import { LootBoxPage } from "./pages/store/lootBox"
import { StorePage } from "./pages/store/store"
import { StoreItemPage } from "./pages/store/storeItem"
import { StoresPage } from "./pages/store/stores"
import { TransactionsPage } from "./pages/transactions/transactions"
import { WithdrawPage } from "./pages/withdraw"

export const Routes = () => {
	const { setSessionID, user, loading: authLoading } = useAuth()
	const { setSidebarOpen } = useSidebarState()
	const { message, snackbarProps, alertSeverity, resetSnackbar } = useSnackbar()
	const [loadingText, setLoadingText] = useState<string>()
	const searchParams = new URLSearchParams(window.location.search)
	const sessionID = searchParams.get("sessionID")

	/* Get subdomain name  */
	// const parts = window.location.hostname.split(".")
	// const sndleveldomain = parts.slice(-2).join(".")
	useEffect(() => {
		if (sessionID) setSessionID(sessionID)
	}, [sessionID, setSessionID])
	useEffect(() => {
		if (authLoading) {
			setLoadingText("Loading...")
			return
		}
	})
	if (!user && authLoading) {
		return <Loading text={loadingText} />
	}
	return (
		<>
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
				{user ? (
					<Switch>
						<Route path="/nosidebar/login">
							<LoginPage />
						</Route>
						<Route path="/nosidebar/:username/:collection_slug">
							<CollectionPage />
						</Route>
						<Route path="/nosidebar/logout">
							<LogoutPage />
						</Route>
						<Sidebar onClose={() => setSidebarOpen(false)}>
							<Route exact path="/">
								<LoginPage />
							</Route>
							<Route exact path="/login">
								<LoginPage />
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
							<Route path="/withdraw">
								<WithdrawPage />
							</Route>
							<Route path="/mystery">
								<LootBoxPage />
							</Route>

							{/* Supremacy */}
							<Switch>
								<Route path="/battle_arena">
									<BattleArenaPage />
								</Route>
							</Switch>

							<Route path="/buy">
								<BuyPage />
							</Route>
							<Route path="/if-buy">
								<IFrameBuyPage />
							</Route>

							{/* User-authenticated routes */}
							{/* profile */}
							<Switch>
								<Route path="/profile/:username/asset/:asset_hash">
									<ProfilePage />
								</Route>
								<Route path="/profile/:username/edit">
									<ProfileEditPage />
								</Route>
								<Route path="/profile/:username">
									<ProfilePage />
								</Route>
								<Route path="/profile">
									<ProfilePage />
								</Route>
							</Switch>

							{/* stores */}
							<Switch>
								<Route path="/stores/:collection_slug/:store_item_id">
									<StoreItemPage />
								</Route>
								<Route path="/stores/:collection_slug">
									<StorePage />
								</Route>
								<Route path="/stores">
									<StoresPage />
								</Route>
							</Switch>

							{/* Supremacy */}
							<Switch>
								<Route path="/battle_arena">
									<BattleArenaPage />
								</Route>
							</Switch>

							{/* collections */}
							<Switch>
								<Route path={"/collections/:username"}>
									<CollectionPage />
								</Route>
							</Switch>

							<Route path="/asset/:asset_hash">
								<AssetRedirectPage />
							</Route>
						</Sidebar>
					</Switch>
				) : (
					<LoginPage />
				)}

				<Route path="/sale-sup">
					<SalePage />
				</Route>
			</BrowserRouter>
			<ConnectionLostSnackbar app="public" />
			<BlockConfirmationSnackList />
		</>
	)
}
