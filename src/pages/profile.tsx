import YouTubeIcon from '@mui/icons-material/YouTube';
import { Avatar, Box, IconButton, Link, Typography } from "@mui/material";
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
                    color: theme.palette.primary.main
                })}>
                    Connected Apps
                </Typography>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "4rem",
                    width: "100%",
                    maxWidth: "1000px",
                }}>
                    <Box sx={(theme) => ({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "2rem",
                        border: `2px solid ${theme.palette.secondary.main}`
                    })}>
                        <Box component="img" src={FacebookLogo} alt="Facebook Logo" sx={{
                            width: "5rem",
                            marginBottom: "1rem",
                        }} />
                        Ash Aaron Thomas
                    </Box>
                    <Box sx={(theme) => ({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "2rem",
                        border: `2px solid ${theme.palette.secondary.main}`
                    })}>
                        <Box component="img" src={FacebookLogo} alt="Facebook Logo" sx={{
                            width: "5rem",
                            marginBottom: "1rem",
                        }} />
                        Ash Aaron Thomas
                    </Box>
                    <Box sx={(theme) => ({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "2rem",
                        border: `2px solid ${theme.palette.secondary.main}`
                    })}>
                        <Box component="img" src={FacebookLogo} alt="Facebook Logo" sx={{
                            width: "5rem",
                            marginBottom: "1rem",
                        }} />
                        Ash Aaron Thomas
                    </Box>
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
                marginBottom: "1rem",
            }}>
                <Link href="/privacy-policy" underline="none" color="white">Privacy Policy</Link>
                <Link href="/terms-and-conditions" underline="none" color="white">Terms And Conditions</Link>
            </Box>
        </Box>
    )
}