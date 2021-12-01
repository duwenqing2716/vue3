<template>
	<div class="preview">
		<span>上传头像</span>
		<div class="preview-photos">
		<div class="container">
			<div class="img-container">
				<img :src="image" ref="photo" alt=""> 
			</div>
		</div>
		<div class="preview-right">
			<div class="biger"></div>
			  <p>大尺寸封面</p>
			<div class="before"></div>
			  <p>小尺寸封面</p>
		  </div>
		</div>
		<div class="img-submit">
			<input type="file" ref='file' hidden="hidden" accept="image/*" @change="onFileChange">
			<button @click="file.click()">重新选择</button>
			<button @click="onConfirm">保存并关闭</button>
		</div>
	</div>
</template>

<script>
	//vue功能引入
	import { ref,onMounted,nextTick } from 'vue'
	//第三方插件引入
	import Cropper from 'cropperjs'
	import 'cropperjs/dist/cropper.css'
	//组件库引入
	import { Toast } from 'vant'
	//本地存储引入
	import { setItem } from 'store/storage.js'
	//接口引入
	import { updatedAvatar } from 'network/useDetail.js'
	//vuex功能引入
	import { useStore } from 'vuex'
	export default {
		name: 'imgPreview',
		props: {
			previewImage: {
				type: [Object, String],
				required: true,
				default () {
					return {}
				}
			},
			imgSize:{
				type:Number,
				required:true,
				default(){
					return null
				}
			}
		},
		setup(props, context) {
			const store = useStore()
			
			const image = ref(null);
			const cropper = ref(null);
			const photo = ref(null);
			const file = ref(null);
			const imgSize = ref(props.imgSize);
			
			//点击重新选择图片时，将该组件初始化
			const onFileChange = () => {
				let files = file.value.files[0]
				//监听图片修改选择
				let img = new Image();
				img.src = window.URL.createObjectURL(files)
				img.onload = function() {
					// console.log("宽：" + img.naturalWidth + " 高：" + img.naturalHeight);
					if(img.naturalWidth<320 || img.naturalHeight<320){
						Toast({
							message:'请重新选择分辨率超过320*320大小的图片',
							position:'top'
						})
						//清空value，防止相同文件不触发事件
						files.value = ''
						return 
					}
					imgSize.value = img.naturalWidth
					//发送事件保存销毁前的参数
					context.emit('onRemark',files,imgSize.value)
				}
			}
			//确认修改头像数据
			const onConfirm = async() => {
				Toast.loading({
					message: '保存中',
					forbidClick: true,
					duration: 0
				})		
				//转为blob对象,设置大小,以及图片类型
				const onGetCroppedCanvas = () => {
					return new Promise( resolve => {
						cropper.value.getCroppedCanvas().toBlob( blob => {
							// console.log(blob)
							resolve(blob)
						})
					})
				}
				const file = await onGetCroppedCanvas()
				//将图片裁剪数据放与formData中让后端自行获取
			  const formData = new FormData()			
			  let fileData = file
			  formData.append('imgFile', fileData)
				
				//此处为偏移数据设置,网易云后端默认自动获取formData.get('imgFile'),因此不多做计算
			  // const CropperData = cropper.value.cropBoxData
				// let rate = imgSize.value/193.6
				// let imgY = Math.round((Math.round(CropperData.maxTop/2)-Math.round(CropperData.top))*rate)
				// let imgX = Math.round((Math.round(CropperData.left)-Math.round(CropperData.maxLeft/2))*rate)
				// console.log(rate,imgX,imgY)
				
				//头像修改
				const res = await updatedAvatar(imgSize.value,0,0,Date.now(),formData)
				console.log(res)
				if(res.code!=200){
					let message = ''
					message = res.message
					Toast.fail({
						message:message,
						position:'top'
					})
				}else{
					Toast.success({
						message:'修改成功!',
						position:'top'
					})
					//通过取消和设置登录状态实现页面更新
					let imgUrl = res.data.url
					setItem('cloudMusicAvatar',imgUrl)
					store.commit('changeLoginStatus', '')
					nextTick(()=>{
						store.commit('changeLoginStatus', true)
					})
					//更新页面头像数据并关闭页面
					context.emit('update-photo',window.URL.createObjectURL(fileData))
				}
			}
			//挂载时获取图片信息
			const init = () => {
				image.value = window.URL.createObjectURL(props.previewImage),
				//在下一个周期进行渲染
				nextTick(()=>{
					cropper.value = new Cropper(photo.value, {
					  viewMode: 1,//cropper的视图模式
					  dragMode: 'none',//底部不可移动
					  initialAspectRatio: 1,
					  aspectRatio: 1,
					  preview: '.before,.biger',//预览区域
					  background: false,//背景透明或者显示底色
					  autoCropArea: 0.95,//选中区域大小
						cropBoxResizable: false,//选中部分不可改变大小
					  zoomOnWheel: false,//不可使用鼠标滚轮
					})
				})
			}

			onMounted(() => {
				init()
			})

			return {
				photo,
				file,
				cropper,
				image,
				onFileChange,
				onConfirm,
				imgSize
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.preview {
		width: 500px;
		height: 500px;
		.preview-photos{
			width: 90%;
			margin: 40px 25px;
			display: flex;
			.container{
			  display: flex;
				.img-container{
				  height: 240px;
					width: 240px;
					border: 1px solid black;
				  overflow: hidden;
					img{
						max-width: 100%;
					}
				}
			}
			.before{
			  width: 75px;
			  height: 75px;
				border-radius: 8px;
			  overflow: hidden;
				border:1px solid black;
			}
			.biger{
				width: 100px;
				height: 100px;
				border-radius: 8px;
				overflow: hidden;
				border:1px solid black;
			}
			div{
				flex: 1;
				margin: 0 10px;
				p{
					font-size: 14px;
					display: block;
					margin-top: 8px;
					margin-left: -60px;
				}
			}
		}
		
		span {
			display: block;
			font-weight: bold;
			font-size: 20px;
			margin-top: 40px;
		}

		.img-submit {
			margin-top: 80px;
			font-size: 14px;

			button {
				width: 100px;
				height: 40px;
				border-radius: 24px;
				border: none;
				background-color: transparent;
				cursor: pointer;
				margin: 0 20px;

				&:hover {
					background-color: rgba(125, 125, 125, 0.1);
				}

				&:nth-child(2) {
					color: black;
					border: 1px solid rgba(125, 125, 125, 0.8);
				}

				&:nth-child(3) {
					background-color: pink;
					color: white;

					&:hover {
						background-color: hotpink;
					}
				}
			}
		}
	}
</style>
