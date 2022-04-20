import * as React from "react"
import { useCallback } from "react"
import {
	AddServiceRequest,
	AddServiceResponse,
	PasswordLoginResponse,
	RegisterResponse,
	RemoveServiceRequest,
	RemoveServiceResponse,
	SocialProps,
} from "../../types/auth"
import HubKey from "../../keys"
import { Action, QueryResponse, useMutation } from "react-fetching-library"

const connectionAction =
	(direction: string) =>
	(formValues: { service: string; id: string; username: string } | { token: string; service: string }): Action => ({
		method: "POST",
		endpoint: `/auth/socials/${direction}`,
		responseType: "json",
		body: formValues,
	})

const useSocialConnect = ({ setUser, setToken, fingerprint, login, signup, clear, setAuthorised, sessionId }: SocialProps) => {
	const { loading: connLoading, mutate: connect, error: connError } = useMutation(connectionAction("connect"))
	const { loading: disconnLoading, mutate: disconnect, error: disconnError } = useMutation(connectionAction("discconnect"))

	const signUpSocial = useCallback(
		async (service: string, token: string, username: string) => {
			try {
				const resp: QueryResponse<RegisterResponse> = await signup({
					token,
					username,
					session_id: sessionId,
					service,
					fingerprint,
				})

				if (!resp || !resp.payload || !resp.payload.user) {
					clear()
					return
				}
				setUser(resp.payload.user)
				setToken(resp.payload.token)

				setUser(resp.payload.user)
				setToken(resp.payload.token)
				localStorage.setItem("auth-token", resp.payload.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Issue signing up with Social, try again or contact support."
			}
			return
		},
		[signup, sessionId, fingerprint],
	)

	/**
	 * Logs a User in using a Social oauth token
	 *
	 * @param token Social token id
	 */
	const loginSocial = useCallback(
		async (service: string, token: string) => {
			try {
				const resp: QueryResponse<PasswordLoginResponse> = await login({
					token: token,
					session_id: sessionId,
					service,
					fingerprint,
				})
				if (!resp || !resp.payload || !resp.payload.user || !resp.payload.token) {
					clear()
					return
				}
				setUser(resp.payload.user)
				setToken(resp.payload.token)
				localStorage.setItem("auth-token", resp.payload.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Issue logging in with Social, try again or contact support."
			}
		},
		[login, sessionId, fingerprint],
	)

	const connectSocial = useCallback(
		async (service: string, id: string, username: string) => {
			try {
				const resp: QueryResponse<AddServiceResponse> = await connect({
					service,
					id,
					username,
				})
				if (!resp || !resp.payload || !resp.payload.user) {
					return
				}
				setUser(resp.payload.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Issue removing account, try again or contact support."
			}
			return
		},
		[connect],
	)

	/**
	 * Connects a User's existing account to Social
	 */
	const disconnectSocial = useCallback(
		async (service: string, token: string) => {
			try {
				const resp: QueryResponse<RemoveServiceResponse> = await connect({
					token,
					service,
				})
				if (!resp || !resp.payload || !resp.payload.user) {
					return
				}
				setUser(resp.payload.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Issue adding account, try again or contact support."
			}
			return
		},
		[disconnect],
	)

	return { connectSocial, disconnectSocial, signUpSocial, loginSocial }
}
