import { createRouter, createWebHashHistory } from 'vue-router'

const Home = () => import(/* webpackChunkName:'home'*/'views/CloudMuisc.vue')
const recommendPage = () => import(/* webpackChunkName:'recommendPage'*/'views/Article/childComps/recommendPage.vue')
const recommendList = () => import(/* webpackChunkName:'recommendList'*/'components/content/songDetail/childComps/recommendList.vue')
const recentList = () => import(/* webpackChunkName:'recentList'*/'components/content/songDetail/childComps/recentList.vue')
const Article = () => import(/* webpackChunkName:'Article'*/'views/Article/Article.vue')
const userBinding = () => import(/* webpackChunkName:'userBinding'*/'components/content/bind/userBinding.vue')	
const songDetail = () => import(/* webpackChunkName:'songDetail'*/'components/content/songDetail/songDetail.vue')
const userDetail = () => import(/* webpackChunkName:'userDetail'*/'components/content/profile/userDetail.vue')
// const events = () => import(/* webpackChunkName:'events'*/'components/content/profile/childComps/events.vue')
const followed = () => import(/* webpackChunkName:'followed'*/'components/content/profile/childComps/followList.vue')

// const mvDetailInfo = () => import(/* webpackChunkName:'mv'*/'components/content/video/mvDetailInfo.vue')
const video = () => import(/* webpackChunkName:'video'*/'components/content/video/mvDetailInfo.vue')
const eventsList = () => import(/* webpackChunkName:'eventsList'*/'components/content/events/eventsList.vue')


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
	{
		path:'/home',
		name: 'home',
		component:Home,
		redirect:'/home/recommend',
		children: [
			  {
					path: '/home/recommend',
					component:recommendPage
				},
				{
					path: '/home/recommendList',
					component:recommendList
				},
				{
					path: '/home/rank',
					component:recentList,
				  props: route => ({
            id: route.query.id
          })
				},
				{
					path: '/home/profile',
					component:Article
				},
				{
					path: '/home/binding',
					component:userBinding
				},
				{
					path: '/home/songDetail',
					component:songDetail,
					props: route => ({
            id: route.query.id
          })
				},
				{
					path: '/home/userDetail',
					component:userDetail,
					props: route => ({
				    id: route.query.id
				  })
				},
				{
					path: '/user/events',
					component:eventsList,
					props: route => ({
				    id: route.query.id
				  })
				},
				{
					path: '/user/followed',
					component:followed,
					props: route => ({
				    id: route.query.id
				  })
				},
				{
					path: '/user/fans',
					component:followed,
					props: route => ({
				    id: route.query.id
				  })
				}
	  ]
	},
	{
		path:'/mv',
		name: 'mv',
		component:video,
		props: route => ({
		  id: route.query.id
		})
	},
	{
		path:'/video',
		name: 'video',
		component:video,
		props: route => ({
		  id: route.query.id
		})
	}
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
