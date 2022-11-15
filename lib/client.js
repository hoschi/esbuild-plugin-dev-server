(function () {
  var overlayEl;

  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function errorToEl(e) {
    var el = document.createElement('div');
    el.style.color = '#868686';
    el.style.marginBottom = '15px';
    if (!e.location) {
      el.innerText = 'Error: ' + e.text;
      return el;
    }

    var pluginText = e.pluginName ? '[plugin: ' + e.pluginName + '] ' : '';
    var fileText = pluginText + e.location.file + ' (' + e.location.line + ':' + e.location.column + ')';
    var fileEl = document.createElement('div');
    fileEl.innerText = fileText;
    el.appendChild(fileEl);

    var codeEl = document.createElement('div');
    codeEl.innerText = e.location.lineText.trim();
    codeEl.style.color = 'black';
    codeEl.style.paddingLeft = '7px';
    el.appendChild(codeEl);

    var errorEl = document.createElement('div');
    errorEl.innerText = e.text.trim();
    errorEl.style.color = '#d40000';
    errorEl.style.paddingLeft = '7px';
    el.appendChild(errorEl);

    return el;
  }

  function renderErrors(errors) {
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.style.position = 'fixed';
      overlayEl.style.top = 0;
      overlayEl.style.left = 0;
      overlayEl.style.width = '100vw';
      overlayEl.style.height = '100vh';
      overlayEl.style.background = 'white';
      overlayEl.style.padding = '20px'; // enough space so chromes dev tools rules are not shadowing the content
      overlayEl.style.fontFamily = 'monospace';
      overlayEl.style.fontSize = '17px';
      overlayEl.style.zIndex = '1000000000';
      overlayEl.className = 'esbuild-dev-server-error-overlay';

      document.body.appendChild(overlayEl);
    }

    overlayEl.innerHTML = '';

    errors.forEach(function (errorObj) {
      overlayEl.appendChild(errorToEl(errorObj));
    });
  }

  function onLoad() {
    if (!window.SockJS /* || window.isEsbuildDevServerSetup*/) return;

    // NOTICE use this when you have more than one dependency script to init the logic only once
    //window.isEsbuildDevServerSetup = true

    var SockJS = window.SockJS;

    // listen for build results
    var origin = window.location.origin.replace(/\/+$/, '');
    console.log('## connecting ...', window.isEsbuildDevServerSetup);
    var connection = new SockJS(origin + '/esbuild');
    connection.onmessage = function (event) {
      var result = JSON.parse(event.data);
      console.log('## event', result);
      if (result.errors.length) {
        console.error('## error', result.errors.length);
        renderErrors(result.errors);
        // NOTICE don't reload page when an error is available. Esbuild
        // doesn't output any JS in this case and therefore this banner code
        // isn't inserted. You only see a white page.
        return;
      }
      window.location.reload();
    };
  }

  loadScript('https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js', onLoad);
})();
