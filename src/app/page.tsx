'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from '@/redux/store';
import DataTable from '@/components/DataTable';
import Toolbar from '@/components/Toolbar';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Home() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent SSR issues with Redux
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Toolbar />
          <DataTable />
        </div>
      </ThemeProvider>
    </Provider>
  );
}
