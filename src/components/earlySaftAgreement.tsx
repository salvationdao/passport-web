import { styled, Typography } from "@mui/material"
import { Box, useTheme } from "@mui/system"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { SAFT_AGREEMENT_PDF } from "../config"
import { colors } from "../theme"
import { FancyButton } from "./fancyButton"

interface EarlySaftAgreementProps {
	setReadAgreement: React.Dispatch<React.SetStateAction<boolean>>
}

export const EarlySaftAgreement = ({ setReadAgreement }: EarlySaftAgreementProps) => {
	return (
		<>
			<Typography variant="h3">Early Contributor SAFT Agreement</Typography>
			<Box
				sx={{
					height: "50em",
					width: "100%",
					maxHeight: "100em",
				}}
			>
				<SaftAgreementPDF src={`${SAFT_AGREEMENT_PDF}#toolbar=0&navpanes=0&scrollbar=0`} frameBorder="0"></SaftAgreementPDF>
			</Box>
			<FancyButton
				onClick={() => {
					setReadAgreement(true)
				}}
			>
				I've read the above agreement
			</FancyButton>
		</>
	)
}

const SaftAgreementPDF = styled("iframe")(() => ({
	height: "100%",
	width: "100%",
	maxWidth: "50em",
	overflowX: "hidden",
	scrollbarWidth: "none",
	"::-webkit-scrollbar": {
		width: 4,
	},
	"::-webkit-scrollbar-track": {
		boxShadow: `inset 0 0 5px ${colors.darkNavyBackground}`,
		borderRadius: 3,
	},
	"::-webkit-scrollbar-thumb": {
		background: colors.darkNeonBlue,
		borderRadius: 3,
	},
}))
