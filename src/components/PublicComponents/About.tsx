import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../media/logoAnimate.svg";
import { HOME } from "../../constants/routes";
import { getOperatingSystem } from "../../helper/utils";

const About = ({ isPrivate }: { isPrivate?: boolean | null }) => {
  const navigate = useNavigate();
  return (
    <Stack direction="column" sx={{ height: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Stack direction="row" alignItems="center" justifyContent="center" mb={2}>
        <img
          src={logo}
          onClick={!isPrivate ? () => navigate(HOME) : undefined}
          alt="Logo"
          style={{ width: "26px", height: "26px", cursor: "pointer", padding: 0 }}
        />
        <Typography component="h2" align="center" variant="h6" ml={0.5}>
          Finance Tracker
        </Typography>
      </Stack>

      <Typography variant="body1" textAlign="center">
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

      <Stack direction="column" justifyContent="start" alignItems="center" mb={2} width="100%">
        <Link variant="body1" href="mailto:xianvy0000@gmail.com" color="inherit" sx={{ cursor: "pointer" }}>
          {"xianvy0000@gmail.com"}
        </Link>
        <Typography variant="caption" textAlign="center">
          Feedback
        </Typography>
      </Stack>
      {(getOperatingSystem() === "Android" || getOperatingSystem() === "iOS") && (
        <Stack direction="column" justifyContent="start" alignItems="center" mb={2}>
          <Link
            href="https://vyfinancetracker.web.app"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            variant="body1"
            sx={{ cursor: "pointer" }}
          >
            {"vyfinancetracker.web.app"}
          </Link>
          <Typography variant="caption" textAlign="center">
            Website
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default About;
