import { Box, Button, Fade, styled } from "@mui/material"
import React, { useCallback, useEffect } from "react"

interface VideoProps {
	srcURL: string
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
	setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const LootboxVideo: React.FC<VideoProps> = ({ srcURL, setOpen, open, setDialogOpen }) => {
	const videoURL = {
		"98bf7bb3-1a7c-4f21-8843-458d62884060": "",
		"7c6dde21-b067-46cf-9e56-155c88a520e2": "",
		"880db344-e405-428d-84e5-6ebebab1fe6d": "",
	}

	useEffect(() => {
		const fallback = setTimeout(() => {
			if (open) {
				setDialogOpen(true)
				setOpen(false)
			}
		}, 10000)
		return clearTimeout(fallback)
	}, [open])

	return (
		<Fade in={open} appear={false} timeout={1000}>
			<Box sx={{ position: "absolute", height: "100%", zIndex: 99 }}>
				{open && (
					<>
						<Video
							disablePictureInPicture
							disableRemotePlayback
							playsInline
							controlsList="nodownload"
							controls={false}
							muted
							autoPlay
							onEnded={() => {
								setDialogOpen(true)
								setOpen(false)
							}}
						>
							<source src={srcURL} />
						</Video>
						<Box sx={{ position: "absolute", top: "95%", right: "5%" }}>
							<Button
								variant="outlined"
								color="primary"
								onClick={() => {
									setDialogOpen(true)
									setOpen(false)
								}}
							>
								Skip Video
							</Button>
						</Box>
					</>
				)}
			</Box>
		</Fade>
	)
}
export default LootboxVideo

const Video = styled("video")({
	" &::-internal-media-controls-overlay-cast-button": {
		display: "none",
	},
	height: "100%",
	width: "100%",
})
