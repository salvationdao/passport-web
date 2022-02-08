import { Attribute } from "../types/types"
import BigNumber from "bignumber.js"


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
	const arr = attributes.filter((a) => a.trait_type === traitToGet)
	if (arr[0]) {
		return arr[0].value as string
	}
	return "Unknown"
}

export const supFormatter = (num: string): string => {
	const supTokens = new BigNumber(num)
	if (supTokens.isZero()) return supTokens.toFixed()
	return supTokens.shiftedBy(-18).toFormat()
}
