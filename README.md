
## snail
蜗牛（snail）是我们前端组为解决移动端应用开发，而设计的一个用于开发混合式App的框架，基于`react-native`。

> 吴晗说
>> 蜗牛有个坚硬的壳，我们就是做这个坚硬的壳的。

于是就取名叫蜗牛了。


## 架构图

![架构图](https://github.com/gitwuhao/SnailCore/blob/master/20170327121201.png)

### 概念说明
`snail app` 包含：
- `rn-invoke` 实现web端到native端双向消息传递的机制，详细说明见`rn-invoke`模块readme文档。
- `web app` 是 web端 的业务代码，通过 [rn-invoke](http://172.17.210.65:4873/-/readme/w-rn-invoke/1.0.0) API可以调用`snail`的模块。
- `snail core` 是框架的核心模块，主要负责模块、主屏切换、app、webview、invoke等状态的管理
- `snail modules` 是snail模块的集合，每一个snail模块都是基于dva封装的model和Component。考虑到未来业务场景的不确定性，对RN插件进行模块化封装，在根据具体的业务场景对snail模块进行注册，就可以让web端拥有对应的能力了。比如：扫码、拍照、设备信息等模块，可以开发自定义模块.
- `put`是dva传递消息的方法和redux的dispatch 一样。
- [`crosswalk`](https://crosswalk-project.org/index_zh.html) Crosswalk项目由Intel Open Source Technology Center开发，Crosswalk项目提供了强大且可预测的环境来构建出色的Android应用。
- [`dva`](https://github.com/dvajs/dva/blob/master/README_zh-CN.md)是支付宝前端团队基于 redux、redux-saga 和 react-router 的轻量级前端框架。

*** ios上使用ReactNative默认webview ***


## [快速上手](/w-snail-myapp/-/w-snail-myapp-0.0.1.tgz)

创建RN项目
```
react-native init myapp
```

增加模块依赖
```
cd myapp
npm install --save w-rn-snail-core w-rn-crosswalk-webview w-rn-display-view w-rn-xwalk-core-library
react-native link
```

修改`android/settings.gradle`文件
```
rootProject.name = 'myapp'
include ':w-rn-display-view'
project(':w-rn-display-view').projectDir = new File(rootProject.projectDir, '../node_modules/w-rn-display-view/android')
include ':w-rn-crosswalk-webview'
project(':w-rn-crosswalk-webview').projectDir = new File(rootProject.projectDir, '../node_modules/w-rn-crosswalk-webview/android')

// ++++增加xwalk编译库++++
include ':w-rn-xwalk-core-library'
project(':w-rn-xwalk-core-library').projectDir = new File(rootProject.projectDir, '../node_modules/w-rn-xwalk-core-library/android')
// ---------------------

include ':app'
```



增加`start.js`
```
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';


//import deviceInfoModules from 'w-snail-modules-device-info';
//import injectedJavaScript from './injectedJavaScript';

import snailFactory from  'w-rn-snail-core/factory';

//创建app实例
const { snail, SnailStore, AppComponent } = snailFactory({
	app: {
		//主页
		host: 'https://github.com/',
		//相对路径
		path: '',
		//注入脚本
		injectedJavaScript: '',
		/**
		 *{
		 * LOAD_DEFAULT : -1,
		 * LOAD_CACHE_ELSE_NETWORK : 1,
		 * LOAD_NO_CACHE : 2,
		 * LOAD_CACHE_ONLY : 3,
		 * }
		 **/
		//CrossWalk缓存模式
		cacheMode: -1
	}
});

// snail.use(dvaLog());

//注册设备信息模块
// snail.model(deviceInfoModules(SnailStore));

//注册根组件
snail.router(()=> <AppComponent />);

AppRegistry.registerComponent('myapp', ()=> snail.start());

```
`snailFactory(initialState)` 返回 `{snail , SnailStore , AppComponent}`
- `snail`是dva创建的实例对象

- `SnailStore`返回`{ INS, dispatch, getState }`

- `AppComponent`包含了`webview`和`display-view`组件，主要负责主屏的切换，因为react的组件是基于状态管理的，所以不能直接移除webview组件，主屏切换时webview只能做隐藏处理，
如果移除了webview组件当前网页显示的内容就丢失了。比如：`webview`切换到照相机。




目录结构
```
[-] myapp
 |-- [-] android 
 |    |-- settings.gradle （修改）
 |-- [+] ios
 |-- [+] www 
 |-- start.js (增加)
 |-- index.android.js 
 |-- index.ios.js
```


启动项目
```
react-native run-android
```

### snail模块开发
下面是一个切换主屏的模块
```
import TakePictureComponent from './Component';
//模块名
const name='takePicture';
//web端调用RNI.post('takePicture')，触发该模块的request action
export default function ({ INS, dispatch, getState }) {
	const namespace = `${INS}${name}`;
	return {
		namespace,
		state: {
			success: null,
			error: null,
		},
		reducers: {
			request(state, { payload }){
				return payload;
			}
		},
		effects: {
			*request(action, { call, put, select }){
				//切换主屏幕
				yield put({
					type: 'app/switch',
					payload: {
						//需要在主屏幕显示的组件
						component: TakePictureComponent,
						moduleNamespace: namespace,
					}
				});
			},
			//处理组件success的action
			*success({ payload:{ result } }, { call, apply, put, select }){
				//获取当前model的状态
				const state = yield select((state)=> state[namespace]);
				//请求处理成功将result返回给web端
				yield call(state.success, result);
				//还原为webview的主屏幕显示
				yield put({
					type: 'app/revert'
				});
			},
			*error({ payload:{ result } }, { call, put, select }){
				//处理组件error的action
			}
		}
	};
}
```
模块说明：
- `name` 模块名，在web端通过`RNI.post(name)`发起请求，请求会转发到当前模块
- `namespace` 当invoke模块接收到来自web端的请求时，用`put({type:${INS}${name}/request})`将请求分发出去，对应的模块会接受并处理请求。
- `request` 处理来自web端的请求


### 文档
- [rn-invoke](http://reactnative.cn/)
- [reactnative](http://reactnative.cn/)
- [dva](https://github.com/dvajs/dva/blob/master/docs/API_zh-CN.md)
- [RN开源](https://js.coach/react-native/)
- [crosswalk webview](https://crosswalk-project.org/index_zh.html)