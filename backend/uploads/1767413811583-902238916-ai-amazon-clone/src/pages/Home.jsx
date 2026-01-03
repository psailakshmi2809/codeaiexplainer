import { Container, Typography, TextField, Button } from '@mui/material';

export default function Home() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>AI Amazon Clone</Typography>
      <TextField fullWidth label="Search products with AI" />
      <Button variant="contained" sx={{ mt: 2 }}>Search</Button>
    </Container>
  );
}
