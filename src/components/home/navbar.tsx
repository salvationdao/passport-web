import { LoadingButton } from '@mui/lab';
import { Box, BoxProps, Link, Menu, MenuItem, MenuList } from '@mui/material';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import SupremacyLogo from "../../assets/images/supremacy-logo.svg";
import XSYNLogoImage from "../../assets/images/XSYN Stack White.svg";

interface NavbarProps extends BoxProps {

}

export const Navbar: React.FC<NavbarProps> = ({ sx, ...props }) => {
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "1700px",
            margin: "0 auto",
            padding: "0 3rem",
            paddingTop: "3rem",
            ...sx
        }} {...props}>
            <Link href="/">
                <Box component="img" src={XSYNLogoImage} alt="XSYN Logo" />
            </Link>
            <MenuButton />
        </Box>
    );
}

const MenuButton: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const history = useHistory()
    const open = Boolean(anchorEl);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                PaperProps={{
                    sx: (theme) => ({
                        padding: "1rem",
                        backgroundColor: theme.palette.background.default
                    })
                }}
            >
                <MenuList>
                    <MenuItem onClick={() => {
                        handleClose()
                        history.push("/profile")
                    }} sx={(theme) => ({
                        padding: ".5rem 0",
                        fontSize: "1.6rem",
                        lineHeight: 1,
                        color: theme.palette.primary.main
                    })}><Box component="span" sx={{
                        marginRight: ".5rem"
                    }}>&#62;</Box>Profile</MenuItem>
                    <MenuItem onClick={handleClose} sx={(theme) => ({
                        padding: ".5rem 0",
                        fontSize: "1.6rem",
                        lineHeight: 1,
                        color: theme.palette.primary.main
                    })}><Box component="span" sx={{
                        marginRight: ".5rem"
                    }}>&#62;</Box>Wallet</MenuItem>
                    <MenuItem onClick={handleClose} sx={(theme) => ({
                        padding: ".5rem 0",
                        fontSize: "1.6rem",
                        lineHeight: 1,
                        color: theme.palette.primary.main
                    })}><Box component="span" sx={{
                        marginRight: ".5rem"
                    }}>&#62;</Box>Badges</MenuItem>
                </MenuList>
                <Box sx={(theme) => ({
                    marginBottom: ".5rem",
                    fontSize: "1rem",
                    color: "#807f82"
                })}>My Games</Box>
                <Link href="https://supremacy.game"><Box component="img" sx={{
                    width: "100%",
                }} src={SupremacyLogo} alt="Supremacy Logo" /></Link>
            </Menu>
            <LoadingButton sx={{
                position: "relative",
                height: "3.3rem",
                width: "3.3rem",
                minWidth: "auto",
                padding: 0,
                borderRadius: "50%",
                cursor: "pointer",
                backgroundColor: "transparent",
                border: "none",
                "&:hover": {
                    "& > *:nth-of-type(1)": {
                        transform: "rotate(30deg) translate(-3px, 0)",
                    },
                    "& > *:nth-of-type(2)": {

                    },
                    "& > *:nth-of-type(3)": {
                        transform: "rotate(30deg) translate(3px, 0)",
                    },
                },
                "&:active": {
                    "& > *:nth-of-type(1)": {
                        transform: "rotate(30deg) translate(1px, 0)",
                    },
                    "& > *:nth-of-type(2)": {

                    },
                    "& > *:nth-of-type(3)": {
                        transform: "rotate(30deg) translate(-1px, 0)",
                    },
                }
            }}
                onClick={handleClick}
            >
                <Box component="span" sx={(theme) => ({
                    position: "absolute",
                    top: ".5rem",
                    left: ".5rem",
                    height: "2rem",
                    width: ".2rem",
                    transform: "rotate(30deg)",
                    transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    backgroundColor: theme.palette.common.white,
                })} />
                <Box component="span" sx={(theme) => ({
                    position: "absolute",
                    top: ".5rem",
                    left: "1.5rem",
                    height: "2rem",
                    width: ".2rem",
                    transform: "rotate(30deg)",
                    transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    backgroundColor: theme.palette.common.white,
                })} />
                <Box component="span" sx={(theme) => ({
                    position: "absolute",
                    top: ".5rem",
                    left: "2.5rem",
                    height: "2rem",
                    width: ".2rem",
                    transform: "rotate(30deg)",
                    transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    backgroundColor: theme.palette.common.white,
                })} />
            </LoadingButton>
        </>
    )
}