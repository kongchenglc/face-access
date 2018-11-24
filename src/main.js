import '@/main.css';

//访问用户媒体设备的兼容方法
function getUserMedia(constraints, success, error) {
	if (navigator.mediaDevices.getUserMedia) {
		//最新的标准API
		navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
	} else if (navigator.webkitGetUserMedia) {
		//webkit核心浏览器
		navigator.webkitGetUserMedia(constraints,success, error)
	} else if (navigator.mozGetUserMedia) {
		//firfox浏览器
		navigator.mozGetUserMedia(constraints, success, error);
	} else if (navigator.getUserMedia) {
		//旧版API
		navigator.getUserMedia(constraints, success, error);
	}
}

let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let body = document.body

body.style.width = '100vw'
body.style.height = '100vh'

body.offsetWidth * 480 < (body.offsetHeight * 640)
? (video.style.height = '100vh')
: (video.style.width = '100vw')


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

if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
	//调用用户媒体设备, 访问摄像头
	getUserMedia({video : {width: 1000, height: 1000}}, success, error);
} else {
	alert('不支持访问用户媒体');
}

document.getElementById('capture').addEventListener('click', function () {
	context.drawImage(video, 0, 0, 480, 320);      
})