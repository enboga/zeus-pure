# zeus-pure
基于 fis3 定制的纯前端工程解决方案，同时支持组件发布到静态服务器。

## 特点

- 定制目录结构
- 默认使用sass
- 支持组件发布的到静态服务器（不同版本独立发布）
- jsp/velocity 模板
- 支持组件化
- 支持模块化


## 使用说明

### 全局安装 `fis3`

	npm install -g fis3

### 项目中安装 `zeus-pure`

	npm install zeus-pure --save


然后在 fis-conf.js 中添加以下代码即可。

	fis.require('zeus-pure')(fis);


### 运行 & 预览

	fis3 release
	fis3 server start

### 发布产品代码

	fis3 release prod -d ../dist

发布时，需要在`fis-conf.js` 需要添加 `context 上下文根配置` ，如果根目录就配置成空字符串
	
	 fis.set('contextDomain', '/building');

#### 开发和发布切换

当遇到开发和发布的配置参数需要不一样，可以使用 `__ZEUS_FIS3_MEDIA__` 来判断，`__ZEUS_FIS3_MEDIA__` 会根据执行的命令不一样嵌入不同的字符串。

- 开发

> __ZEUS_FIS3_MEDIA__ = "dev"

- 发布

> __ZEUS_FIS3_MEDIA__ = "prod"

比如你可以这样用：

	if ('__ZEUS_FIS3_MEDIA__' == 'dev') {
	    module.exports = require('./configureStore.dev');
	} else {
	    module.exports = require('./configureStore.prod');
	}

执行 `fis3 release` 运行 `module.exports = require('./configureStore.dev');`

执行 `fis3 release prod` 运行 `module.exports = require('./configureStore.prod');`

## 目录结构
暂无说明

## 更新日志

### v0.1.0

- 纯前端解决方案可使用初始版本