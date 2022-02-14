import { Alert, Snackbar } from "@mui/material"
import { useEffect } from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { Sidebar } from "./components/sidebar"
import { useAuth } from "./containers/auth"
import { useSidebarState } from "./containers/sidebar"
import { useSnackbar } from "./containers/snackbar"
import { LoginPage } from "./pages/auth/login"
import { PassportReady } from "./pages/auth/onboarding"
import { SignUpPage } from "./pages/auth/signup"
import { Home } from "./pages/home"
import { AssetsList } from "./pages/management/assets/list"
import { CollectionPage } from "./pages/management/collections/collection"
import { CollectionItemPage } from "./pages/management/collections/collectionItem"
import { CollectionsPage } from "./pages/management/collections/collections"
import { ProfilePage } from "./pages/profile"
import { StorePage } from "./pages/store/store"
import { StoreItemPage } from "./pages/store/storeItem"
import { StoresPage } from "./pages/store/stores"

export const Routes = () => {
	const { setSessionID } = useAuth()
	const { setSidebarOpen } = useSidebarState()
	const { message, snackbarProps, alertSeverity, resetSnackbar } = useSnackbar()
	const searchParams = new URLSearchParams(window.location.search)
	const sessionID = searchParams.get("sessionID")

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
				</Snackbar>
				<Switch>
					<Route path="/nosidebar/login">
						<LoginPage />
					</Route>
					<Route path="/nosidebar/:username/collections/:collection_name">
						<AssetsList />
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

						{/* User-authenticated routes */}
						{/* profile */}
						<Route path="/profile">
							<ProfilePage />
						</Route>

						{/* stores */}
						<Switch>
							<Route path="/stores/:store_id/:store_item_id">
								<StoreItemPage />
							</Route>
							<Route path="/stores/:collection_name">
								<StorePage />
							</Route>
							<Route path="/stores">
								<StoresPage />
							</Route>
						</Switch>

						{/* collections */}
						<Switch>
							<Route path="/collections/:username/:collection_name/:token_id">
								<CollectionItemPage />
							</Route>
							<Route path="/collections/:username/:collection_name">
								<CollectionPage />
							</Route>
							<Route path={["/collections/:username", "/collections"]}>
								<CollectionsPage />
							</Route>
						</Switch>
					</Sidebar>
				</Switch>
			</BrowserRouter>
			<ConnectionLostSnackbar app="admin" />
		</>
	)
}
