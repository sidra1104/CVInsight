import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
    },
    secondary: {
      main: '#3f37c9',
    },
    success: {
      main: '#4cc9f0',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      // In production, you'd extract text here
      setText(`[Extracted text from ${acceptedFiles[0].name} would appear here]`);
    }
  });

  const analyzeResume = async () => {
    if (!text.trim()) {
      setError('Please enter resume text or upload a file');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/api/analyze', { text });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              background: 'linear-gradient(90deg, #4361ee 0%, #4cc9f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Resume Analyzer
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Get instant insights about your resume's strengths
            </Typography>
          </Box>

          {/* Input Section */}
          <Box mb={4}>
            <TextField
              label="Paste your resume text here"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box 
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'text.secondary',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.3s ease',
                mb: 2
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography>
                {file ? (
                  <>Selected: <strong>{file.name}</strong></>
                ) : (
                  <>Drag & drop a PDF/DOCX file here, or click to select</>
                )}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={analyzeResume}
                disabled={loading || !text.trim()}
                startIcon={<SendIcon />}
                size="large"
                fullWidth
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<RefreshIcon />}
                size="large"
                fullWidth
              >
                Reset
              </Button>
            </Box>
          </Box>

          {/* Results Section */}
          {loading && <LinearProgress sx={{ my: 2 }} />}

          {result && (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'success.main'
              }}>
                <CheckCircleIcon fontSize="large" />
                Analysis Results
              </Typography>

              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="span">
                    Primary Role:
                  </Typography>
                  <Chip 
                    label={result.predicted_category} 
                    color="primary" 
                    sx={{ ml: 2, fontSize: '1rem', px: 2 }}
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PercentIcon color="primary" sx={{ mr: 1 }} />
                  Role Matching Probabilities:
                </Typography>

                <List>
                  {result.top_matches.map((item, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemText 
                        primary={item.category} 
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                      <Box width="100%" maxWidth={300}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {(item.probability * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {index === 0 ? 'Best Match' : ''}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.probability * 100} 
                          color={index === 0 ? 'primary' : 'secondary'}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'action.disabledBackground'
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;