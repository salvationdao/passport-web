import { Box, styled, useMediaQuery } from "@mui/material"
import React, { useRef, useEffect, useState } from "react"
import { useContainer } from "unstated-next"
import { AppState } from "../../containers/supremacy/app"
import { colors } from "../../theme"

const Container = styled(Box)({
	position: "fixed",
	zIndex: -1,
	left: "0",
	top: "0",
	width: "100%",
	height: "100%",
	pointerEvents: "none",
	border: "none",
	"& video": {
		height: "100%",
		width: "100%",
		pointerEvents: "none",
		border: "none",
		objectFit: "cover",
		"&::-webkit-media-controls": {
			display: "none !important",
			opacity: 0,
		},

		"&::-webkit-media-controls-start-playback-button": {
			display: "none!important",
			WebkitAppearance: "none",
		},
	},
})

interface IBackgroundVideo {
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
}
export const BackgroundVideo: React.FC<IBackgroundVideo> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null!)
	const { setLoading, loading } = props
	const largeDesktop = useMediaQuery("(min-width:2000px)")
	const mobileScreen = useMediaQuery("(max-width:600px)")

	const fallBackPlayVideo = () => {
		if (loading) setLoading(false)
		if (videoRef.current.played.length === 0) {
			videoRef.current.play()
		}
	}

	useEffect(() => {
		// Fix  video not playing for iphones low-power mode
		window.document.body.addEventListener("touchstart", () => {
			// IF video is not already playing
			if (videoRef.current && videoRef.current.played.length === 0) {
				videoRef.current.play()
			}
		})

		// Fallback
		const fallback = setTimeout(fallBackPlayVideo, 5000)

		return () => {
			clearTimeout(fallback)
		}
	}, [])

	useEffect(() => {
		videoRef.current.addEventListener(
			"loadeddata",
			() => {
				setLoading(false)
				if (videoRef.current) videoRef.current.play()
			},
			false,
		)
		videoRef.current.addEventListener("play", () => {
			setLoading(false)
		})

		window.document.getElementById("bgVideo")?.addEventListener("play", () => {
			setLoading(false)
		})
	}, [videoRef, setLoading])

	return (
		<Container
			sx={{
				background: colors.black,
				"& video": {
					pointerEvents: "none",
					visibility: loading ? "hidden" : "unset",
				},
			}}
		>
			<video
				id="bgVideo"
				disablePictureInPicture
				disableRemotePlayback
				ref={videoRef}
				playsInline
				controlsList="nodownload"
				controls={false}
				muted
				loop
				autoPlay
				onPlay={() => {
					setLoading(false)
				}}
				src={
					largeDesktop
						? "https://player.vimeo.com/progressive_redirect/playback/674309643/rendition/1080p?loc=external&signature=ff7173eead0d0940ee7926f5266c01d7050272ba06c2bd22cd07f90ce880bae6"
						: mobileScreen
						? "https://player.vimeo.com/progressive_redirect/playback/674309643/rendition/540p?loc=external&signature=f4fb36d586701bcf93a71c0fb05a337f762b6923d0e6539d6b652d87524d1dd3"
						: "https://player.vimeo.com/progressive_redirect/playback/674309643/rendition/720p?loc=external&signature=b82cba63d8b454387df6ab44bee515ada9a4d062f9497ba0dc55b63713b66fdd"
				}
			/>
		</Container>
	)
}
