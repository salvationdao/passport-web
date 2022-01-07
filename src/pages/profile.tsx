import YouTubeIcon from '@mui/icons-material/YouTube';
import { Avatar, Box, BoxProps, Button, IconButton, Link, Typography } from "@mui/material";
import { useState } from 'react';
import FacebookLogo from "../assets/images/icons/facebook.svg";
import { Navbar } from "../components/home/navbar";

export const ProfilePage: React.FC = () => {
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar />
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0 3rem",
                height: "100%",
            }}>
                <Box sx={{
                    position: "relative",
                    width: "fit-content",
                    marginBottom: "3rem",
                }}>
                    <Box sx={(theme) => ({
                        zIndex: -1,
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        display: "block",
                        width: "100%",
                        height: '100%',
                        borderRadius: "50%",
                        border: `2px solid ${theme.palette.secondary.main}`,
                    })} />
                    <Avatar sx={{
                        width: "8rem",
                        height: "8rem",
                    }} alt="Avatar Image" /></Box>
                <Typography variant="h2" component="h1" sx={{
                    marginBottom: "2rem"
                }}>Ash Thomas</Typography>
                <Typography variant="h2" sx={(theme) => ({
                    marginBottom: "2rem",
                    color: theme.palette.primary.main,
                    textTransform: "uppercase"
                })}>
                    Connected Apps
                </Typography>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "4rem",
                    width: "100%",
                    maxWidth: "1000px",
                    marginBottom: "2rem",
                    "@media (max-width: 800px)": {
                        gap: "2rem"
                    },
                    "@media (max-width: 600px)": {
                        gridTemplateColumns: "repeat(2, 1fr)"
                    },
                }}>
                    <ConnectedAppCard />
                    <ConnectedAppCard />
                    <ConnectedAppCard />
                </Box>
            </Box>
            <Box sx={{
                flex: 1
            }} />
            <Box sx={{
                display: "flex",
                alignItems: "center",
                margin: "0 auto",
                marginBottom: "1rem",
                "& > *:not(:last-child)": {
                    marginRight: "1rem",
                }
            }}><Typography>Connect these apps</Typography>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
            </Box>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto",
                padding: "0 3rem",
                paddingBottom: "1rem",
            }}>
                <Link href="/privacy-policy" underline="none" color="white">Privacy Policy</Link>
                <Link href="/terms-and-conditions" underline="none" color="white">Terms And Conditions</Link>
            </Box>
        </Box>
    )
}

interface ConnectedAppCardProps extends BoxProps {

}

const ConnectedAppCard: React.FC = () => {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <Box sx={(theme) => ({
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            border: `2px solid ${theme.palette.secondary.main}`,
            cursor: "pointer"
        })}>
            <Box
                onClick={() => setIsFocused(!isFocused)}
                onMouseLeave={() => setIsFocused(false)}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isFocused ? 1 : 0,
                    backgroundColor: "rgba(0, 0, 0, .8)",
                    transition: "opacity .3s ease-in",
                    "&:hover": {
                        opacity: 1
                    },
                }}>
                <Button onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                    Manage
                </Button>
            </Box>
            <Box component="img" src={FacebookLogo} alt="Facebook Logo" sx={{
                width: "5rem",
                marginBottom: "1rem",
            }} />
            Ash Aaron Thomas
        </Box>
    )
}