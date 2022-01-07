import { Dashboard, Settings } from "@mui/icons-material"
import { Box } from "@mui/material"
import { Route, Switch } from "react-router-dom"
import { Loading } from "../components/loading"
import { SideBar, SideBarRoute } from "../components/sidebar"
import { TopBar } from "../components/topbar"
import { TwoFactorAuthenticationRecoveryCode } from "../components/twoFactorAuthentication/recoveryCode"
import { TwoFactorAuthenticationSetup } from "../components/twoFactorAuthentication/setup"
import { TwoFactorAuthenticationVerification } from "../components/twoFactorAuthentication/verification"
import { AuthContainer } from "../containers/auth"
import { SidebarStateProvider } from "../containers/sidebar"
import { Perm } from "../types/enums"
import { Home } from "./home"
import { ListPage } from "./listPages"
import { VerificationComplete } from "./verificationComplete"
import { ViewPage } from "./viewPages"

export const SideBarRoutes: SideBarRoute[] = [
	{
		icon: "chart-pie-alt",
		label: "Dashboard",
		url: "/",
		exact: true,
	},
	{
		icon: "books",
		label: "Products",
		url: "/products",
		perm: Perm.ProductList,
	},
	{
		icon: "building",
		label: "Organisations",
		url: "/organisations",
		perm: Perm.OrganisationList,
	},
	{
		icon: "users",
		label: "Users",
		url: "/users",
		perm: Perm.UserList,
	},
	{
		icon: "user-tag",
		label: "Roles",
		url: "/roles",
		perm: Perm.RoleList,
	},
	{
		icon: "user-chart",
		label: "User Activity",
		url: "/user-activity",
		perm: Perm.UserActivityList,
	},
]

const PortalInner = () => {
	const { user, loading, hasPermission, verifyCompleteType } = AuthContainer.useContainer()

	if (!user) {
		if (loading) {
			return <Loading />
		}
		return <Home />
	}

	// 2FA
	if (user.twoFactorAuthenticationActivated) {
		// if 2fa is not setup
		if (!user.twoFactorAuthenticationIsSet) return <TwoFactorAuthenticationSetup />

		// if 2fa not passed
		if (!user.pass2FA) return <TwoFactorAuthenticationVerification />

		// if does not have 2fa recovery code
		if (!user.hasRecoveryCode) return <TwoFactorAuthenticationRecoveryCode />
	}

	return (
		<>
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
					maxHeight: "100vh",
					width: "100%",
					overflow: "hidden",
				}}
			>
				<SideBar routes={SideBarRoutes} admin />
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						maxHeight: "100%",
					}}
				>
					<TopBar />
					<Box
						sx={{
							flex: 1,
							maxHeight: "100%",
							overflow: "auto",
							padding: "0.5rem",
						}}
					>
						<Switch>
							<Route path="/settings" component={Settings} />

							{hasPermission(Perm.ProductRead) && <Route path={["/products/create", "/products/:slug"]} exact component={ViewPage.Product} />}
							{hasPermission(Perm.ProductList) && <Route path="/products" component={ListPage.Products} />}

							{hasPermission(Perm.RoleRead) && <Route path={["/roles/create", "/roles/:name"]} exact component={ViewPage.Role} />}
							{hasPermission(Perm.RoleList) && <Route path="/roles" component={ListPage.Roles} />}

							{hasPermission(Perm.OrganisationRead) && (
								<Route path={["/organisations/create", "/organisations/:slug"]} exact component={ViewPage.Organisation} />
							)}
							{hasPermission(Perm.OrganisationList) && <Route path="/organisations" component={ListPage.Organisations} />}

							{hasPermission(Perm.UserRead) && <Route path={["/users/create", "/users/:username"]} exact component={ViewPage.User} />}
							{hasPermission(Perm.UserList) && <Route path="/users" component={ListPage.Users} />}

							{hasPermission(Perm.UserActivityList) && <Route path={"/user-activity"} component={ListPage.UserActivity} />}

							<Route path="/" component={Dashboard} />
						</Switch>
					</Box>
				</Box>
			</Box>
			{verifyCompleteType !== undefined && <VerificationComplete />}
		</>
	)
}

export const Portal = () => {
	return (
		<SidebarStateProvider>
			<PortalInner />
		</SidebarStateProvider>
	)
}
