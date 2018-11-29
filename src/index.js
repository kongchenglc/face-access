import '@/index.css';
import axios from 'axios'

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let body = document.body

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
	console.log(stream);

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

// 轮询发送图片
(function () {
	// setInterval(() => {
	// 	axios.post(host_port + '/intelligentEntranceGuard/parserPhoto.do', {
	// 		faceBase64: getFaceBase64()
	// 	}, {
	// 		headers: {
	// 			'Content-Type': 'application/x-www-form-urlencoded'
	// 		}
	// 	}).then(data => {
	// 		console.log(data)
	// 	}).catch(err => {
	// 		console.log(err)
	// 	})
	// }, 5000)
})()




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
		axios.post(host_port + '', {})
		console.log(nums)
	}
})

// 呼叫保卫处
callGatekeeper.addEventListener('click', event => {
	console.log('call for gatekeeper!')
})