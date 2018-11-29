import '@/index.css';
import defaultImg from '@/static/personPic.jpg'
import axios from 'axios'

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvas2 = document.getElementById('canvas2');
const messageCard = document.querySelector('#message');
const keyboardCard = document.querySelector('#keyboard');
const personMsgName = document.querySelector('.msg-name')
const personMsgDoorId = document.querySelector('.msg-door')
const status = document.querySelector('#status')
const context = canvas.getContext('2d');
const context2 = canvas2.getContext('2d');
const body = document.body

//访问用户媒体设备的兼容方法
function getUserMedia(constraints, success, error) {
	if (navigator.mediaDevices.getUserMedia) {
		//最新的标准API
		navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
	} else if (navigator.webkitGetUserMedia) {
		//webkit核心浏览器
		navigator.webkitGetUserMedia(constraints, success, error)
	} else if (navigator.mozGetUserMedia) {
		//firfox浏览器
		navigator.mozGetUserMedia(constraints, success, error);
	} else if (navigator.getUserMedia) {
		//旧版API
		navigator.getUserMedia(constraints, success, error);
	}
}

function success(stream) {
	//兼容webkit核心浏览器
	let CompatibleURL = window.URL || window.webkitURL;
	//将视频流设置为video元素的源

	//video.src = CompatibleURL.createObjectURL(stream);
	video.srcObject = stream;
	video.play();
}

function error(error) {
	console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
}

// 全屏处理 & 按比例计算偏移量
let offsetX = 0,
	offsetY = 0
body.style.width = '100vw'
body.style.height = '100vh'
if (body.offsetWidth * 480 < (body.offsetHeight * 640)) {
	video.style.height = '100vh'
	offsetX = (body.offsetHeight * 64 / 48 - body.offsetWidth) / 2
} else {
	video.style.width = '100vw'
	offsetY = (body.offsetWidth * 48 / 64 - body.offsetHeight) / 2
}

// 访问摄像头，显示到video
if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
	//调用用户媒体设备, 访问摄像头
	getUserMedia({
		video: {}
	}, success, error);
} else {
	alert('不支持访问用户媒体');
}

// 获取头像位置图片base64
function getFaceBase64() {
	let facePic = document.querySelector('#faceCover')
	// 视频帧宽和帧高： 640 480
	let scaleW = 640 / video.offsetWidth,
		scaleH = 480 / video.offsetHeight
	canvas.width = facePic.offsetWidth
	canvas.height = facePic.offsetHeight
	// 绘制头像到canvas
	context.drawImage(video, (facePic.offsetLeft + offsetX) * scaleW, (facePic.offsetTop + offsetY) * scaleH, facePic.offsetWidth * scaleW, facePic.offsetHeight * scaleH, 0, 0, facePic.width, facePic.height);

	return canvas.toDataURL("image/png")
}

let intervalId = loopUpload()
// 轮询发送图片
function loopUpload() {
	console.log('loopUploadloopUploadloopUpload')
	clearInterval(intervalId)
	return setInterval(() => {
		axios.post(host_port + '/intelligentEntranceGuard/parserPhoto.do', {
			faceBase64: getFaceBase64()
		}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).then(data => {
			if (data.data.base64) {
				accessSuccess(data.data)
			} else {
				intervalId = loopUpload()
			}
		}).catch(err => {
			intervalId = loopUpload()
			console.log(err)
		})
	}, 3000);
}

let timeoutId = null
//识别成功
function accessSuccess(data) {
	console.log('successsuccesssuccess')
	clearTimeout(timeoutId)
	pic.src = data.base64
	personMsgName.innerHTML = data.name
	personMsgDoorId.innerHTML = data.doorId
	keyboardCard.style.display = 'none'
	messageCard.style.display = 'block'
	status.innerHTML = '正在开门...'
	timeoutId = setTimeout(() => {
		personMsgName.innerHTML = ''
		personMsgDoorId.innerHTML = ''
		keyboardCard.style.display = 'block'
		messageCard.style.display = 'none'
		status.innerHTML = ''
		pic.src = defaultImg
		intervalId = loopUpload()
	}, 4000);
}

// 用户交互
let inputBoard = document.querySelector('#board'),
	output = document.querySelector('#output'),
	cleanButton = document.querySelector('.clean'),
	callButton = document.querySelector('.call'),
	callGatekeeper = document.querySelector('#gatekeeper')

inputBoard.addEventListener('click', event => {
	if (event.target.className === 'col' && output.innerText.length < 5) {
		output.innerText += Number(event.target.innerText)
	}
})

cleanButton.addEventListener('click', event => {
	output.innerHTML = '&nbsp;'
})

// 呼叫业主
callButton.addEventListener('click', event => {
	let nums = output.innerText.split('')
	nums.shift()

	if (nums.length === 4) {
		let imgBase64 = getVideoImg()
		axios.post(host_port + '/intelligentEntranceGuard/call.do', {
			doorId: nums.join(''),
			base64: imgBase64
		}).then(data => {
			if (data.data.base64) {
				accessSuccess(data.data)
			}
		}).catch(err => {
			console.log(err)
		})
	} else {
		alert('输入门牌号')
	}
})

function getVideoImg() {
	console.log(canvas2.toDataURL("image/png"))
	context2.drawImage(video, 0, 0, canvas2.width, canvas2.height);
	return canvas2.toDataURL("image/png")
}

// 呼叫保卫处
callGatekeeper.addEventListener('click', event => {
	console.log('call for gatekeeper!')
})



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
	setMessageInnerHTML(event.data);
	if (event.data === 'access') {
		alert('正在开门。。。')
	} else if (event.data === 'reject') {
		alert('对方拒绝进入！')
	}
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
	console.log(data)
}
//关闭WebSocket连接
function closeWebSocket() {
	websocket.close();
}