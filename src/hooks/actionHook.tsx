import React, { useState } from "react";
import { Popover, List, ListItemButton, ListItemText } from "@mui/material";

interface ActionPopoverProps<T> {
  actions: string[];
  handleAction: (action: string, item: T) => void;
  disabledCondition?: (action: string, item: T) => boolean;
}
export const useActionPopover = <T,>({ actions, handleAction, disabledCondition }: ActionPopoverProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionOpen(false);
  };

  const handleActionOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: T) => {
    setAnchorEl(event.currentTarget);
    setActionOpen(true);
    setCurrentItem(item);
  };

  const ActionPopover = (
    <Popover
      open={actionOpen}
      anchorEl={anchorEl}
      onClose={handleActionClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <List>
        {actions.map((action) => (
          <ListItemButton
            disabled={currentItem && disabledCondition ? disabledCondition(action, currentItem) : false}
            key={action}
            onClick={() => {
              if (currentItem) {
                handleAction(action, currentItem);
              }
            }}
          >
            <ListItemText primary={action} />
          </ListItemButton>
        ))}
      </List>
    </Popover>
  );

  return { ActionPopover, handleActionOpen, handleActionClose };
};
