import { Equalizer, LanOutlined, LockOutlined, Devices } from "@mui/icons-material";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
const featuresData = [
  {
    description: "End to End Encryption",
    details: "Using AES encryption for data at rest and firebase built in encryption for data in transit.",
    IconComponent: LockOutlined,
  },
  {
    description: "Visualize your data",
    details: "Analyze your finances using charts to easily understand your financial health.",
    IconComponent: Equalizer,
  },
  {
    description: "Cross Platform",
    details: "Access and manage your finances with one account across multiple devices.",
    IconComponent: Devices,
  },

  {
    description: "Offline First",
    details: "Work seamlessly even without internet. Your data will be synced when you reconnect.",
    IconComponent: LanOutlined,
  },
];

const Features = () => {
  const darkmode = useSelector((state: RootState) => state.theme.darkMode);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      my={{ xs: 2, sm: 3, md: 4 }}
      mx="auto"
    >
      <Grid container spacing={1.5} maxWidth="md" px={2}>
        {featuresData.map((feature, index) => (
          <Grid item container xs={6} md={3} key={index}>
            <Paper
              variant="outlined"
              sx={{
                border: darkmode ? "solid 1px #2a2a2a" : "solid 1px  #ccc",
                borderRadius: 2,
                p: 2,
                minHeight: 130,
                height: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <feature.IconComponent sx={{ fontSize: { xs: "18px", md: "22px" }, mb: 0.5, color: "#d86c70" }} />
              <Typography sx={{ fontSize: { xs: "0.7rem", lg: "0.75rem" }, mb: 0.5 }}>{feature.description}</Typography>
              <Typography textAlign="left" sx={{ fontSize: { xs: "0.7rem", lg: "0.75rem" }, color: "#888" }}>
                {feature.details}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default Features;
