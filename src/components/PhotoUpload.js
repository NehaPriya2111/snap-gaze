import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function PhotoUpload({ onImageUpload }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          onImageUpload({
            file: file,
            dataUrl: reader.result,
            width: img.width,
            height: img.height
          });
        };
      };
      reader.readAsDataURL(file);
    }
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: 'primary.main'
        }
      }}
    >
      <input {...getInputProps()} />
      <Box sx={{ mb: 2 }}>
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop your photo here' : 'Drag & drop your photo here'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to select a file
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Supported formats: JPEG, JPG, PNG
      </Typography>
    </Paper>
  );
}

export default PhotoUpload; 