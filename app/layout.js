'use client'

import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider }      from '@/context/AuthContext'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import { ThemeProvider }     from '@/context/ThemeContext'
import ServiceWorkerRegistrar from '@/components/shared/ServiceWorkerRegistrar'
import OfflineIndicator       from '@/components/shared/OfflineIndicator'

/* ─── Metadata ───────────────────────────────────────────────────────────────
   Next.js App Router reads this export and injects into <head> automatically.
   No manual <title> or <meta> tags needed in this file.
────────────────────────────────────────────────────────────────────────────── */
export const metadata = {
  title: {
    default:  'FlowDesk — AI-Powered Workspace',
    template: '%s | FlowDesk',
  },
  description:
    'Manage projects, track tasks, and collaborate in real time. AI-powered subtasks, Gantt charts, time tracking, and professional analytics — all in one place.',
  keywords: [
    'project management',
    'task tracking',
    'AI productivity',
    'team collaboration',
    'kanban board',
    'time tracking',
    'analytics',
  ],
  authors:  [{ name: 'FlowDesk' }],
  creator:  'FlowDesk',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName:    'FlowDesk',
    title:       'FlowDesk — AI-Powered Workspace',
    description: 'Manage projects, track tasks, and collaborate in real time.',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'FlowDesk — AI-Powered Workspace',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'FlowDesk — AI-Powered Workspace',
    description: 'Manage projects, track tasks, and collaborate in real time.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
  },
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-16x16.png',
    apple:       '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0c1a'  },
  ],
}

/* ─── Root Layout ────────────────────────────────────────────────────────────
   Provider order matters:
     ThemeProvider     — must be outermost so dark class is on <html> before paint
     AuthProvider      — user session, depends on nothing
     WorkspaceProvider — depends on AuthProvider (reads user to fetch workspaces)
────────────────────────────────────────────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/*
          Inline script — runs BEFORE React hydrates to prevent flash of
          wrong theme. Reads localStorage and applies 'dark' class immediately.
          suppressHydrationWarning on <html> prevents mismatch warnings.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('flowdesk-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body className="bg-surface-50 dark:bg-surface-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>

              {/* Register service worker for offline support */}
              <ServiceWorkerRegistrar />

              {/* Offline banner — shows when navigator.onLine is false */}
              <OfflineIndicator />

              {/* Page content */}
              {children}

              {/* Toast notifications */}
              <Toaster
                position="top-right"
                gutter={8}
                containerStyle={{ top: 16, right: 16 }}
                toastOptions={{
                  duration: 4000,
                  style: {
                    fontFamily:   "'Plus Jakarta Sans', sans-serif",
                    fontSize:     '14px',
                    fontWeight:   '500',
                    borderRadius: '12px',
                    padding:      '12px 16px',
                    boxShadow:    '0 4px 24px rgba(0,0,0,0.12)',
                    maxWidth:     '380px',
                  },
                  success: {
                    iconTheme: { primary: '#10b981', secondary: '#fff' },
                    style: {
                      background: '#fff',
                      color:      '#111425',
                      border:     '1px solid #d1fae5',
                    },
                  },
                  error: {
                    duration:  5000,
                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                    style: {
                      background: '#fff',
                      color:      '#111425',
                      border:     '1px solid #fecaca',
                    },
                  },
                  loading: {
                    style: {
                      background: '#fff',
                      color:      '#111425',
                      border:     '1px solid #e4e7f1',
                    },
                  },
                }}
              />

            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}