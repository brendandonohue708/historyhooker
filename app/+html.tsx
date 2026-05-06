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
html, body, #root { background-color: #0D0D0D !important; color: #F5F1E8; min-height: 100%; }
body { margin: 0; }
* { box-sizing: border-box; }
/* Override the default light card background that react-native-screens injects on web */
div[style*="rgba(242,242,242"] { background-color: #0D0D0D !important; }
div[style*="rgb(242, 242, 242)"] { background-color: #0D0D0D !important; }
`;
