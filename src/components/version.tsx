import { Box } from "@mui/material"
import preval from "preval.macro"
// import * as packageInfo from '../../package.json'
// import { version } from "../../package.json"

const buildTimeISO = preval`module.exports = new Date().toISOString()`

/**
 * Display Current Version and Build Time
 */
export const VersionText = () => {
	return (
		<Box
			sx={{
				marginTop: "2rem",
				opacity: 0.5,
				position: "absolute",
				right: "6px",
				bottom: "10px",
				color: "white",
				textAlign: "right",
				lineHeight: "14px",
			}}
		>
			v{process.env.REACT_APP_VERSION}
			<br />
			<Box sx={{ color: "grey.300" }}>{buildTimeISO}</Box>
		</Box>
	)
}
