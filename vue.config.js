module.exports = {
     configureWebpack:{
       resolve: {
         // 别名配置
         alias: {
           'assets': '@/assets',
           'common': '@/common',
           'components': '@/components',
           'network': '@/network',
           'configs': '@/configs',
           'views': '@/views',
           'plugins': '@/plugins',
					 'store':'@/store'
         }
       }
     }
  }
