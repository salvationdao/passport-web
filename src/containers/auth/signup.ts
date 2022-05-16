import { useCallback, useState } from "react"
import { Action, QueryResponse, useMutation } from "react-fetching-library"
import { PasswordLoginResponse, RegisterResponse, WalletSignUpRequest } from "../../types/auth"
import { useFingerprint } from "../fingerprint"
import { useWeb3 } from "../web3"

const signUpAction =
	(signupType: string) =>
	(formValues: WalletSignUpRequest): Action<PasswordLoginResponse> => ({
		method: "POST",
		endpoint: `/auth/signup/${signupType}`,
		responseType: "json",
		body: formValues,
	})

const useSignup = () => {
	/**
	 * Signs a user up using a Metamask public address
	 */
	const { fingerprint } = useFingerprint()
	const { metaMaskState, account } = useWeb3()

	const [signupType, setSignupType] = useState<string>("wallet")
	const { mutate: signup } = useMutation(signUpAction(signupType))

	const signUpMetamask = useCallback(
		async (username: string): Promise<string | undefined> => {
			try {
				if (!account) return
				const resp: QueryResponse<RegisterResponse> = await signup({
					public_address: account,
					username,
					fingerprint,
				})
				if (!resp || !resp.payload || !resp.payload.token) {
					throw new Error("incorrect response")
				}
			} catch (e) {
				throw typeof e === "string" ? e : "Issue signing up with Metamask, try again or contact support."
			}
			return undefined
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[signup, account, metaMaskState, fingerprint],
	)

	return { signUpMetamask, setSignupType, signupType }
}

export default useSignup
