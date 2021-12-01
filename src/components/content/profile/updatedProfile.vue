<template>
	<div class="updated">
		<p>编辑个人信息</p>
		<div class="updatedMsg">
			<div class="updatedMsg-left">
				<div class="nickname">
					<span>昵称:</span>
					<input type="text" v-model="nickname" placeholder="昵称不少于4个英文或2个汉字" maxlength="30">
					<!-- <span>asdasd</span> 此处为需完善的功能，增加正则匹配实现报错功能-->
				</div>
				<div class="introduction">
					<span class="initMsg">介绍:</span>
					<textarea placeholder="介绍不超过300字" maxlength="300" v-model="text"></textarea>
				</div>
				<div class="sex">
					<span>性别:</span>
					<input type="radio" name='sex' value="0" v-model="radio">保密
					<input type="radio" name='sex' value="1" v-model="radio">男
					<input type="radio" name='sex' value="2" v-model="radio">女
				</div>
				<div class="birthday">
					<span>生日:</span>
					<select name="" id="" v-model="yearValue">
						<option :value="1900+index" v-for="(item,index) in currentYear">{{1900+index}}年</option>
					</select>
					<select name="" id="" v-model="monthValue">
						<option :value="index+1" v-for="(item,index) in 12">{{index+1}}月</option>
					</select>
					<select name="" id="" v-model="dayValue">
						<option :value="index+1" v-for="(item,index) in currentDay">{{index+1}}日</option>
					</select>
				</div>
				<div class="area">
					<span>地区:</span>
					<select name="" id="" v-model="province" @click="changeProvince">
						<option :value="index" v-for="(item,index) in areaList.province_list">{{item}}</option>
					</select>
					<select name="" id="" v-model="city">
						<option :value="index" v-for="(item,index) in cityList">{{item}}</option>
					</select>
				</div>
			</div>
			<div class="updatedMsg-right">
				<img :src="avatar + '?param=130y130'" alt="">
				<button @click="file.click()">修改头像</button>
				<input type="file" ref='file' hidden="hidden" accept="image/*" @change="onFileChange">
			</div>
		</div>
		<div class="submitBtn">
			<button @click="onSave">保存</button>
			<button @click="onCancel">取消</button>
		</div>
	</div>
	<van-popup v-model:show="show" v-if="show" :close-on-click-overlay='false'>
		<img-preview :previewImage='previewImage' @onRemark='onRemark' :imgSize='imgSize' @updatePhoto='updatePhoto'></img-preview>
	</van-popup>
</template>

