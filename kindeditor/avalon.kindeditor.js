/**
 * @cnName kindeditor
 * @enName kindeditor
 * @introduce
 *    <p>kindeditor文本编辑器组件</p>
 *  @updatetime
 */

define(["avalon", "./kindeditor.4.1.0.js"], function(avalon, K) {
    var widgetName = "kindeditor",
        widget = avalon.ui[widgetName] = function(element, data, vmodels) {

            var options = data[widgetName+'Options'],
                $element = avalon(element);

            var vmodel = avalon.define(avalon.mix(true, {
                $id: data[widgetName+'Id'],
                $instance: null,
                $duplexBinded: null,
                /**
                 * @interface 组件初始化函数
                 */
                $init: function() {
                    //对element进行扫描，初始化节点中的avalon绑定
                    avalon.scan(element, vmodels)

                    vmodel.$instance = K.create(element, vmodel.$options)

                    //在element上绑定了duplex之后，实现element与$instance的双向绑定
                    //执行顺序：
                    // (1) 从model同步到editor: vm.txt = "text" --> data.changed --> editor.html( element.value )
                    // (2) 从editor同步到model: editor.afterChange --> element.value = editor.html() --> data.handler
                    if(vmodel.$duplexBinded) {
                        var data = vmodel.$duplexBinded,
                            $instance = vmodel.$instance,
                            changed = data.changed,
                            afterChange = $instance.options.afterChange,
                            syncFlag = true

                        //使用data.changed实现对数据改变的监听
                        data.changed = function( value, data) {
                            changed.call(this, value, data)
                            if(syncFlag) {
                                $instance.html($element.val())
                            } else {
                                syncFlag = true
                            }
                        }

                        //在$instance中通过注入afterChange实现对editor内容改变的监听
                        $instance.options.afterChange = function() {
                            if(avalon.type( afterChange ) === "function") {
                                afterChange.call($instance)
                            }
                            syncFlag = false
                            $element.val($instance.html())
                            data.handler()
                        }
                    }

                    if(typeof vmodel.onInit === "function"){
                        vmodel.onInit.call(element, vmodel, options, vmodels)
                    }
                },
                /**
                 * @interface 当组件移出DOM树时,系统自动调用的销毁函数
                 */
                $remove: function() {}
            }, options))

            //如果element绑定了ms-duplex，对editor中的内容进行同步
            vmodel.$watch("avalon-ms-duplex-init", function(data) {
                vmodel.$duplexBinded = data;
            });

            return vmodel;
        }

    widget.defaults = {
        //@config 传递给kindeditor的配置项
        $options: {
            allowFileManager : true,
            afterChange: avalon.noop,
            wellFormatMode: false       //美化HTML数据，默认为false，美化HTML在duplex模式下会额外触发变量的改变事件
        },
        onInit: avalon.noop     //@config 初始化时执行方法
    }

    return avalon
})

/**
 @links
 [默认配置](avalon.kindeditor.ex1.html)
 */
