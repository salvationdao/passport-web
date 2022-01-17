import { Box, BoxProps, keyframes, useTheme } from '@mui/material';
import React from 'react';

interface GradientCircleThingProps extends BoxProps {

}

export const GradientCircleThing: React.FC<GradientCircleThingProps> = ({ sx, ...props }) => {
    const theme = useTheme()

    return (
        <Box
            sx={({
                overflow: "hidden",
                height: "70vw",
                width: "70vw",
                borderRadius: "50%",
                border: `2px solid ${theme.palette.secondary.main}`,
                ...sx
            })}
            {...props}
        >
            {/* <Box sx={(theme) => ({
                zIndex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.palette.background.default,
                opacity: .8
            })} /> */}
            <Box sx={{
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
            }} />
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
