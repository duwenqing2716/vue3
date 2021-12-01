:<template>
	<div class="updatePwd">
    <span>修改密码</span>
    <p>您的手机号为:{{cell}}</p>
		<input type="password" v-model="pwd" ref='pass' placeholder="设置新的登录密码,密码8-20位,至少包含字母/数字/字符2种组合">
		<div class='nextStep'>
		    <button @click="onConfirm">下一步</button>
				<button @click="onCancel">取消</button>
		</div>
	</div>
</template>

<script>
	import { ref,onMounted,nextTick } from 'vue'
	import { Toast } from 'vant'
	export default {
		name:'updatedPwd',
		props:{
			cellPhone:{
				type:String,
				required:true,
				default(){
					return ''
				}
			}
		},
		setup(props,context){
			const cell = ref(null);
			const pwd = ref('');
			const pass = ref(null);
			
			const onCancel = () => {
				context.emit('onClose')
			}
			
			const onConfirm = () => {
				if(!pwd.value){
					// console.log('验证码为空')
					Toast({
						message:'请输入密码',
						position: 'top'
					})
					 pass.value.focus()
					return
				}
				if (!/(?!\d+$)(?!^[A-Za-z]+$)(?!^[_#@]+$).{8,20}/.test(pwd.value)) {
				  Toast({
				    message: '设置密码格式错误!',
				    position: 'top'
				  })
				  pass.value.focus()
				  return 
				}
				context.emit('onUpdate',pwd.value)
			}
			
			onMounted(()=>{
				cell.value = props.cellPhone.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
			})
			return {
				onCancel,
				onConfirm,
				cell,
				pwd,
				pass
			}
		}
	}
</script>

<style scoped lang="less">
  .updatePwd{
		span{
			font-size: 22px;
			margin-top: 30px;
			display: block;
		}
		p{
			text-align: left;
			margin-top:20px;
			margin-left: 40px;
			font-size: 14px;
		}
		input{
			width: 80%;
			height: 35px;
			margin-top: 10px;
			margin-left: -25px;
			border-radius: 8px;
			border: 1px solid gray;
			padding-left: 10px;
		}
		.nextStep {
			margin-top: 26px;
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