import React from "react"
import { Route } from "react-router-dom"
import { LoginPage } from "./login"
import { Onboarding } from "./onboarding"

export interface LoginRoutesProps {}

export const LoginRoutes: React.FC<LoginRoutesProps> = ({}) => {
	return (
		<>
			<Route path="/login" component={LoginPage} />
			<Route exact path="/onboarding" component={Onboarding} />
		</>
	)
}
