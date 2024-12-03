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
        style={{ width: "24px", height: "24px", cursor: "pointer", padding: 0, marginBottom: "5px" }}
      />

      <Typography variant="body1" textAlign="center" mt={1}>
        A progressive web app
      </Typography>
      <Typography variant="body1" textAlign="center" mb={2}>
        built with
      </Typography>
      <Typography variant="body1" textAlign="center" >
        react, typescript, redux, material ui, firebase and recharts
      </Typography>

      <Stack direction="row" justifyContent="center" alignItems="center" my={2} width="100%">
        developed by
        <Link
          variant="caption"
          href="https://xianvy.vercel.app/"
          target="_blank"
          sx={{ cursor: "pointer", textDecoration: "none", mx: 0.5 ,color: "#d86c70", }}
        >
          xian
        </Link>
      </Stack>
    </Stack>
  );
};

export default About;
