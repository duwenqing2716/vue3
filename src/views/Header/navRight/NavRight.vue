<template>
	<div class="nav-right">
		<login></login>
		<div class="vip">
			<span>开通VIP</span>
		</div>
		<div class="icons">
			<i class="iconfont icon-yifu" @click="showPopup"></i>
			<i class="iconfont icon-shezhi"></i>
			<i class="iconfont icon-youjian" @click="showEmail">
			</i>
		</div>
	</div>
	<van-popover v-model:show="showPopover" v-if="showPopover" :overlay='true' :overlay-style="{backgroundColor:'transparent',zIndex:'1'}"  :show-arrow='false'
	 :offset=[90,-35] placement="bottom-end" style="width: 400px">
		<van-tabs v-model:active="active">
			<van-tab title="主题">
				<van-grid :column-num="3" :border='false'>
					<van-grid-item v-for="(item,index) in state.theme" @click='onSelected(index,item.bgc,0)'>
						<div class="logo" :style="{'background-color':item.bgc}">
							<i class="iconfont icon-wangyiyunyinle"></i>
							<p>{{item.text}}</p>
						</div>
						<div class='badgeIcon' v-show="isShowBadge === index">
							<i class="iconfont icon-zhengque"></i>
						</div>
					</van-grid-item>
				</van-grid>
			</van-tab>
			<van-tab title="纯色">
				<van-grid :column-num="6" :border='false'>
					<van-grid-item v-for="(item,index) in state.pureTheme" @click='onSelected(index,item.bgc,1)'>
						<div class="pure-color" :style="{'background-color':item.bgc}">
						</div>
						<div class='PureIcon' v-show="isShowPure === index">
							<i class="iconfont icon-zhengque"></i>
						</div>
					</van-grid-item>
				</van-grid>
			</van-tab>
		</van-tabs>
	</van-popover>
	<van-popover v-model:show="PopoverEmail" class="info" v-if="PopoverEmail" :offset=[182,-35] style="width: 420px;box-shadow:-2px 2px 10px lightgray" placement="bottom-end"  :overlay='true' :overlay-style="{backgroundColor:'transparent',zIndex:'1'}"  :show-arrow='false'>
		<info-comment></info-comment>
	</van-popover>
</template>

<script>
	//vue功能引入
	import {
		ref,
		reactive,
		onMounted
	} from 'vue'
	//组件引入
	import login from './childComps/login.vue'
	import infoComment from './childComps/infoComment.vue'
	//存储换肤数据
	import {
		setItem,
		getItem
	} from 'store/storage.js'
	export default {
		name: 'navRight',
		components: {
			login,
			infoComment
		},
		emits: ['changeColor'],
		setup(props, context) {
			const PopoverEmail = ref(false);
			const isShowBadge = ref(1)
			const isShowPure = ref(null)
			const showPopover = ref(false);
			const active = ref(0);
			const state = reactive({
				theme: [{
						bgc: '#222225',
						text: '酷炫黑'
					},
					{
						bgc: '#EC4141',
						text: '官方红'
					},
					{
						bgc: '#F896C0',
						text: '可爱粉'
					},
					{
						bgc: '#58B6FB',
						text: '天际蓝'
					},
					{
						bgc: '#F0B35C',
						text: '土豪金'
					},
					{
						bgc: '#54C576',
						text: '清新绿'
					},
				],
				pureTheme: [{
						bgc: '#F5F5F5'
					},
					{
						bgc: '#FF5C8A'
					},
					{
						bgc: '#FF7A9E'
					},
					{
						bgc: '#717FF9'
					},
					{
						bgc: '#4791EB'
					},
					{
						bgc: '#39AFEA'
					},
					{
						bgc: '#2BB669'
					},
					{
						bgc: '#6ACC19'
					},
					{
						bgc: '#E2AB12'
					},
					{
						bgc: '#FF8F57'
					},
					{
						bgc: '#FD726D'
					},
					{
						bgc: '#FD544E'
					}
				]
			})
			//点击渲染换肤组件，并将本地存储的theme解构传递
			const showPopup = () => {
				showPopover.value = !showPopover.value
				//判断本地是否有换肤值
				if (getItem('theme')) {
					const {
						index,
						theme,
						val
					} = getItem('theme')
					// console.log(index,theme,val)
					onSelected(index, theme, val)
					return
				}
			}
			//点击切换主题,更改下标和图标,并将主题存储与本地
			const onSelected = (index, theme, val) => {
				// console.log(index,theme)
				if (val) {
					isShowBadge.value = null
					isShowPure.value = index
				} else {
					isShowPure.value = null
					isShowBadge.value = index
				}
				//将换肤数据存储与本地，方便下次打开时调用更新
				setItem('theme', {
					theme: theme,
					index: index,
					val: val
				})
				//发射事件进行换肤通知
				context.emit('changeColor', {
					theme: theme,
					index: index,
					val: val
				})
			}
			
			const showEmail = () => {
				PopoverEmail.value = !PopoverEmail.value
			}

			return {
				showPopup,
				isShowBadge,
				showPopover,
				active,
				state,
				onSelected,
				isShowPure,
				PopoverEmail,
				showEmail
			};
		}
	}
</script>

<style lang="less" scoped="scoped">
	.nav-right{
		.vip{
			z-index: 1;
			cursor: pointer;
			span{
				display: inline-block;
				width: 60px;
				&:hover{
					font-weight: bold;
				}
			}
		}
	}
	.logo {
		width: 100px;
		height: 100px;
		border-radius: 10px;

		i {
			font-size: 50px;
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			background-image: -webkit-linear-gradient(top, #F7F7F8, #F2C7C6);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			z-index: 9;
		}

		p {
			font-size: 13px;
			color: aliceblue;
			text-align: center;
			line-height: 24px;
			margin-top: 75px;
			height: 24px;
			border-radius: 0 0 10px 10px;
			background-color: rgba(0, 0, 0, 0.2);
		}
	}

	.badgeIcon {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: red;
		position: absolute;
		bottom: 10px;
		right: 10px;

		i {
			font-size: 13px;
			color: white;
			font-weight: bold;
		}
	}

	.pure-color {
		width: 45px;
		height: 45px;
		border-radius: 6px;
	}

	.PureIcon {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background-color: red;
		position: absolute;
		bottom: 10px;
		right: 6px;

		i {
			font-size: 10px;
			color: white;
			display: block;
			line-height: 20px;
			font-weight: bold;
		}
	}

	.van-grid-item {
		cursor: pointer;
	}

	.nav-right {
		height: 100%;
		// width: 600px;
		display: flex;
		font-size: 14px;

		.icons {
			margin-left: 20px;
			z-index: 2;

			i {
				font-size: 28px;
				margin: 0 8px;
				cursor: pointer;
        opacity: 0.8;
				&:hover {
					opacity: 1;
				}
			}
		}
	}
</style>
