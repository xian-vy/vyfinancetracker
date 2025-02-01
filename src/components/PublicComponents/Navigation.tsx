import { Container, Dialog, Stack, ThemeProvider } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { HOME, PRIVACY_POLICY, SIGN_IN_PATH, TERMS_OF_USE } from '../../constants/routes';
import { RootState } from '../../redux/store';
import { darkTheme, lightTheme } from '../../Theme';
import TNCandPrivacyPolicyDialog from '../legal/TNCandPrivacyPolicyDialog';
import logo from "../../media/vylogonew.png";

const navItems =   [
    {
        name: "Privacy",
        path: PRIVACY_POLICY,
    },
    {
        name: "Terms",
        path: TERMS_OF_USE,
    }
]

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const darktheme = useSelector((state: RootState) => state.theme.darkMode);
  const [agreementDialog, setAgreementDialog] = React.useState<{ open: boolean; doc: string | null }>({
    open: false,
    doc: null,
  });
  return (
    <Box sx={{ display: 'flex', }}>
      <CssBaseline />
      <AppBar elevation={0} variant='outlined' component="nav" sx={{ bgcolor: darktheme ? "#121212" : "#fff", borderLeft:"none", borderRight:"none"}}>
      <Toolbar>
      <Container maxWidth="lg" sx={{display:"flex", justifyContent:"space-between", alignItems:"center",px:0, width:"100%"}}>      
             <Stack direction="row" alignItems="center" spacing={0.5} width="100%">
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      width: "28px",
                      height: "28px",

                    }}
                    />
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{  fontWeight:600,color: darktheme ? '#ccc' : '#333',cursor:"pointer" }}
                      onClick={() => navigate(HOME)}
                    >
                      VYFINANCE
                    </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} width="100%">
                  <Box sx={{ display: { xs: location.pathname === SIGN_IN_PATH ? 'flex' : 'none', sm: 'flex', alignItems:"center" } }}>
                      {navItems.map((item) => (
                        <Button key={item.name}   onClick={() => setAgreementDialog({ open: true, doc: item.path})} sx={{ color: darktheme ? '#ccc' : '#333',fontWeight:600 }} >
                          {item.name}
                        </Button>
                      ))}
                  </Box>  
                  {location.pathname !== SIGN_IN_PATH &&  (
                        <Button variant='contained' onClick={() => navigate(SIGN_IN_PATH)}  sx={{ color: '#fff',fontWeight:600, bgcolor :"#d86c70",border:`solid 1px #d86c70`,borderRadius:0, boxShadow:"none", '&:hover': {
                          bgcolor: "#d86c70"
                        }}}>
                          <Typography variant='caption' noWrap sx={{ fontWeight:600}}>
                          Get Started - Free
                          </Typography>
                      </Button>
                    )}
              </Stack>
          </Container>
        </Toolbar>
      </AppBar>
     
      <Toolbar />  

      <ThemeProvider
        theme={darktheme ? darkTheme : lightTheme} 
      >
        <Dialog open={agreementDialog.open} maxWidth="md" fullWidth
          PaperProps={{ 
            sx: { borderRadius: 0,  },
          }}
           slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0,  0,  0,  0.8)',
              },
            },
          }}
        >
          <React.Suspense fallback={<div>loading...</div>}>
            <TNCandPrivacyPolicyDialog
              selectedDoc={agreementDialog.doc}
              onClose={() => setAgreementDialog({ open: false, doc: PRIVACY_POLICY })}
            />
          </React.Suspense>
        </Dialog>
      </ThemeProvider>
      
    </Box>
  );
}
