import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Social Media Analytics
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            Feed
          </Button>
          <Button color="inherit" component={RouterLink} to="/top-users">
            Top Users
          </Button>
          <Button color="inherit" component={RouterLink} to="/trending">
            Trending Posts
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 