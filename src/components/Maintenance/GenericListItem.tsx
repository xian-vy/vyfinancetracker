import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Grid, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: "18px" } });
}

type MaintenanceModel = {
  id?: string;
  description: string;
  color: string;
  icon?: string;
};

type IconType = {
  name: string;
  icon: JSX.Element;
};
interface Props<T> {
  items: T[];
  onActionSelect: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: T) => void;
  icons: IconType[];
}
const GenericListItem = <T extends MaintenanceModel>({ items, onActionSelect, icons }: Props<T>) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div style={{ flexGrow: 1, overflow: "auto", paddingBottom: 1 }}>
      <Grid container p={{ xs: 0, md: 1 }} gap={1} justifyContent="left" alignItems="left" px={{ xs: 0, md: 2 }}>
        {items.map((item) => {
          const iconObject = icons.find((icon) => icon.name === item.icon);

          return (
            <Paper
              key={item.id}
              sx={{
                pl: 1,
                py: 0,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
              }}
              variant="outlined"
            >
              <Stack direction="row" alignItems="center">
                {iconObject && renderIcon(iconObject.icon, item.color)}
                <Typography align="left" pl={1} variant={smScreen ? "caption" : "body1"}>
                  <span style={{ flex: 1 }}>{item.description}</span>
                </Typography>
              </Stack>
              <IconButton sx={{ ml: 1, py: 0.5 }} onClick={(event) => onActionSelect(event, item)} size="small">
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Paper>
          );
        })}
      </Grid>
    </div>
  );
};

export default GenericListItem;
