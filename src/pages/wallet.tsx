import { Box, BoxProps, ButtonProps, Paper, styled, Tab, TabProps, Tabs, Typography, useTheme } from "@mui/material"
import { useState } from "react"
import SupsLogo from "../assets/images/sup-token.svg"
import { FancyButton } from "../components/fancyButton"
import { Navbar } from "../components/home/navbar"
import { colors } from "../theme"

export const WalletPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0)
    const theme = useTheme()

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar />
            <Paper sx={{
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
                marginBottom: "2rem",
                padding: "2rem",
                borderRadius: 0
            }}>
                <Typography variant="h1" sx={{
                    marginBottom: "1rem",
                    textAlign: "center",
                    textTransform: "uppercase",
                }}>Wallet</Typography>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <Box>
                        <Box>
                            Account Name
                        </Box>
                        <Box>
                            0x3465ELJFNW3542345ER45754
                        </Box>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        alignItems: "center"
                    }}>
                        <Box component="img" src={SupsLogo} alt="SUPS Logo" sx={{
                            height: "2rem",
                            marginRight: "1rem"
                        }} />
                        <Box sx={{
                            textAlign: "center"
                        }}>
                            <Typography variant="h4" component="p" sx={(theme) => ({
                                color: theme.palette.primary.main
                            })}>120000</Typography>
                            <Typography>
                                SUPS Collected
                            </Typography>
                        </Box>
                    </Box>
                    <FancyButton fancy>Redeem Your SUPS</FancyButton>
                </Box>
            </Paper>
            <Paper sx={{
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
                borderRadius: 0,
                backgroundColor: "transparent",
            }}>
                <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)} aria-label="Balance and Transaction tabs" variant="fullWidth" TabIndicatorProps={{
                    hidden: true
                }}>
                    <StyledTab label="Balance" />
                    <StyledTab label="Transactions" />
                </Tabs>
                <StyledTabPanel value={currentTab} index={0}>
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        maxWidth: "600px"
                    }}>
                        <p>eth</p>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                        }}>
                            <BlueFancyButton sx={{
                                marginRight: "1rem",
                            }}>Buy</BlueFancyButton>
                            <BlueFancyButton>Send</BlueFancyButton>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        maxWidth: "600px"
                    }}>
                        <p>eth</p>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                        }}>
                            <BlueFancyButton sx={{
                                marginRight: "1rem",
                            }}>Buy</BlueFancyButton>
                            <BlueFancyButton>Send</BlueFancyButton>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        maxWidth: "600px"
                    }}>
                        <p>eth</p>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                        }}>
                            <BlueFancyButton sx={{
                                marginRight: "1rem",
                            }}>Buy</BlueFancyButton>
                            <BlueFancyButton>Send</BlueFancyButton>
                        </Box>
                    </Box>
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        maxWidth: "600px"
                    }}>
                        <p>eth</p>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                        }}>
                            <BlueFancyButton sx={{
                                marginRight: "1rem",
                            }}>Buy</BlueFancyButton>
                            <BlueFancyButton>Send</BlueFancyButton>
                        </Box>
                    </Box>
                </StyledTabPanel>
                <StyledTabPanel value={currentTab} index={1}>
                    vxcbxvcb
                </StyledTabPanel>
            </Paper>
        </Box>
    )
}

const BlueFancyButton = styled((props: ButtonProps) => <FancyButton borderColor={colors.skyBlue}
    {...props}
/>)({
    padding: ".2rem .5rem"
})

const StyledTab = styled((props: TabProps) => <Tab {...props} />)(({ theme }) => ({
    textTransform: "uppercase",
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    "&.Mui-selected": {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.secondary.main
    },
}))

const StyledTabPanel = styled((props: TabPanelProps) => <TabPanel {...props} />)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    backgroundColor: theme.palette.background.paper,
}))

interface TabPanelProps extends BoxProps {
    value: any
    index: number
}

const TabPanel: React.FC<TabPanelProps> = ({ value, index, children, ...props }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            <Box
                {...props}
            >
                {value === index && (
                    children
                )}
            </Box>
        </div>
    )
}