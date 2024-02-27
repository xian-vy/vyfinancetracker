import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  Stack,
  IconButton,
  Divider,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { getIncomeSourceDetails, getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import { TimestamptoDate } from "../../helper/date";
import { hoverBgColor, formatNumberWithoutCurrency, useResponsiveCharLimit } from "../../helper/utils";
import { TABLE_HEIGHT, FIXED_SIZE, iconSizeSM, iconSizeXS } from "../../constants/size";
import IncomeModel from "../../models/IncomeModel";
import IncomeSourcesModel from "../../models/IncomeSourcesModel";
import AccountTypeModel from "../../models/AccountTypeModel";
import { useActionPopover } from "../../hooks/actionHook";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type Props = {
  onActionSelect: (action: string, income: IncomeModel) => void;
  incomeSource: IncomeSourcesModel[];
  accountType: AccountTypeModel[];
  paginatedIncome: IncomeModel[];
};

const IncomeListVirtualized = ({ incomeSource, paginatedIncome, onActionSelect, accountType }: Props) => {
  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: smScreen ? iconSizeXS : iconSizeSM } });
  }

  const handleAction = (action: string, income: IncomeModel) => {
    onActionSelect(action, income);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
  });

  const charLimit = useResponsiveCharLimit();

  const incomeList = React.useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const income = paginatedIncome[index];

        const { description, color, categoryIcon } = getIncomeSourceDetails(incomeSource, income.category_id);
        const account = getCategoryAndAccountTypeDescription(income.account_id, accountType) || "";
        return (
          <div key={index} style={style}>
            <ListItem
              sx={{
                "&:hover": {
                  backgroundColor: hoverBgColor(theme),
                  borderRadius: 3,
                },
                pl: smScreen ? 0.5 : 1,
                pr: smScreen ? 0 : 1,
                py: 0,
              }}
            >
              <ListItemAvatar sx={{ minWidth: smScreen ? 24 : 32 }}>
                <Tooltip title={description}>
                  <div>{categoryIcon && renderIcon(categoryIcon.icon, color || "")}</div>
                </Tooltip>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Tooltip title={income.description === "" ? description : income.description}>
                      <Typography variant="body1">
                        {income.description === ""
                          ? description && description.length > charLimit
                            ? description.substring(0, charLimit)
                            : description
                          : income.description.length > charLimit
                          ? income.description.substring(0, charLimit)
                          : income.description}{" "}
                      </Typography>
                    </Tooltip>

                    <Typography variant="caption">{formatNumberWithoutCurrency(income.amount)}</Typography>
                  </>
                }
              />

              <ListItemSecondaryAction sx={{ mr: smScreen ? -2 : 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Stack direction="column" alignItems="flex-end">
                    <Typography variant="caption">{account}</Typography>
                    <Typography variant="caption">{TimestamptoDate(income.date, "MMM dd, yyyy")}</Typography>
                  </Stack>
                  <IconButton aria-label="Actions" onClick={(event) => handleActionOpen(event, income)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ mx: 2 }} />
          </div>
        );
      },
    [paginatedIncome, incomeSource, accountType]
  );
  return (
    <div>
      <Box
        sx={{
          px: { xs: 0, sm: 1, md: 2 },
          pt: 2,
          mx: { xs: 0, sm: 1, md: 2 },
          height: smScreen ? "auto" : TABLE_HEIGHT,
        }}
      >
        <FixedSizeList
          height={TABLE_HEIGHT}
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

export default IncomeListVirtualized;
