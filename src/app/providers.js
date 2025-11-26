"use client";

import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletStatusProvider } from '@/hooks/useWalletStatus';
import { NotificationProvider } from '@/components/NotificationSystem';
import WalletConnectionGuard from '@/components/WalletConnectionGuard';
import { ThemeProvider } from 'next-themes';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { monadTestnet } from '@/config/chains';
import { RainbowKitProvider, getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { 
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
  rainbowWallet,
  coinbaseWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const queryClient = new QueryClient();

// Create Material-UI theme
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B2398',
    },
    secondary: {
      main: '#31C4BE',
    },
    background: {
      default: 'rgba(10, 0, 8, 0.98)',
      paper: 'rgba(10, 0, 8, 0.98)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.9)',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 0, 8, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(10, 0, 8, 0.98) 0%, rgba(26, 0, 21, 0.98) 100%)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'linear-gradient(135deg, rgba(139, 35, 152, 0.1) 0%, rgba(49, 196, 190, 0.1) 100%)',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
  },
});

export default function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0A0008 0%, #1A0015 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  // Debug logging
  console.log('🔧 Providers mounting...');
  console.log('🔧 Project ID: 226b43b703188d269fb70d02c107c34e');

  // RainbowKit configuration for Monad Testnet
  let config;
  
  try {
    config = getDefaultConfig({
      appName: 'APT Casino Monad',
      projectId: '226b43b703188d269fb70d02c107c34e',
      chains: [monadTestnet],
      ssr: true,
    });
    console.log('🔧 Config created with getDefaultConfig:', config);
  } catch (error) {
    console.error('❌ Error creating config with getDefaultConfig:', error);
    
    // Fallback to manual config with MetaMask Smart Accounts support
    const connectors = connectorsForWallets([
      {
        groupName: 'Recommended',
        wallets: [
          metaMaskWallet({
            projectId: '226b43b703188d269fb70d02c107c34e',
            // Enable Smart Accounts support
            options: {
              enableSmartAccounts: true,
            }
          }),
          walletConnectWallet,
          injectedWallet,
        ],
      },
      {
        groupName: 'Other',
        wallets: [
          rainbowWallet,
          coinbaseWallet,
          trustWallet,
        ],
      },
    ], {
      appName: 'APT Casino Monad',
      projectId: '226b43b703188d269fb70d02c107c34e',
    });

    config = createConfig({
      connectors,
      chains: [monadTestnet],
      transports: {
        [monadTestnet.id]: http(),
      },
      ssr: true,
    });
    console.log('🔧 Config created with manual setup:', config);
  }

  return (
    <Provider store={store}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <NotificationProvider>
              <WalletStatusProvider>
                <WalletConnectionGuard>
                  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <MuiThemeProvider theme={muiTheme}>
                      <CssBaseline />
                      {children}
                    </MuiThemeProvider>
                  </ThemeProvider>
                </WalletConnectionGuard>
              </WalletStatusProvider>
            </NotificationProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Provider>
  );
}
