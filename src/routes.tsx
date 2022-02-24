import { Alert, Snackbar } from "@mui/material"
import { useEffect } from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { BlockConfirmationSnackList } from "./components/blockConfirmationSnackList"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
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
import { LootBoxPage } from "./pages/store/lootBox"
import { StorePage } from "./pages/store/store"
import { StoreItemPage } from "./pages/store/storeItem"
import { StoresPage } from "./pages/store/stores"
import { WithdrawPage } from "./pages/withdraw"

export const Routes = () => {
	const { setSessionID } = useAuth()
	const { setSidebarOpen } = useSidebarState()
	const { message, snackbarProps, alertSeverity, resetSnackbar } = useSnackbar()
	const searchParams = new URLSearchParams(window.location.search)
	const sessionID = searchParams.get("sessionID")

	/* Get subdomain name  */
	// const parts = window.location.hostname.split(".")
	// const sndleveldomain = parts.slice(-2).join(".")
	useEffect(() => {
		if (sessionID) setSessionID(sessionID)
	}, [sessionID, setSessionID])

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
				</Snackbar>{" "}
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
							<Home />
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
						<Route path="/withdraw">
							<WithdrawPage />
						</Route>

						{/* User-authenticated routes */}
						{/* profile */}
						<Switch>
							<Route path="/profile/:username/asset/:token_id">
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

						<Route path="/buy">
							<BuyPage />
						</Route>
						<Route path="/if-buy">
							<IFrameBuyPage />
						</Route>

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

						<Route path="/mystery">
							<LootBoxPage />
						</Route>

						{/* Supremacy */}
						<Switch>
							<Route path="/battle_arena">
								<BattleArenaPage />
							</Route>
						</Switch>

						{/* collections */}
						<Switch>
							<Route path="/collections/:username/:collection_slug">
								<CollectionPage />
							</Route>
							<Route path={["/collections/:username", "/collections"]}>
								<CollectionsPage />
							</Route>
						</Switch>

						<Route path="/asset/:token_id">
							<AssetRedirectPage />
						</Route>
					</Sidebar>
				</Switch>
			</BrowserRouter>
			<ConnectionLostSnackbar app="public" />
			<BlockConfirmationSnackList />
		</>
	)
}
