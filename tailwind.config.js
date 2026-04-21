/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Enterprise Healthcare Primary
        primary: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          hover: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        secondary: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          700: '#0F766E',
        },
        accent: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        // Status colors
        success: {
          DEFAULT: '#15803D',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          700: '#15803D',
        },
        warning: {
          DEFAULT: '#B45309',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          700: '#B45309',
        },
        danger: {
          DEFAULT: '#B91C1C',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          700: '#B91C1C',
        },
        info: {
          DEFAULT: '#1D4ED8',
          50: '#EFF6FF',
          700: '#1D4ED8',
        },
        // Surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F1F5F9',
          body: '#F8FAFC',
        },
        sidebar: {
          bg: '#0F172A',
          text: '#CBD5E1',
          active: '#3B82F6',
          hover: 'rgba(255, 255, 255, 0.05)',
          border: '#1E293B',
        },
        // Text
        'ct-text': {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          'on-dark': '#F1F5F9',
        },
        // Borders
        'ct-border': {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
          divider: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'badge': ['11px', { lineHeight: '1', fontWeight: '500' }],
        'table-header': ['12px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'table-cell': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'card-title': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'page-title': ['20px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.02em' }],
        'stat': ['28px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '55': '220px',
        '14px': '14px',
      },
      width: {
        'sidebar': '220px',
        'sidebar-collapsed': '56px',
        'slide-over': '400px',
        'slide-over-lg': '480px',
      },
      height: {
        'header': '48px',
        'row-compact': '40px',
        'row-comfortable': '48px',
        'btn': '36px',
        'input': '36px',
        'kpi': '72px',
      },
      maxWidth: {
        'content': '1400px',
        'auth': '400px',
        'command-palette': '560px',
      },
      borderRadius: {
        'card': '10px',
        'btn': '8px',
        'input': '8px',
      },
      boxShadow: {
        'card-hover': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'enterprise': '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'fixed': '30',
        'modal-backdrop': '40',
        'modal': '50',
        'popover': '60',
        'tooltip': '70',
      },
    },
  },
  plugins: [],
};
