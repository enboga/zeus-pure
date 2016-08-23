var path = require('path');
// var componentToStaticServer = require('./componentToStaticServer');

var exports = module.exports = function(fis) {

    fis.set('system.localNPMFolder', path.join(__dirname, 'node_modules'));

    // since fis3@3.3.21
    // 帮当前目录的查找提前在 global 查找的前面，同时又保证 local 的查找是优先的。
    if (fis.require.paths && fis.require.paths.length) {
        fis.require.paths.splice(1, 0, path.join(__dirname, 'node_modules'));
    }

    var weight = -100; // 此插件中，所有 match 默认的权重。
    var weightWithNs = -50; // 所有针对有 namespace 后设置的权重

    // 设置项目属性
    fis.set('project.name', 'zeus-pure');
    fis.set('project.static', '/static');
    fis.set('project.files', ['*.html', 'map.json', '/test/*']);

    fis.set('namespace', '');
    fis.set('statics', 'static');
    fis.set('templates', '/WEB-INF/views');

    // 默认 node 的服务器。
    fis.set('server.type', 'node');

    // 如果要使用 amd 方案，请先执行
    // fis.unhook('commonjs');
    // 然后再执行 fis.hook('amd');
    // 多个模块化方案插件不能共用。
    // fis.hook('commonjs', {
    //     // baseUrl: './src/modules',
    //     // extList: ['.js', '.jsx']
    // });

    // 引入模块化开发插件，设置规范为 commonJs 规范。
    fis.hook('commonjs', {
        baseUrl: '/src/modules',
        extList: ['.js', '.jsx']
    });


    fis.match('**', {
        deploy: [
            fis.plugin('replace', {
                from: '__ZEUS_FIS3_MEDIA__',
                to: 'dev'
            }),
            fis.plugin('replace', {
                from: '__ZEUS_FIS3_DOMAIN__',
                to: ''
            }),
            fis.plugin('local-deliver') //must add a deliver, such as http-push, local-deliver
        ]
    });

    /*************************目录规范*****************************/

    // 开启同名依赖
    fis.match('/src/modules/**', {
        useSameNameRequire: true
    })


    // ------ 配置lib
    fis.match('/src/static/libs/(**.js)', {
        release: '${statics}/libs/$1'
    });


    // ------ 配置components
    fis.set('component.dir', '/src/components');

    fis.match('/src/components/(**)', {
        release: '${statics}/components/$1'
    });

    fis.match('/src/components/**.css', {
        isMod: true
    });

    fis.match('/src/components/**.js', {
        isMod: true
    });

    fis.match('/src/components/**.jsx', {
        parser: fis.plugin('babel-5.x', {
            blacklist: ['regenerator'],
            stage: 3,
            sourceMaps: true,
            optional: [
                "es7.asyncFunctions",
                "es7.classProperties",
                "es7.comprehensions",
                "es7.decorators",
                "es7.doExpressions",
                "es7.exponentiationOperator",
                "es7.exportExtensions",
                "es7.functionBind",
                "es7.objectRestSpread",
                "es7.trailingFunctionCommas"
            ]
        }),
        rExt: 'js',
        isMod: true
    });


    // ------ 配置modules
    fis.match('/src/modules/(**)', {
        release: '${statics}/modules/$1'
    })


    // ------ 配置css
    fis.match(/^\/src\/static\/sass\/(.*\.scss)$/i, {
        rExt: '.css',
        isMod: true,
        release: '${statics}/style/$1',
        parser: fis.plugin('node-sass', {
            include_paths: ['./src/static/scss', './src/modules/css', 'src/components'] // 加入文件查找目录
        }),
        postprocessor: fis.plugin('autoprefixer', {
            browsers: ['> 1% in CN', "last 2 versions", "IE >= 8"] // pc
            // browsers: ["Android >= 4", "ChromeAndroid > 1%", "iOS >= 6"] // wap
        }),
        sourceMap: true
    });
    fis.match(/^\/src\/modules\/(.*\.css)$/i, {
        isMod: true,
        release: '${statics}/$1',
        postprocessor: fis.plugin('autoprefixer', {
            browsers: ['> 1% in CN', "last 2 versions", "IE >= 8"] // pc
            // browsers: ["Android >= 4", "ChromeAndroid > 1%", "iOS >= 6"] // wap
        })
    });
    fis.match(/^\/src\/modules\/(.*\.(?:png|jpg|gif))$/i, {
        release: '${statics}/$1'
    });


    // 配置js
    fis.match(/^\/src\/modules\/(.*\.jsx)$/i, {
        parser: fis.plugin('babel-5.x', {
            blacklist: ['regenerator'],
            stage: 3,
            sourceMaps: true,
            optional: [
                "es7.asyncFunctions",
                "es7.classProperties",
                "es7.comprehensions",
                "es7.decorators",
                "es7.doExpressions",
                "es7.exponentiationOperator",
                "es7.exportExtensions",
                "es7.functionBind",
                "es7.objectRestSpread",
                "es7.trailingFunctionCommas"
            ]
        }),
        rExt: 'js',
        isMod: true,
        release: '${statics}/$1'
    });
    fis.match(/^\/src\/modules\/(.*\.js)$/i, {
        isMod: true,
        release: '${statics}/$1'
    });

    // ------------ 配置 page
    fis.match("/src/page/(**)", {
        release: '$1'
    });


    // ------ 配置前端模版 使用template.js
    /*fis.match('**.tmpl', {
        parser: fis.plugin('template', {
            sTag: '<#',
            eTag: '#>',
            global: 'template'
        }),
        isJsLike: true,
        release : false
    });*/

    // 对 tmpl 文件，默认采用 utc 插件转换成 js 函数。
    /*fis.match('*.tmpl', {
        parser: fis.plugin('utc'),
        rExt: '.js'
    }, weight)*/


    // ------ 配置模拟数据
    fis.match('/scr/test/**', {
        release: '$0'
    });
    fis.match('/scr/test/server.conf', {
        release: '/config/server.conf'
    });


    /*************************打包规范*****************************/

    // 因为是纯前端项目，依赖不能自动被加载进来，所以这里需要借助一个 loader 来完成
    fis.match('::package', {
        // npm install [-g] fis3-postpackager-loader
        // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
        postpackager: fis.plugin('loader', {
            resourceType: 'commonJs',
            useInlineMap: true // 资源映射表内嵌
        })
    });

    // 公用js
    /*var map = {
        'prd-debug': {
            host: '',
            path: ''
        },
        'prd': {
            host: 'http://yanhaijing.com',
            path: '/${project.name}'
        }
    };

    fis.util.map(map, function (k, v) {
        var domain = v.host + v.path;

        fis.media(k)
            .match('**.{es,js}', {
                useHash: true,
                domain: domain
            })
            .match('**.{scss,css}', {
                useSprite: true,
                useHash: true,
                domain: domain
            })
            .match('::image', {
                useHash: true,
                domain: domain
            })
            .match('**!/(*_{x,y,z}.png)', {
                release: '/pkg/$1'
            })
            // 启用打包插件，必须匹配 ::package
            .match('::package', {
                spriter: fis.plugin('csssprites', {
                    layout: 'matrix',
                    // scale: 0.5, // 移动端二倍图用
                    margin: '10'
                }),
                postpackager: fis.plugin('loader', {
                    allInOne: true,
                })
            })
            .match('/lib/es5-{shim,sham}.js', {
                packTo: '/pkg/es5-shim.js'
            })
            .match('/components/!**.css', {
                packTo: '/pkg/components.css'
            })
            .match('/components/!**.js', {
                packTo: '/pkg/components.js'
            })
            .match('/modules/!**.{scss,css}', {
                packTo: '/pkg/modules.css'
            })
            .match('/modules/css/!**.{scss,css}', {
                packTo: ''
            })
            .match('/modules/css/common.scss', {
                packTo: '/pkg/common.css'
            })
            .match('/modules/!**.{es,js}', {
                packTo: '/pkg/modules.js'
            })
            .match('/modules/app/!**.{es,js}', {
                packTo: '/pkg/aio.js'
            })
    });*/

    // 当用户 fis-conf.js 加载后触发。
    fis.on('conf:loaded', function() {

        fis.media('prod')
            .match('**', {
                domain: fis.get('contextDomain')
            })
            .match('**', {
                deploy: [
                    fis.plugin('replace', {
                        from: '__ZEUS_FIS3_MEDIA__',
                        to: 'prod'
                    }),
                    fis.plugin('replace', {
                        from: '__ZEUS_FIS3_DOMAIN__',
                        to: fis.get('contextDomain')
                    }),
                    fis.plugin('local-deliver') //must add a deliver, such as http-push, local-deliver
                ]
            });
    });


};

exports.init = exports;