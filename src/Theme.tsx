import { createTheme, responsiveFontSizes } from "@mui/material/styles";
/*
Default breakpoints

xs, extra-small: 0px
sm, small: 600px
md, medium: 900px
lg, large: 1200px
xl, extra-large: 1536px

*/
const commonTypography = {
  fontFamily: 'Poppins, "Helvetica", "Arial", sans-serif',
  h3: {
    fontSize: "1.2rem",
  },
  h4: {
    fontSize: "0.94rem",
  },
  h5: {
    fontSize: "0.9rem",
  },
  h6: {
    fontSize: "0.8rem",
  },
  body1: {
    fontSize: "0.8rem",
  },
  body2: {
    fontSize: "0.85rem",
  },
  caption: {
    fontSize: "0.75rem",
  },
};

const commonComponents = {
  MuiTextField: {
    styleOverrides: {
      root: {
        "& input:-webkit-autofill": {
          WebkitBoxShadow: "0 0 0 1000px transparent inset",
          caretColor: "inherit",
          transition: "background-color 5000s ease-in-out 0s",
        },
        "& input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active": {
          WebkitBoxShadow: "0 0 0 1000px transparent inset",
          caretColor: "inherit",
        },
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        minWidth: "160px",
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        fontSize: "0.7rem",
      },
      text: {
        color: "default",
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: "grey",
      },
    },
  },
  MuiListItemAvatar: {
    styleOverrides: {
      root: {
        minWidth: 35,
      },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: {
        ".MuiTablePagination-actions": {
          margin: "0 !important",
        },
        ".MuiInputBase-root": {
          margin: 1,
        },
        ".MuiToolbar-root": {
          fontSize: "0.7rem",
        },
        ".MuiTablePagination-displayedRows": {
          fontSize: "0.7rem",
        },
        ".MuiTablePagination-selectLabel": {
          fontSize: "0.75rem",
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        "& svg": {
          width: "20px",
          height: "20px",
        },
      },
    },
  },
  // MuiSelect: {
  //   styleOverrides: {
  //     select: {
  //       padding: "4px",
  //     },
  //   },
  // },
};

let lightTheme = createTheme({
  typography: {
    ...commonTypography,
  },
  components: {
    ...commonComponents,
    MuiTab: {
      styleOverrides: {
        ...commonComponents.MuiTab.styleOverrides,
        root: {
          "&.Mui-selected": {
            color: "#333",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #e1e1e1",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "& svg": {
            fontSize: "16px",
            color: "#666",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          //color: "#7e7e7e", !default icon light color
          color: "#6c6c6c",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#e1e1e1",
        },
      },
    },
  },

  palette: {
    mode: "light",
    background: {
      default: "#fff",
    },
    text: {
      primary: "#000",
    },
  },
});

let darkTheme = createTheme({
  typography: {
    ...commonTypography,
  },
  components: {
    ...commonComponents,
    MuiTab: {
      styleOverrides: {
        ...commonComponents.MuiTab.styleOverrides,
        root: {
          "&.Mui-selected": {
            color: "white",
          },
        },
      },
    },
    // MuiDataGrid: {
    //   styleOverrides: {
    //     root: {
    //       "& .MuiDataGrid-cell": {
    //         borderBottom: "1px solid #292828",
    //       },
    //       "& .MuiDataGrid-footerContainer": {
    //         borderTop: "1px solid #292828",
    //       },
    //       "& .MuiDataGrid-columnHeaders": {
    //         borderBottom: "1px solid #292828",
    //       },
    //       "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
    //         borderBottom: "none",
    //       },
    //     },
    //   },
    // },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #292828",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e",
          border: "none",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          "& svg": {
            fontSize: "16px",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#ccc", // Change this to your desired color
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#292828",
        },
      },
    },
  },
  palette: {
    mode: "dark",
    text: {
      primary: "#ccc",
    },
  },
});
lightTheme = responsiveFontSizes(lightTheme);

darkTheme = responsiveFontSizes(darkTheme);

let lightThemeLGfont = createTheme({
  ...lightTheme,
  typography: {
    ...lightTheme.typography,
    caption: {
      ...lightTheme.typography.caption,
      fontSize: "0.8rem",
    },
    body1: {
      ...lightTheme.typography.body1,
      fontSize: "0.85rem",
    },
    body2: {
      ...lightTheme.typography.body2,
      fontSize: "0.9rem",
    },
    h4: {
      ...lightTheme.typography.h4,
      fontSize: "1rem",
    },
    h6: {
      ...lightTheme.typography.h4,
      fontSize: "0.95rem",
    },
  },
});

let darkThemeLGfont = createTheme({
  ...darkTheme,
  typography: {
    ...darkTheme.typography,
    caption: {
      ...darkTheme.typography.caption,
      fontSize: "0.75rem",
    },
    body1: {
      ...darkTheme.typography.body1,
      fontSize: "0.85rem",
    },
    body2: {
      ...darkTheme.typography.body2,
      fontSize: "0.9rem",
    },
    h4: {
      ...darkTheme.typography.h4,
      fontSize: "1rem",
    },
    h6: {
      ...darkTheme.typography.h4,
      fontSize: "0.95rem",
    },
  },
});

export { lightTheme, darkTheme, lightThemeLGfont, darkThemeLGfont };
