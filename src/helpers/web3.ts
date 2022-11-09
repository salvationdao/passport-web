export const AddressDisplay = (addr: string) => {
	return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4, addr.length)}`
}

//checks metamask signature and returns a descriptive error string
export const metamaskErrorHandling = (error: any): string => {
	if (typeof error === "object") {
		const errObj = error
		// eslint-disable-next-line no-prototype-builtins
		if (errObj.hasOwnProperty("message")) {
			//checks if the error is a super long error and returns a falsy value so a more descriptive and custom error message can be displayed
			// eslint-disable-next-line no-prototype-builtins
			if (errObj.hasOwnProperty("code")) {
				if (typeof error.code !== "number") return ""
			}
			return error.message as string
		}
		// eslint-disable-next-line no-prototype-builtins
		if (errObj.hasOwnProperty("data")) {
			return error.data.message as string
		}
	}

	return error as string
}
