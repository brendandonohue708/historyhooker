import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#0D0D0D" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bodyStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bodyStyles = `
html, body { background-color: #0D0D0D; color: #F5F1E8; }
#root { background-color: #0D0D0D; }
`;
