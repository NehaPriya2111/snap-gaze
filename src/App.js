import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import PhotoUpload from './components/PhotoUpload';
import PhotoAnalysis from './components/PhotoAnalysis';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: 3,
        pb: 6
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            SnapGaze
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{
              mb: 4,
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            See Beyond the Shot!
          </Typography>
          {!uploadedImage ? (
            <PhotoUpload onImageUpload={setUploadedImage} />
          ) : (
            <PhotoAnalysis
              image={uploadedImage}
              onImageUpload={setUploadedImage}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 