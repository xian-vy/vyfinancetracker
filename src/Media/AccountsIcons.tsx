import CurrencyBitcoinOutlinedIcon from "@mui/icons-material/CurrencyBitcoinOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import LiveHelpOutlinedIcon from "@mui/icons-material/LiveHelpOutlined";
import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";

import React from "react";
const AccountsIcons = [
  { name: "Crypto", icon: <CurrencyBitcoinOutlinedIcon /> },
  { name: "Money", icon: <MonetizationOnOutlinedIcon /> },
  { name: "Credit", icon: <CreditCardOutlinedIcon /> },
  { name: "Debit", icon: <AddCardOutlinedIcon /> },
  { name: "Bank", icon: <AccountBalanceOutlinedIcon /> },
  { name: "No Icon", icon: <DoNotDisturbAltIcon /> },
  { name: "Uncategorized", icon: <LiveHelpOutlinedIcon /> },
];

export default AccountsIcons;
