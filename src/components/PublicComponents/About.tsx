import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../media/logoAnimate.svg";
import { HOME } from "../../constants/routes";

const About = ({ isPrivate }: { isPrivate?: boolean | null }) => {
  const navigate = useNavigate();
  return (
    <Stack direction="column" sx={{ height: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img
        src={logo}
        onClick={!isPrivate ? () => navigate(HOME) : undefined}
        alt="Logo"
        style={{ width: "26px", height: "26px", cursor: "pointer", padding: 0, marginBottom: "5px" }}
      />

      <Typography variant="body1" textAlign="center" gutterBottom>
        A progressive web app
      </Typography>
      <Typography variant="body1" textAlign="center">
        built with
      </Typography>
      <Typography variant="body1" textAlign="center">
        React, Typescript, Redux, MUI, Firebase, Recharts
      </Typography>
      <Typography variant="body1" textAlign="center" mb={3}>
        and Web Crypto API
      </Typography>

      <Stack direction="row" justifyContent="center" alignItems="center" mb={2} width="100%">
        Developed By
        <Link
          variant="caption"
          href="https://xianvy.vercel.app/"
          target="_blank"
          sx={{ cursor: "pointer", textDecoration: "none", mx: 0.5 }}
        >
          Xian
        </Link>
      </Stack>
    </Stack>
  );
};

export default About;
