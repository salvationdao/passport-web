import BigNumber from "bignumber.js"
import { colors } from "../theme"
import { Rarity } from "../types/enums"

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

export const supFormatter = (num: string): string => {
	const supTokens = new BigNumber(num)
	if (supTokens.isZero()) return supTokens.toFixed(2)
	return supTokens.shiftedBy(-18).toFormat(2)
}

export const usdFormatter = (centCost: number): string => {
	// Create our number formatter.
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		// These options are needed to round to whole numbers if that's what you want.
		//minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
		//maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
	})

	return formatter.format(centCost / 100)
}

export const rarityTextStyles: { [key in Rarity]: any } = {
	MEGA: {
		color: colors.rarity.MEGA,
	},
	COLOSSAL: {
		color: colors.rarity.COLOSSAL,
	},
	RARE: {
		color: colors.rarity.RARE,
	},
	LEGENDARY: {
		color: colors.rarity.LEGENDARY,
	},
	ELITE_LEGENDARY: {
		color: colors.rarity.ELITE_LEGENDARY,
	},
	ULTRA_RARE: {
		color: colors.rarity.ULTRA_RARE,
	},
	EXOTIC: {
		color: colors.rarity.EXOTIC,
	},
	GUARDIAN: {
		color: colors.rarity.GUARDIAN,
	},
	MYTHIC: {
		color: colors.rarity.MYTHIC,
		textShadow: `0 0 2px ${colors.rarity.MYTHIC}`,
	},
	DEUS_EX: {
		color: colors.rarity.DEUS_EX,
		textShadow: `0 0 2px ${colors.rarity.DEUS_EX}`,
	},
	TITAN: {
		color: colors.rarity.TITAN,
		textShadow: `0 0 2px ${colors.rarity.TITAN}`,
	},
}
