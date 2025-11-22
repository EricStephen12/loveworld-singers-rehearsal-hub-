import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const redirectUri = searchParams.get('redirect_uri')
    const scope = searchParams.get('scope')
    const state = searchParams.get('state')
    
    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Build the actual KingsChat OAuth URL
    const kingschatParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope || 'profile email',
      state: state || ''
    })

    const kingschatUrl = `https://kingschat.online/oauth/authorize?${kingschatParams.toString()}`
    
    // Fetch the OAuth page from KingsChat
    const response = await fetch(kingschatUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LWSRH-OAuth)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`KingsChat responded with ${response.status}`)
    }

    let html = await response.text()
    
    // Inject JavaScript to handle form submissions and redirects
    const injectedScript = `
      <script>
        (function() {
          console.log('🔧 OAuth proxy script loaded');
          
          // Override form submissions
          document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              const originalSubmit = form.submit;
              form.addEventListener('submit', function(e) {
                console.log('📝 Form submission intercepted');
                // Let the form submit normally, but monitor for redirects
              });
            });
            
            // Monitor for URL changes (redirects)
            let currentUrl = window.location.href;
            setInterval(function() {
              if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                console.log('🔄 URL changed to:', currentUrl);
                
                // Check if this is our callback
                if (currentUrl.includes('/auth/kingschat/callback')) {
                  const urlObj = new URL(currentUrl);
                  const code = urlObj.searchParams.get('code');
                  const error = urlObj.searchParams.get('error');
                  
                  if (code) {
                    window.parent.postMessage({
                      type: 'KINGSCHAT_AUTH_SUCCESS',
                      code: code
                    }, '*');
                  } else if (error) {
                    window.parent.postMessage({
                      type: 'KINGSCHAT_AUTH_ERROR',
                      error: error,
                      description: urlObj.searchParams.get('error_description')
                    }, '*');
                  }
                }
              }
            }, 500);
          });
        })();
      </script>
    `
    
    // Inject the script before closing head tag
    html = html.replace('</head>', injectedScript + '</head>')
    
    // Fix relative URLs to point to KingsChat
    html = html.replace(/href="\/([^"]*)/g, 'href="https://kingschat.online/$1')
    html = html.replace(/src="\/([^"]*)/g, 'src="https://kingschat.online/$1')
    html = html.replace(/action="\/([^"]*)/g, 'action="https://kingschat.online/$1')
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Remove X-Frame-Options to allow iframe embedding
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self' *;",
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('OAuth proxy error:', error)
    
    // Return a fallback HTML page with error
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .error { color: #dc3545; margin: 20px 0; }
            .retry { background: #6f42c1; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h2>Authentication Error</h2>
          <div class="error">Unable to load KingsChat login page</div>
          <button class="retry" onclick="window.location.reload()">Try Again</button>
          <script>
            window.parent.postMessage({
              type: 'KINGSCHAT_AUTH_ERROR',
              error: 'proxy_error',
              description: 'Failed to load OAuth page'
            }, '*');
          </script>
        </body>
      </html>
    `
    
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL'
      }
    })
  }
}