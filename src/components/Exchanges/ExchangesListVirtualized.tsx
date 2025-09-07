import { ArrowRightAlt } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { FIXED_SIZE, iconSizeXS, TABLE_HEIGHT, TABLE_HEIGHT_XL } from "../../constants/size";
import { getAccountsDetails, getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import { TimestamptoDate } from "../../helper/date";
import { formatNumberWithoutCurrency, hoverBgColor, useResponsiveCharLimit } from "../../helper/utils";
import { useActionPopover } from "../../hooks/actionHook";
import AccountTypeModel from "../../models/AccountTypeModel";
import IncomeSourcesModel from "../../models/IncomeSourcesModel";

type Props = {
  onActionSelect: (action: string, income: any) => void;
  incomeSource: IncomeSourcesModel[];
  accountType: AccountTypeModel[];
  paginatedIncome: Array<{
    expenseId: string;
    incomeId: string;
    from_account_id: string;
    to_account_id: string;
    from_category_id: string;
    to_income_source_id: string;
    amount: number;
    date: any;
  }>;
};

const ExchangesListVirtualized = ({ incomeSource, paginatedIncome, onActionSelect, accountType }: Props) => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const xlScreen = useMediaQuery(theme.breakpoints.up("xl"));

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }

  const handleAction = (action: string, income: any) => {
    onActionSelect(action, income);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Delete"],
    handleAction,
  });

  const charLimit = useResponsiveCharLimit();

  const incomeList = React.useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const pair = paginatedIncome[index];
        const fromAccount = getCategoryAndAccountTypeDescription(pair.from_account_id, accountType) || "";
        const toAccount = getCategoryAndAccountTypeDescription(pair.to_account_id, accountType) || "";
        const { categoryIcon: fromIcon, color: fromColor } = getAccountsDetails(accountType, pair.from_account_id) as any;
        const { categoryIcon: toIcon, color: toColor } = getAccountsDetails(accountType, pair.to_account_id) as any;
 

        const description = `${fromAccount} → ${toAccount}`;
        return (
          <div key={index} style={style}>
            <ListItem
              sx={{
                "&:hover": {
                  backgroundColor: hoverBgColor(theme),
                  borderRadius: 1,
                },
                pl: smScreen ? 0.5 : 1,
                pr: smScreen ? 0 : 1,
                py: 0,
              }}
            >
              <ListItemText
                primary={
                  <>
                    <Tooltip title={description}>
                      <Stack direction="column" alignItems="start">
                          <Stack direction="row" spacing={0.75} alignItems="center">
                              {fromIcon && <span>{renderIcon(fromIcon.icon, fromColor || "")}</span>}
                              <Typography variant="caption">{fromAccount}</Typography>
                              <ArrowRightAlt sx={{fontSize: "18px"}} />
                              {toIcon && <span>{renderIcon(toIcon.icon, toColor || "")}</span>}
                              <Typography variant="caption">{toAccount}</Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ color: "inherit", fontWeight: 600 }}
                          >
                            {formatNumberWithoutCurrency(Math.abs(pair.amount))}
                          </Typography>
                      </Stack>
                    </Tooltip>

              
                  </>
                }
              />

              <ListItemSecondaryAction sx={{ mr: smScreen ? -2 : 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Stack direction="column" alignItems="flex-end">
                    <Typography variant="caption">{TimestamptoDate(pair.date, "MMM dd, yyyy")}</Typography>
                  </Stack>
                  <IconButton aria-label="Actions" onClick={(event) => handleActionOpen(event, pair)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ mx: 2 }} />
          </div>
        );
      },
    [paginatedIncome, accountType]
  );
  return (
    <div>
      <Box
        sx={{
          px: { xs: 0, sm: 1, md: 2 },
          pt: 2,
          mx: { xs: 0, sm: 1, md: 2 },
          height:  "auto" ,
        }}
      >
        <FixedSizeList
          height={ xlScreen  ? TABLE_HEIGHT_XL + 25 : TABLE_HEIGHT + 25}
          itemCount={paginatedIncome.length}
          itemSize={FIXED_SIZE}
          style={{ listStyle: "none" }}
          width="100%"
        >
          {incomeList}
        </FixedSizeList>
      </Box>
      {ActionPopover}
    </div>
  );
};

export default ExchangesListVirtualized;
