/* eslint-disable @typescript-eslint/naming-convention */
import { createTheme } from '@mui/material/styles';
// declaring new typography variants
// declaring new uxGrey palette
declare module '@mui/material/styles' {
  interface PaletteColorOptions {
    main: string;
    light?: string;
    dark?: string;
    contract?: string;
    disabled?: string;
    border?: string;
    focus?: string;
    drag?: string;
    hover?: string;
    activated?: string;
    selected?: string;
  }
  interface Palette {
    uxGrey: PaletteColorOptions;
    uxBlue: PaletteColorOptions;
  }
  interface PaletteOptions {
    uxGrey: PaletteColorOptions;
    uxBlue: PaletteColorOptions;
  }
  interface TypographyVariants {
    title: React.CSSProperties;
    subtitle: React.CSSProperties;
    bodyCallout: React.CSSProperties;
    bodyMediumEmphasis: React.CSSProperties;
    label1: React.CSSProperties;
    label2: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    title?: React.CSSProperties;
    subtitle?: React.CSSProperties;
    bodyCallout?: React.CSSProperties;
    bodyMediumEmphasis?: React.CSSProperties;
    label1?: React.CSSProperties;
    label2?: React.CSSProperties;
  }
}
// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    title: true;
    subtitle: true;
    bodyCallout: true;
    bodyMediumEmphasis: true;
    label1: true;
    label2: true;
  }
}

const rawTheme = {
  palette: {
    primary: {
      main: '#276EF1',
    },
    secondary: {
      main: '#2056ba',
    },
    error: {
      main: '#C70A00',
      light: '#FFEFEE',
    },
    background: {
      default: '#FAFAFF',
    },
    success: {
      main: '#1F7A3C',
      dark: '#34C759',
      light: '#EAF9E0',
    },
    uxGrey: {
      main: '#757575',
      border: '#CCCCCC',
      dark: '#212121',
      disabled: '#9F9F9F',
      hover: '#F5F5F5',
      drag: '#EBEBEB',
      focus: '#E0E0E0',
    },
    uxBlue: {
      main: '#276EF1',
      activated: '#E4EDFE',
      selected: '#EEF4FE',
    },
    warning: {
      main: '#C63E15',
      light: '#FFF7EE',
    },
  },
  // fonts following standards here:
  // https://xd.adobe.com/view/105810a5-8cbd-4a22-8290-d863a16bdf34-450b/screen/fe693e1e-43ab-41dd-af3c-766ad9a50e99/specs/
  typography: {
    h1: {
      font: 'normal normal 300 60px/72px Roboto',
      letterSpacing: 0.12,
      fontWeight: 300,
      fontSize: 60,
    },
    h2: {
      font: 'normal normal normal 49px/59px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 49,
    },
    h3: {
      font: 'normal normal normal 42px/51px Roboto',
      fontWeight: 400,
      fontSize: 42,
    },
    h4: {
      font: 'normal normal normal 37px/44px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 37,
    },
    h5: {
      font: 'normal normal normal 32px/38px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 32,
    },
    h6: {
      font: 'normal normal normal 28px/34px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 28,
    },
    title: {
      font: 'normal normal 500 21px/25px Roboto',
      letterSpacing: 0,
      fontWeight: 500,
      fontSize: 21,
    },
    subtitle: {
      font: 'normal normal 500 19px/23px Roboto',
      letterSpacing: 0,
      fontWeight: 500,
      fontSize: 19,
    },
    bodyCallout: {
      font: 'normal normal 500 16px/19px Roboto',
      letterSpacing: 0,
      fontWeight: 500,
      fontSize: 16,
    },
    body1: {
      font: 'normal normal 400 16px/19px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 16,
    },
    bodyMediumEmphasis: {
      font: 'normal normal 400 16px/19px Roboto',
      letterSpacing: 0,
      fontWeight: 400,
      fontSize: 16,
      color: '#00000099',
    },
    button: {
      font: 'normal normal 500 14px/17px Roboto',
      letterSpacing: 1.25,
      fontWeight: 500,
      fontSize: 14,
    },
    label1: {
      font: 'normal normal 500 12px/14px Roboto',
      letterSpacing: 1.2,
      fontWeight: 500,
      fontSize: 12,
    },
  },
};

// The base theme for the merchant portal
// This contains all the default styles (spacing, colors, etc) for all generic types of MUI components and html tags.
const theme = createTheme({
  ...rawTheme,
  components: {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        caption: {
          fontWeight: 500,
        },
      },
    },
    // MuiInputBase: {

    // },
    MuiButton: {
      styleOverrides: {
        root: {
          lineHeight: 1.25,
          padding: '8px 16px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        standardError: {
          backgroundColor: rawTheme.palette.error.light,
          color: rawTheme.palette.error.main,
        },
        standardSuccess: {
          backgroundColor: rawTheme.palette.success.light,
          color: rawTheme.palette.success.main,
        },
        standardWarning: {
          backgroundColor: rawTheme.palette.warning.light,
          color: rawTheme.palette.warning.main,
        },
        standardInfo: {
          backgroundColor: rawTheme.palette.uxBlue.activated,
          color: rawTheme.palette.secondary.main,
        },
        icon: {
          marginRight: 6,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
  },
  spacing: 8,
});

export default theme;
