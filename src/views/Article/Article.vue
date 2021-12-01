<template>
	<div class="article">
		<updated-profile></updated-profile>
	</div>
</template>

<script>
	import updatedProfile from 'components/content/profile/updatedProfile.vue'
	
	export default{
		name:'Article',
		props:{
			
		},
		components:{
			updatedProfile,
		},
		setup(){
			
			return {
				
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.article{
		width: 80%;
		margin-left: calc(20%);
		height: 600px;
		position: absolute;
		z-index: 2;
	}
</style>