<script>
	//地区数据引入
	import {
		areaList
	} from '@vant/area-data';
	//vue功能引入
	import {
		ref,
		watch,
		onMounted,
		nextTick
	} from 'vue';
	//接口引入
	import {
		getUserDetail,
		getUserCount,
		updatedInfoMsg
	} from 'network/useDetail.js'
	//vuex功能引入
	import {
		useStore
	} from 'vuex'
	//组件引入
	import imgPreview from './imgPreview.vue'
	//组件库引入
	import {
		Toast,
		Dialog
	} from 'vant'
	//本地存储功能引入
	import {
		setItem
	} from 'store/storage.js'
	
	export default {
		name: 'updatedProfile',
		components: {
			imgPreview
		},
		setup() {
			const store = useStore()

			const nickname = ref('');
			const date = new Date();
			const avatar = ref(null);
			const yearValue = ref(null);
			const monthValue = ref(null);
			const dayValue = ref(null);
			const radio = ref(0);
			const currentYear = ref(122);//动态设置可选年份区间
			const currentDay = ref(29);//动态设置可选日期区间
			//后端会自动定位登录时地址无需设置默认值 可直接使用null
			const province = ref(510000);
			const city = ref(510300);
			const cityList = ref({});//动态设置市级数据
			const text = ref('');
			const show = ref(false);
			const file = ref(null);
			const previewImage = ref({});
			const isShowAvatar = ref(true);
			const imgSize = ref(null);
			//展示弹出头像修改层
			const showPopup = () => {
				show.value = true
			};
			//初始化头像修改层并传递数据
			const onRemark = (val, size) => {
				show.value = false
				//下一个周期渲染,否则将不会初始化成功
				nextTick(() => {
					previewImage.value = val
					imgSize.value = size
					showPopup()
				})
			}
			//选择图片
			const onFileChange = () => {
				let files = file.value.files[0]
				let img = new Image();
				img.src = window.URL.createObjectURL(files)
				img.onload = function() {
					console.log("宽：" + img.naturalWidth + " 高：" + img.naturalHeight);
					// 判断图片分辨率
					if (img.naturalWidth < 320 || img.naturalHeight < 320) {
						Toast({
							message: '请选择分辨率超过320*320大小的图片',
							position: 'top'
						})
						//清空value，防止相同文件不触发事件
						files.value = ''
						return
					}
					//获取宽度 传递数据操作多余,浪费内存空间,后端只从formDta中取数据而且未进行优化,就算后端未设置在imgPreview页面cropper中也能直接获取 img.naturalWidth
					imgSize.value = img.naturalWidth
					// console.log(typeof imgSize.value,'类型')
					previewImage.value = files
					showPopup()
				}
			}
			//修改头像关闭修改层,并通知登录处进行数据更新
			const updatePhoto = (val) => {
				avatar.value = val
				show.value = false
			}
			//修改个人信息数据提交 保存按钮
			const onSave = async () => {
				Toast.loading({
					message: '保存中',
					forbidClick: true,
					duration: 0
				})
				//获取生日并设置为时间戳
				let strtime = yearValue.value + '/' + monthValue.value + '/' + dayValue.value
				let date = new Date(strtime)
				var time = date.getTime()
				//格式: gender,signature,city,nickname,birthday,province
				const res = await updatedInfoMsg(radio.value, text.value, city.value, nickname.value, time, province.value)
				if (res.code != 200) {
					let message = ''
					message = res.message
					Toast.fail({
						message: message,
						position: 'top'
					})
				} else {
					Toast.success({
						message: '修改成功!',
						position: 'top'
					})
					//通过取消和设置登录状态实现页面更新
					setItem('cloudMusicNickname', nickname.value)
					store.commit('changeLoginStatus', '')
					nextTick(() => {
						store.commit('changeLoginStatus', true)
					})
				}
			}
			//取消按钮
			const onCancel = () => {
				Dialog.confirm({
						title: '数据修改操作',
						message: '是否需要保存修改数据后再离开?',
						confirmButtonText: '保存',
						confirmButtonColor: 'red'
					})
					.then(() => {
						//保存修改数据
						onSave()
					})
					.catch(() => {
						//取消
					});
			}
			//挂载时初始化默认地区,请求用户数据
			onMounted(async () => {
				const uid = store.getters.getUserId
				const data = await getUserCount(Date.now())
				// console.log(data)
				nextTick(() => {
					// console.log(data)
					nickname.value = data.profile.nickname //昵称
					avatar.value = data.profile.avatarUrl //头像
					text.value = data.profile.signature //签名
					radio.value = data.profile.gender //性别
					const date = new Date(data.profile.birthday) //生日时间戳
					monthValue.value = date.getMonth() + 1
					dayValue.value = date.getDate()
					yearValue.value = date.getFullYear()
					// console.log(yearValue.value)
					province.value = data.profile.province //省份数据
					let str = province.value + ''
					str = str.slice(0, 2)
					//获取到省份数据自动变化相应的市级数据
					cityListInfo(str)
					// console.log(cityList.value)
					city.value = data.profile.city
				})
				//默认数据 可能网易云后端有设置默认值 操作多余
				// cityListInfo(51)
				// console.log(cityList.value)
			})
			//市级联级封装  网易云使用的地区数据和此处地区数据有些出入 因此在获取特别行政区数据时出现空白
			const cityListInfo = (val) => {
				let o = {};
				for (let i in areaList.city_list) {
					if (i.slice(0, 2) == val) {
						o[i] = areaList.city_list[i];
					}
				}
				cityList.value = o
			}
			//当数据发生变化时,市级跟着省级变化，默认显示第一个市
			const changeProvince = () => {
				watch(province, (newValue, oldValue) => {
					const str = newValue.slice(0, 2)
					cityListInfo(str)
					city.value = str + '0100'
					// console.log(cityList.value)
				})
			}

			watch([yearValue, monthValue], (newValue, oldValue) => {
				var day = new Date(newValue[0], newValue[1], 0);
				currentDay.value = day.getDate()
			})

			return {
				imgSize,
				file,
				previewImage,
				show,
				showPopup,
				onFileChange,
				avatar,
				yearValue,
				monthValue,
				dayValue,
				nickname,
				radio,
				areaList,
				currentYear,
				currentDay,
				province,
				cityList,
				city,
				text,
				changeProvince,
				isShowAvatar,
				onRemark,
				updatePhoto,
				onSave,
				cityListInfo,
				onCancel
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.updated {
		p {
			font-size: 25px;
			font-weight: bold;
			position: absolute;
			left: 40px;
			top: -5px;
		}

		.updatedMsg {
			display: flex;
			margin-left: 20px;

			div {
				flex: 1;
				margin: 40px 0;
			}

			.updatedMsg-left {
				font-size: 18px;

				div {
					position: absolute;
					left: 40px;
				}

				.nickname {
					margin-top: 60px;

					input {
						width: 500px;
						height: 35px;
						margin-left: 40px;
						font-size: 14px;
					}
				}

				.introduction {
					margin-top: 150px;

					span {
						position: absolute;
						top: 0;
					}

					textarea {
						resize: none;
						width: 500px;
						height: 120px;
						margin-left: 80px;
						font-size: 14px;
					}
				}

				.sex {
					margin-top: 330px;

					input {
						margin-left: 40px;
					}
				}

				.birthday {
					margin-top: 410px;

					select {
						width: 145px;
						height: 35px;
						margin-left: 40px;
						border-radius: 8px;
						padding-left: 8px;
						background-color: transparent;
						border: 1px solid rgba(125, 125, 125, 0.8);
					}
				}

				.area {
					margin-top: 500px;

					select {
						width: 145px;
						height: 35px;
						margin-left: 40px;
						border-radius: 8px;
						padding-left: 8px;
						background-color: transparent;
						border: 1px solid rgba(125, 125, 125, 0.8);
					}
				}
			}

			.updatedMsg-right {
				height: 400px;
				margin-top: 100px;

				img {
					width: 128px;
					height: 128px;
					border: 1px solid black;
				}

				button {
					display: block;
					width: 100px;
					height: 40px;
					margin-top: 20px;
					margin-left: calc(50% - 50px);
					border-radius: 24px;
					border: none;
					background-color: transparent;
					cursor: pointer;
					border: 1px solid rgba(125, 125, 125, 0.8);

					&:hover {
						background-color: rgba(125, 125, 125, 0.1);
					}
				}

			}
		}

		.submitBtn {
			margin-top: 70px;

			button {
				width: 100px;
				height: 40px;
				border-radius: 24px;
				border: none;
				background-color: transparent;
				cursor: pointer;
				font-weight: bold;
				margin: 0 20px;

				&:hover {
					background-color: rgba(125, 125, 125, 0.1);
				}

				&:nth-child(1) {
					background-color: pink;
					color: white;

					&:hover {
						background-color: hotpink;
					}
				}

				&:nth-child(2) {
					border: 1px solid rgba(125, 125, 125, 0.8);
				}
			}
		}
	}
</style>
