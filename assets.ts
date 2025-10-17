export const webviewCSS = `
body.hide-header {
  --g-header-height: 0px;
}

.n-scrollbar-container .n-scrollbar-content .n-alert-body.n-alert-body--bordered {
  display: none
}

.n-scrollbar-container .n-scrollbar-content .n-alert__border {
  display: none
}


body {
  user-select: none;
}

body::selection {
  background-color: rgba(237, 228, 254, 1);
}

body.theme-dark::selection {
  background-color: rgba(53, 42, 94, 1);
}


#chat-content {
  -webkit-user-select: text;
  user-select: text;
}

.n-layout--static-positioned.selectable {
  -webkit-user-select: none;
}

span.clickable.flex.items-center:hover {
  color: #b1a4fd;
}

body.theme-light .hljs::selection, body.theme-light .hljs ::selection {
  background-color: rgba(237, 228, 254, 1) !important;
  color: inherit !important;
}

body.theme-dark .hljs::selection, body.theme-dark .hljs ::selection {
  background-color: rgba(77, 64, 127, 0.8) !important;
}

.n-message-container.n-message-container--top {
  top: 55px !important;
}

.global-header{
  border-bottom: 0px solid var(--g-border-color);
}

/*冗余滚动条*/
.chat-box .chat-items::-webkit-scrollbar {
  display: none;
}

.n-loading-bar-container{
  display: none;
}

body.hide-menu .mobile-global-menu{
  display:none
}
`

export const webviewScripts = `
function waitForChatContainer() {
  const path = window.location.pathname
  switch (path) {
    case '/chat':
      break
    case '/draw':
      window.ReactNativeWebView.postMessage('状态栏颜色白')
      document.body.classList.add('hide-header')
      window.RN_has = false
      return
    case '/me/profile':
      window.ReactNativeWebView.postMessage('状态栏颜色白')
      document.body.classList.remove('hide-header')
      window.RN_has = false
      return
    default:
      window.ReactNativeWebView.postMessage('状态栏颜色青')
      document.body.classList.add('hide-header')
      window.RN_has = false
      return
  }


  if (window.RN_has) {return}
  
  if(window.HasFindHeader){
    window.ReactNativeWebView.postMessage('状态栏颜色白')
  }

  document.body.classList.add('hide-header')
  window.RN_has = true
  let isFindHeader = false
  console.log('[太极Ai] 等待容器加载...')
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (!isFindHeader && !window.HasFindHeader) {
        const header = document.body.querySelector('.global-header')
        if (header) {
          isFindHeader = true
          console.info('[太极Ai] 找到全局头部，继续监听容器加载...')
          window.ReactNativeWebView.postMessage('找到全局头部')
          window.HasFindHeader = true
        }
        // 优化性能,大幅较少 querySelector 运行次数
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const input = node.querySelector('.chat-input-box textarea.n-input__textarea-el')
          if (input) {
            // 绑定事件委托
            window.ReactNativeWebView.postMessage('已绑定事件委托')
            input.onfocus = () => {window.ReactNativeWebView.postMessage('输入框聚焦')}
            input.onblur = () => {window.ReactNativeWebView.postMessage('输入框失焦')}
            observer.disconnect() // 找到容器后停止监听
            console.log('[太极Ai] 容器已加载，停止全局观察器')
            return
          }
        }
      }
    }
  })

  // 监听整个 body，只在首次找到容器时启用事件委托
  observer.observe(document.body, { childList: true, subtree: true })
  
  if(!window.HasLoadedCSS) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = \`${ webviewCSS }\`;
    document.body.appendChild(style);
    window.HasLoadedCSS = true
    window.ReactNativeWebView.postMessage('CSS注入成功')
  }
}

waitForChatContainer()
`
export const notice = `
function close_notice() {
  const userStore = JSON.parse(localStorage.getItem('userStore'))

  userStore.sys.userNotifyClose = { ctime: 2760371199999 }
  localStorage.setItem('userStore', JSON.stringify(userStore))
}

close_notice()
`
