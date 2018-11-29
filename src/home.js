import '@/home.css';

let websocket = null;
let resolve = document.querySelector('.resolve')
let reject = document.querySelector('.reject')
let status = document.querySelector('.status')

//判断当前浏览器是否支持WebSocket
if ('WebSocket' in window) {
    websocket = new WebSocket("wss://192.168.43.99:8443/intelligentEntranceGuard/websocket");
} else {
    alert('当前浏览器 Not support websocket')
}
//连接发生错误的回调方法
websocket.onerror = function () {
    setMessageInnerHTML("WebSocket连接发生错误");
};
//连接成功建立的回调方法
websocket.onopen = function () {
    setMessageInnerHTML("WebSocket连接成功");
}
//接收到消息的回调方法
websocket.onmessage = function (event) {
    console.log(event.data);
    let doorImg = document.querySelector('#doorImg')
    doorImg.src = event.data
}
//连接关闭的回调方法
websocket.onclose = function () {
    setMessageInnerHTML("WebSocket连接关闭");
}
//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
    closeWebSocket();
}
//将消息显示在网页上
function setMessageInnerHTML(data) {
  status.innerHTML = data
}
//关闭WebSocket连接
function closeWebSocket() {
    websocket.close();
}

resolve.addEventListener('click', e => {
  websocket.send('access')
})
reject.addEventListener('click', e => {
  websocket.send('reject')
})