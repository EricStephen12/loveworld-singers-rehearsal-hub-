import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get('url')
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 })
    }

    // Fetch the KingsChat OAuth page
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LWSRH-OAuth-Proxy)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch OAuth page' }, { status: response.status })
    }

    let html = await response.text()
    
    // Modify the HTML to work within our app
    html = html.replace(
      /<head>/i,
      `<head>
        <base href="https://kingschat.online/">
        <script>
          // Override form submission to send data to parent
          document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Send form data to parent window
                window.parent.postMessage({
                  type: 'KINGSCHAT_FORM_SUBMIT',
                  action: form.action,
                  method: form.method,
                  data: data
                }, '*');
              });
            });
            
            // Override any redirects
            const originalReplace = window.location.replace;
            const originalAssign = window.location.assign;
            
            window.location.replace = function(url) {
              window.parent.postMessage({
                type: 'KINGSCHAT_REDIRECT',
                url: url
              }, '*');
            };
            
            window.location.assign = function(url) {
              window.parent.postMessage({
                type: 'KINGSCHAT_REDIRECT',
                url: url
              }, '*');
            };
          });
        </script>`
    )

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
      },
    })
  } catch (error: any) {
    console.error('OAuth proxy error:', error)
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 })
  }
}