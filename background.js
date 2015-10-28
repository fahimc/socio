/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function (launchData) {
  chrome.app.window.create(
    'index.html', {
      id: 'mainWindow',
      bounds: {
        width: 900,
        height: 600
      }
    },
    function (win) {
      win.contentWindow.onload = function () {
        var webviews = win.contentWindow.document.querySelectorAll('webview');
        for (var a = 0; a < webviews.length; a++) {
          var webview = webviews[a];
          webview.addEventListener('newwindow', function (e) {
            e.preventDefault();
            chrome.browser.openTab({url: e.targetUrl});
          });
        }
      }

    }
  );
});

