export default function Html({ children, head }) {
  return (
    <html>
      <head dangerouslySetInnerHTML={{ __html: head }}></head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<b>Enable JavaScript to run this app.</b>`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
