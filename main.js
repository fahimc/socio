var WebMessenger = {
  webview: null,
  selected: null,
  collection: [],
  buttons: [],
  hangoutsTimeStamp:null,
  init: function () {
    document.addEventListener('DOMContentLoaded', this.onLoad.bind(this));
  },
  onLoad: function () {
    window.addEventListener('message', this.onMessage.bind(this));
    this.addListeners();
  },
  addListeners: function () {
    this.webview = document.querySelector('webview');
    var reload = document.querySelector('.reload');
    this.buttons = document.querySelectorAll('nav div');
    this.selected = this.buttons[0];

      reload.addEventListener('click', this.onReloadClick.bind(this));
    
    for (var a = 0; a < this.buttons.length; a++) {
    	if(!this.buttons[a].getAttribute('data-url'))return;
      this.buttons[a].addEventListener('click', this.onClick.bind(this));
      this.buttons[a].index = a;
      var webview = document.createElement('webview');
      webview.src = 'http://' + this.buttons[a].getAttribute('data-url');
      webview.setAttribute('index', a);
      webview.addEventListener('unresponsive', this.onUnresponsive.bind(this));
      // webview.addEventListener('loadabort', this.onUnresponsive.bind(this));
      this.collection.push({
        element: webview,
        url: webview.src,
        source: this.buttons[a].getAttribute('title'),
        title: null
      });
      this.addScript(webview, a);

      if (a === 0) webview.classList.add('show');
      document.body.appendChild(webview);
    }

    setInterval(this.onTimer.bind(this), 3000);
  },
  addScript: function (webview, index) {
    webview.addEventListener('contentload', function (event) {
      webview.executeScript({
        code: "window.INDEX =" + index + ";window.addEventListener('message', function(e){" +
          "  console.log('Received command:', e.data.command);" +
          "  if(e.data.command == 'getTitle'){" +
          "    console.log('Sending title...');" +
          "    e.source.postMessage({ title: document.title, url:document.URL,index:window.INDEX }, e.origin);" +
          "  }" + "});"
      });
    });
  },
  onTimer: function () {
    for (var a = 0; a < this.collection.length; a++) {
      var webview = this.collection[a].element;
      webview.contentWindow.postMessage({
        command: 'getTitle'
      }, '*');
    }
  },
  onUnresponsive: function (event) {
    event.srcElement.reload();
  },
  onReloadClick:function(event){
  	var webview = document.querySelector('[index="' + this.selected.index + '"]');
  	webview.reload();
  },
  onMessage: function (event) {
    var index = event.data.index;
    var item = this.collection[index];
    var regExp = /\(([^)]+)\)/;
    var matches = event.data.title.match(regExp);
    if (item.title !== event.data.title) {
      item.title = event.data.title;
      if (matches || event.data.title.indexOf('says') >= 0) {
      	if(item.source =='hangouts' && this.hangoutsTimeStamp)
      	{
      		var currentTime = new Date().getTime();
      		if(this.hangoutsTimeStamp - currentTime < 10000)
      			{
      				return;
      			}else{
      				this.hangoutsTimeStamp=null;
      			}

      	}else if(item.source == 'hangouts'){
      		this.hangoutsTimeStamp = new Date().getTime();
      	}

        this.addBubble(this.buttons[index], matches ? matches[1] : 1);
        if (Notification.permission !== 'granted') {
          Notification.requestPermission(function (permission) {
            if (permission === "granted") {
              this.notify("New Message", item.source);
            }
          });
        } else {
          this.notify("New Message", item.source);
        }
      } else {
        this.removeBubble(this.buttons[index]);
      }

    }
  },
  notify: function (title, body) {
    var options = {
      body: body,
      icon: 'assets/socio_icon.png'
    }
    var notification = new Notification(title, options);
    setTimeout(function () {
      notification.close();
    }, 1000);
  },
  onFocus: function () {
    console.log('focused');
  },
  onClick: function (event) {
    var elem = event.srcElement;
    var webview = document.querySelector('[index="' + elem.index + '"]');

    if (this.selected) {
      this.selected.classList.remove('selected');
      var previousWebview = document.querySelector('[index="' + this.selected.index + '"]');
      previousWebview.classList.remove('show');
    }
    webview.classList.add('show');
    elem.classList.add('selected');
    this.selected = elem;
  },
  addBubble: function (button, count) {
    var counter = button.querySelector('counter');
    counter.textContent = count;
    counter.classList.add('show');
  },
  removeBubble: function (button) {
    var counter = button.querySelector('counter');
    counter.textContent = '';
    counter.classList.remove('show');
  }
}

WebMessenger.init();

