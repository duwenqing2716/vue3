import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Lazyload } from 'vant';
//事件总线与provide二者共存多余了
import mitt from 'mitt';//引入mitt
import Vant from 'vant';
import 'vant/lib/index.css';
import './assets/css/index.less' //后者覆盖前者,因此最好将全局放在第三方后面

const emitter = mitt();  

const app = createApp(App);

app.directive('lazyload',{
	mounted(el,bindinds){		
		const observer = new IntersectionObserver(([{isIntersecting}])=>{
				if(isIntersecting){
					el.src = bindinds.value
					observer.unobserve(el)
				}	
		})
		observer.observe(el)
	}
})

app.directive('permission',{
	mounted(el,bindinds){		
		
	}
})

app.config.globalProperties.$bus = new mitt()
app.provide('emitter', emitter);  


app.use(store).use(router).use(Vant).mount('#app')
