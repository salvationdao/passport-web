import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Link, Paper, TextField, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { PlaceholderMechImagePath, SupremacyLogoImagePath, SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { useAsset } from "../../containers/assets"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { NilUUID } from "../../types/auth"
import { Asset, Attribute } from "../../types/types"
import { Rarity, rarityTextStyles } from "../store/storeItemCard"
import { MintModal } from "../../components/mintModal"

export const BattleArenaPage: React.VoidFunctionComponent = () => {
	return <div></div>
}
