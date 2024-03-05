import { Add as AddIcon } from "@mui/icons-material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { Stack, Typography, useTheme } from "@mui/material";
import { SORT_TYPE } from "../../constants/constants";
import { iconSizeXS } from "../../constants/size";
import { ThemeColor } from "../../helper/utils";
import { useActionPopover } from "../../hooks/actionHook";
import CustomIconButton from "../CustomIconButton";

interface Props {
  onOpenForm: () => void;
  onSortChange: (sortBy: SORT_TYPE) => void;
}
const IncomeListHeader = (props: Props) => {
  const theme = useTheme();

  const openBudgetForm = () => {
    props.onOpenForm();
  };

  const handleAction = (action: string, fodder: string) => {
    props.onSortChange(action as SORT_TYPE);
    handleActionClose();
  };
  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [SORT_TYPE.date, SORT_TYPE.amount],
    handleAction,
  });

  return (
    <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ pr: { xs: 0, sm: 1, md: 2 } }}>
      <CustomIconButton type="filter" onClick={(event) => handleActionOpen(event, "fodder")}>
        <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
          Sort
        </Typography>

        <SwapVertIcon sx={{ fontSize: iconSizeXS }} />
      </CustomIconButton>

      <CustomIconButton onClick={openBudgetForm} type="add" style={{ marginLeft: 1 }}>
        <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
          New
        </Typography>
        <AddIcon sx={{ fontSize: iconSizeXS }} />
      </CustomIconButton>

      {ActionPopover}
    </Stack>
  );
};

export default IncomeListHeader;
