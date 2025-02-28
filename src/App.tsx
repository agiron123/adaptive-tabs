import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AdaptiveTabs from './AdaptiveTabs';

const theme = createTheme({});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Button>Button</Button>
      <AdaptiveTabs />
    </ThemeProvider>
  );
}

export default App;
