import { Button, ButtonProps, useTheme } from "@mui/material";

interface FancyButtonProps extends ButtonProps {
    fancy?: boolean
    borderColor?: string
}

export const FancyButton: React.FC<FancyButtonProps> = ({ fancy, borderColor, sx, children, ...props }) => {
    const theme = useTheme()

    return (
        <Button sx={{
            boxSizing: "content-box",
            position: "relative",
            padding: ".5rem 3rem",
            borderRadius: 0,
            border: `2px solid ${borderColor || theme.palette.primary.main}`,
            textTransform: "uppercase",
            "&:hover": {
                "&::before": {
                    opacity: .4,
                },
                "&::after": {
                    opacity: .2,
                    transitionDelay: ".1s",
                },
            },
            "&::before": fancy ? {
                content: "''",
                position: "absolute",
                top: "4px",
                left: "4px",
                width: "100%",
                height: "100%",
                border: `2px solid ${borderColor || theme.palette.primary.main}`,
                opacity: 0,
                transition: "opacity .3s ease-in",
                pointerEvents: "none",
            } : null,
            "&::after": fancy ? {
                content: "''",
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "100%",
                height: "100%",
                border: `2px solid ${borderColor || theme.palette.primary.main}`,
                opacity: 0,
                transition: "opacity .3s ease-in",
                pointerEvents: "none",
            } : null,
            ...sx,
        }}
            {...props}
        >{children}</Button>
    )
}