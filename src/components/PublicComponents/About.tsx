import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../media/vylogonew.png";
import { HOME } from "../../constants/routes";

const About = ({ isPrivate }: { isPrivate?: boolean | null }) => {
  const navigate = useNavigate();
  return (
    <Stack direction="column" sx={{ height: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Stack direction="row" justifyContent="center" alignItems="center" gap={0.3} my={1}>
          <img
            src={logo}
            onClick={!isPrivate ? () => navigate(HOME) : undefined}
            alt="Logo"
            style={{ width: "22px", height: "22px", cursor: "pointer", padding: 0 }}
          />
          <Typography variant="body2" textAlign="center">
          Vy Finance Tracker
          </Typography>
      </Stack>

      <Typography variant="body2" textAlign="center" mt={1}>
        A progressive web app
      </Typography>
      <Typography variant="body2" textAlign="center" mb={1}>
        built with   react, typescript, redux, material ui, firebase and recharts
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center" my={2} width="100%" sx={{fontSize:"0.8rem"}}>
       Developed by
        <Link
          variant="caption"
          href="https://xianvy.vercel.app/"
          target="_blank"
          sx={{ cursor: "pointer", textDecoration: "none", mx: 0.5 ,color: "#d86c70",fontSize:"0.8rem" }}
        >
          Xian
        </Link>
      </Stack>
    </Stack>
  );
};

export default About;
