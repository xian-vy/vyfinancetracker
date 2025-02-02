import { Devices, Equalizer, LanOutlined, LockOutlined } from "@mui/icons-material";
import { Grid, Paper, Stack, Typography } from "@mui/material";
const featuresData = [
  {
    description: "E2E Encryption",
    details: "Using AES encryption for data at rest and firebase built in encryption for data in transit.",
    IconComponent: LockOutlined,
  },
  {
    description: "Visualize your data",
    details: "Gain insights into your financial well-being by analyzing your finances through visual charts.",
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

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      my={4}
      mx="auto"
    >
      <Grid container spacing={{ xs: 2, xl: 3}} maxWidth={{ xs: 600, md: 900,xl: 1000 }} px={2}>
        {featuresData.map((feature, index) => (
          <Grid item container xs={6}  md={3} key={index}  justifyContent="center">
            <Paper
              variant="outlined"
              sx={{
                border:  "solid 1px #2a2a2a",
                borderRadius: 2,
                p: 2,
                minHeight: {xs: 130, sm: 150, md: 180},
                height: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <feature.IconComponent sx={{ fontSize: { xs: "18px", md: "22px" }, mb: 0.5, color: "#d86c70" }} />
              <Typography textAlign="center" sx={{ fontSize: {xs: "0.8rem", sm: "0.85rem"}, mb: 0.8,fontWeight:500 }}>{feature.description}</Typography>
              <Typography textAlign="center" sx={{ fontSize: {xs: "0.75rem", sm: "0.8rem"}, color: "#ccc" }}>
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
