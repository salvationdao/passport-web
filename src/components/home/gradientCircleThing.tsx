import { Box, BoxProps, keyframes, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

export type PhaseTypes = "small" | "big" | "default" | "disappear"

interface GradientCircleThingProps extends BoxProps {
    innerOpacity?: number
    hideInner?: boolean
    // For animation purposes
    phase?: PhaseTypes
    playDisappear?: boolean
}

export const GradientCircleThing: React.FC<GradientCircleThingProps> = ({ innerOpacity, hideInner, phase, playDisappear, sx, ...props }) => {
    const theme = useTheme()
    const [animationStyles, setAnimationStyles] = useState({
        height: "70vw",
        width: "70vw",
        opacity: 1
    })

    useEffect(() => {
        switch (phase) {
            case "small":
                setAnimationStyles((prev) => ({
                    ...prev,
                    height: "45vw",
                    width: "45vw",
                    opacity: 1
                }))
                break
            case "big":
                setAnimationStyles((prev) => ({
                    ...prev,
                    height: "80vw",
                    width: "80vw",
                    opacity: 1
                }))
                break
            case 'disappear':
                setAnimationStyles((prev) => ({
                    ...prev,
                    opacity: 0
                }))
                break
            case "default":
            default:
                setAnimationStyles({
                    height: "70vw",
                    width: "70vw",
                    opacity: 1,
                })
        }
    }, [sx, phase])

    return (
        <Box
            sx={({
                overflow: "hidden",
                borderRadius: "50%",
                border: `2px solid ${theme.palette.secondary.main}`,
                transition: "height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
                ...animationStyles,
                ...sx,
            })}
            {...props}
        >
            {!!innerOpacity && <Box sx={(theme) => ({
                zIndex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.palette.background.default,
                opacity: innerOpacity,
            })} />}
            {!hideInner && <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                height: "60%",
                width: "60%",
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "linear-gradient(300deg,#5072d9 5%,#8020ec,#d957cc,#449deb)",
                backgroundSize: "130% 130%",
                animation: `${gradientAnimation} 16s ease infinite`
            }} />}
        </Box>
    );
}

const gradientAnimation = keyframes`
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`
