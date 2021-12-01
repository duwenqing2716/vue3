<template>
	<div class="verity">
		<span>更换手机号</span>
		<van-row style="margin-top: 30px; cursor: pointer;">
		  <van-col span="12" @click='onOtherVerity'>
				<i class="iconfont icon-suo"></i>
				<p style="font-size: 17px;">原手机号已停用</p>
				<p style="font-size: 13px;">使用其他方式验证</p>
			</van-col>
		  <van-col span="12" style="border-left: 2px solid gray;" @click='onVerity'>
				<i class="iconfont icon-shouji"></i>
				<p style="font-size: 17px;">原手机号仍能够使用</p>
				<p style="font-size: 13px;">使用手机验证码验证</p>
			</van-col>
		</van-row>
	</div>
</template>

<script>
	import { Toast } from 'vant'
	export default{
		name:'VerityPopup',
		setup(props,context){
			
			const onOtherVerity = () => {
				Toast({
					message:'跳转第三方登录:QQ(不做此功能)'
				})
			}
			
			const onVerity = () => {
				//关闭页面打开另一个弹出
				context.emit('onClose')
			}
			return{
				onOtherVerity,
				onVerity
			}
		}
	}
</script>

<style lang="less" scoped>
	.verity{
		span{
			font-size: 22px;
			margin-top: 30px;
			display: block;
		}
		i{
			font-size: 40px;
			color: red;
			display: block;
			width: 60px;
			height: 60px;
			margin: 0 auto;
			border-radius: 50%;
			border: 2px solid red;
			line-height: 60px;
		}
	}
</style>
