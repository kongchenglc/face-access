import '@/gatekeeper.css'
import axios from 'axios'

const uploadBtn = document.querySelector('#file')
const submit = document.querySelector('#submit')
const img = document.getElementById("previewimg");
const status = document.getElementById('status')

const debounce = (fn, time) => {
  let timerId;
  return function(...args) {
      const functionCall = () => fn.apply(this, args);
      clearTimeout(timerId);
      timerId = setTimeout(functionCall, time);
  };
};

// 事件绑定
! function () {
  uploadBtn.addEventListener('change', event => {
    preview(event.target)
  })
  submit.addEventListener('click', debounce(upload, 1000))
}()

function preview(obj) {
  let file = document.getElementById('file').value; //获取文件
  let index = file.lastIndexOf('.'); //获取最后一位小数点
  let extension = file.substr(index + 1);
  let arr = ['jpeg', 'png', 'jpg', 'gif'];
  if (arr.indexOf(extension) !== -1) {
    img.src = window.URL.createObjectURL(obj.files[0]);
    let file = obj.files[0];
  } else {
    alert('请选择正确的图片格式');
    return false;
  }
}

function upload() {
  console.log(111111)
  axios.post(host_port + '/intelligentEntranceGuard/addUser.do', {
    imgBase64: getBase64Image(img),
    name: encodeURI(document.querySelector('input[name="name"]').value),
    sex: getSex(),
    identity: getIdentity(),
    doorId: document.querySelector('input[name="doorId"]').value,
    phone: document.querySelector('input[name="phone"]').value,
    message: document.querySelector('textarea[name="message"]').value,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(data => {
    console.log(data)
  }).catch(err => {
    console.log(err)
  })
}

function getSex() {
  return document.querySelector('input[name="sex"]').checked ?
    'man' :
    'women'
}

function getIdentity() {
  return document.querySelector('input[name="identity"]').checked ?
    true :
    false
}

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL
}


// websocket
let websocket = null
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
  alert(event.data)
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