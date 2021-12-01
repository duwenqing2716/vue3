<template>
	<div class="search-suggest">
		<p>搜<span>'{{searchText}}'</span>相关的结果></p>
		<van-cell class="suggest-title" v-if="state.songs">
		  <!-- 使用 title 插槽来自定义标题 -->
		  <template #title>
				<i class="iconfont icon-yinfu"></i>
		    <span class="custom-title">单曲</span>
		  </template>
		</van-cell>
		<van-cell  v-if="state.songs" v-for="(item,index) in state.songs" class="suggest-list">
		<template #title>
		  <span v-html="highlight(item.name)"></span>-
			<span v-html="highlight(item.artists[0].name)"></span>
		</template>
		</van-cell>
		<van-cell class="suggest-title"  v-if="state.artists">
		  <!-- 使用 title 插槽来自定义标题 -->
		  <template #title>
				<i class="iconfont icon--singer"></i>
		    <span class="custom-title">歌手</span>
		  </template>
		</van-cell>
		<van-cell  v-if="state.artists" v-for="(item,index) in state.artists"  class="suggest-list">
      <template #title>
			  <span v-html="highlight(item.name)"></span>
			</template>
		</van-cell>
		<van-cell class="suggest-title"  v-if="state.albums">
		  <!-- 使用 title 插槽来自定义标题 -->
		  <template #title>
				<i class="iconfont icon-zhuanji"></i>
		    <span class="custom-title">专辑</span>
		  </template>
		</van-cell>
		<van-cell v-if="state.albums" v-for="(item,index) in state.albums"  class="suggest-list">
		<template #title>
		  <span v-html="highlight(item.name)"></span>-
			<span v-html="highlight(item.artist.name)"></span>
		</template>
		</van-cell>
		<van-cell class="suggest-title" v-if="state.playlists">
		  <!-- 使用 title 插槽来自定义标题 -->
		  <template #title>
				<i class="iconfont icon-gedan"></i>
		    <span class="custom-title">歌单</span>
		  </template>
		</van-cell>
		<van-cell v-if="state.playlists" v-for="(item,index) in state.playlists"  class="suggest-list">
			<template #title>
			  <span v-html="highlight(item.name)"></span>
			</template>
		</van-cell>
	</div>
</template>

<script>
	//vue功能引入
	import {
		watch,
		watchEffect,
		onMounted,
		reactive
	} from 'vue';
	//接口引入
	import {
		_searchSuggest
	} from 'network/search.js'
	
	export default{
		name:'searchResult',
		props:{
			searchText:{
				type:String,
				required:true,
				default(){
					return ''
				}
			}
		},
		setup(props){
			const state = reactive({
				albums: [], //专辑列表
				artists: [], //歌手列表
				playlists: [], //歌单列表
				songs: [], //单曲列表
				musicList: [], //歌曲列表，单曲播放用
			})
			//将搜索关键字高亮
			const highlight= (str) => {
				const reg = new RegExp(props.searchText,'gim')
				return str.replaceAll(reg,`<span style='color:red'>${props.searchText}</span>`)
			}
			//搜索功能操作
			const getKeyWordList= (val) => {
				return setTimeout( () => {
					_searchSuggest(val).then( res => {
							const {albums, artists, playlists, songs} = res.result;
							state.albums = albums;
							state.artists = artists;
							state.playlists = playlists;
							state.songs = songs
							// console.log('111')
					})
				},500)
			}
			//监听搜索输入并进行防抖操作
			watchEffect( (onDebounce) => {
				let timer=getKeyWordList(props.searchText)
				//立即执行
				onDebounce( () => {
					clearTimeout(timer)
				})
			})
			
			return {
				highlight,
				state
			}
		}
	}
</script>

<style lang="less" scoped>
	:deep(.van-cell__value--alone){
		margin-left: 20px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: pointer;
	}
	.search-suggest{
		min-width: 400px;
		font-size: 14px;
		p{
			margin-left: 20px;
			cursor: pointer;
			span{
				color: royalblue;
			}
		}
	}
	.suggest-title{
		background-color: rgba(125,125,125,0.1);
		.custom-title{
			margin-left: 5px;
		}
	}
</style>
