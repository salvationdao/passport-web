import { useEffect } from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { useAuth } from "./containers/auth"
import { PassportReady } from "./pages/auth/onboarding"
import { SignUpPage } from "./pages/auth/signup"
import { Home } from "./pages/home"
import { AssetsList } from "./pages/management/assets/list"
import { CollectionsPage } from "./pages/management/collections/collections"
import { ProfilePage } from "./pages/profile"
import { Settings } from "./pages/settings"
import { ViewPage } from "./pages/viewPages"
import { StorePage } from "./pages/store/store"
import { LoginPage } from "./pages/auth/login"
import { useSidebarState } from "./containers/sidebar"
import { Sidebar } from "./components/sidebar"

export const Routes = () => {
	const { setSessionID, user } = useAuth()
	const { sidebarOpen, setSidebarOpen } = useSidebarState()

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search)
		const sessionID = searchParams.get("sessionID")
		if (sessionID) setSessionID(sessionID)
	}, [setSessionID])

	return (
		<>
			<BrowserRouter>
				<Sidebar onClose={() => setSidebarOpen(false)}>
					<Switch>
						<Route exact path="/">
							<Home />
						</Route>
						<Route path="/login">
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

						{/* store */}
						<Route path="/store/:id">
							<ViewPage.StoreItem />
						</Route>
						<Route path="/store">
							<StorePage />
						</Route>

						{user && (
							<Switch>
								<Route path="/profile">
									<ProfilePage />
								</Route>
								{/* users collections  */}
								<Route path="/:username/collections/:collection_name">
									<AssetsList />
								</Route>
								<Route path="/:username/collections">
									<CollectionsPage />
								</Route>
								{/* asset view page */}
								<Route path="/collections/assets/:tokenID">
									<ViewPage.Asset />
								</Route>
								<Route path="/settings">
									<Settings />
								</Route>
							</Switch>
						)}
					</Switch>
				</Sidebar>
			</BrowserRouter>
			<ConnectionLostSnackbar app="admin" />
		</>
	)
}
