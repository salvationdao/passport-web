import BigNumber from "bignumber.js"
import { Attribute } from "../types/types"

const fmt = {
	prefix: "",
	decimalSeparator: ".",
	groupSeparator: ",",
	groupSize: 3,
	secondaryGroupSize: 0,
	fractionGroupSeparator: " ",
	fractionGroupSize: 0,
	suffix: "",
}

BigNumber.config({ FORMAT: fmt })

export const getItemAttributeValue = (attributes: Attribute[], traitToGet: string): string => {
	// get asset type from attributes array
	const arr = attributes.filter((a) => a.label === traitToGet)
	if (arr[0]) {
		return arr[0].value as string
	}
	return "Unknown"
}

export const supFormatter = (num: string): string => {
	const supTokens = new BigNumber(num)
	if (supTokens.isZero()) return supTokens.toFixed(2)
	return supTokens.shiftedBy(-18).toFormat(2)
}

export const usdFormatter = (centCost: number): string => {
	// Create our number formatter.
	var formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		// These options are needed to round to whole numbers if that's what you want.
		//minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
		//maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
	})

	return formatter.format(centCost / 100)
}
