export const AddressDisplay = (addr: string) => {
	return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4, addr.length)}`
}

export const metamaskErrorHandling = (error: any): string => {
	if (typeof error === "object") {
		const errObj = error as object
		if (errObj.hasOwnProperty("data")) {
			return error.data.message as string
		}
		if (errObj.hasOwnProperty("message") && errObj.hasOwnProperty("code")) {
			return error.message as string
		}
	}

	return error as string
}
