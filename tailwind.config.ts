
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Kabyle theme colors
				kabyle: {
					terracotta: '#F97316', // Orange/terracotta
					blue: '#0EA5E9',       // Deep blue
					sand: '#FEC6A1',       // Light sand color
					earth: '#8B5A2B',      // Earth brown
					olive: '#556B2F',      // Olive green
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
			},
			backgroundImage: {
				'kabyle-pattern': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjEgMSAyLjEgMi4yIDAgMS4yLTEgMi4yLTIuMSAyLjItMS4yIDAtMi4xLTEtMi4xLTIuMiAwLTEuMiAxLTIuMiAyLjEtMi4yek0yNCAzNmMxLjIgMCAyLjEgMSAyLjEgMi4yIDAgMS4yLTEgMi4yLTIuMSAyLjItMS4yIDAtMi4xLTEtMi4xLTIuMiAwLTEuMiAxLTIuMiAyLjEtMi4yek00OSAzMGw0IDRoLThsNC00em0tMzggMGw0IDRoLThsNC00eiIgZmlsbD0icmdiYSgyNDAsIDEzMywgMzMsIDAuMikiLz48cGF0aCBkPSJNMzAgNDlsNCAxdjhsLTQtMXYtOHptMC0zOGw0IDFWNGwtNC0xdjh6TTE5IDQ5bDQgMXY4bC00LTF2LTh6TTE5IDExbDQgMVY0bC00LTF2OHoiIGZpbGw9InJnYmEoMTQsIDE2NSwgMjMzLCAwLjIpIi8+PC9nPjwvc3ZnPg==')",
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
