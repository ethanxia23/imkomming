// app/layout.tsx
export const metadata = {
    title: 'imkomming.com',
    description: 'My Wahoo API project',
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  