(function(){
    if(typeof jQuery == 'undefined'){
        document.write('<script type="text/javascript" charset="utf-8" src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.0.js"></script>');
    }
    document.write('<link href="https://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">');
    document.write('<link href="https://cdn.bootcdn.net/ajax/libs/izitoast/1.4.0/css/iziToast.min.css" rel="stylesheet">');
    document.write('<script type="text/javascript" charset="utf-8" src="https://cdn.bootcdn.net/ajax/libs/izitoast/1.4.0/js/iziToast.min.js"></script>');
})();
const WSURL= "ws://47.102.133.116:9090/api/connect?u-id=";
const APIURL= "http://47.102.133.116:9090/api/";
//通知记录页码
var NowPage = 1;
var PageStatus = 1;
var Num = 0;

window.onload =function () {
    //自定义方法
    ;!function (win) {
        "use strict";
        var KNotice = function(){
            this.v = '1.0'; //版本号
            this.Notice = iziToast; // iziToast
        }
        KNotice.prototype.init = function () {
            this.uid = getUid();
            //user config
            KNotice.Notice = iziToast.settings({
                class:'',
                titleColor: "", //标题颜色
                titleSize: "", //标题size
                messageColor:"",// 消息颜色
                messageLineHeight :	'', //消息颜色
                backgroundColor:'',//	Background color of the Toast
                theme	:'dark',//主题	light dark
                color	:'',
                icon	:'', //图标
                iconText :'',//图标文本
                iconColor:'',//	Icon color.
                iconUrl :'',//	Address of file to be loaded. Example
                image:null,//	自定义图片图标链接
                imageWidth:	50,//	Width of cover image. Example 100px
                maxWidth:null, //	set maxWidth of toast. Example 500px
                zindex	:99999,//	The z-index CSS attribute of the toast
                layout	:1,//	消息题样式，1 / 2   1.一排展示 2 两行展示
                balloon	:false,// 类似发消息格式
                close :	true,//	显示关闭按钮
                closeOnEscape:false,//	Allows to close toast using the Esc key.
                closeOnClick :	false,//	Allows to close toast clicking on it.
                rtl	:false,//	RTL option
                position :'bottomRight',//显示位置 : bottomRight:右下角， bottomLeft：左下角, topRight：右上角, topLeft：左上角, topCenter：顶部中间, bottomCenter：底部中间， center：正中间
                target	:'',//	Fixed place where you want to show the toasts.
                targetFirst	:true,//	Add toast to first position.
                displayMode :0, //	消息展示模式，0 所有 1 仅显示一次 2 替换
                timeout	:4000,	//自动关闭消息框等待时间
                drag :true,  //	开启拖动关闭消息框
                pauseOnHover : true,//	鼠标悬停暂停
                resetOnHover:false,//	鼠标悬停时重新倒计时
                progressBar   :true,//	显示时间进度条
                progressBarColor:'#23b58e',//进度条 color.
                progressBarEasing	:'linear',//	Animation Easing of progress bar.
                overlay	:false,//	Enables display the Overlay layer on the page.
                overlayClose	:false,//	Allows to close toast clicking on the Overlay.
                overlayColor	:'rgba(0, 0, 0, 0.6)',//	Overlay background color.
                animateInside	:true,// 消息内加载动画
                buttons	:{},	//You can specify an array of buttons.
                /*[
                    ['<button>Ok</button>', function (instance, toast) {
                        alert("Hello world!");
                    }, true], // true to focus
                    ['<button>Close</button>', function (instance, toast) {
                        instance.hide({
                            transitionOut: 'fadeOutUp',
                            onClosing: function(instance, toast, closedBy){
                                console.info('closedBy: ' + closedBy); // The return will be: 'closedBy: buttonName'
                            }
                        }, toast, 'buttonName');
                    }]
                ]*/
                inputs :{},//	You can specify an array of inputs. Example
                transitionIn:'fadeInUp',//	消息打开动画 bounceInLeft：右侧飞入, bounceInRight：左侧飞入, bounceInUp：下侧飞入, bounceInDown：上侧飞入, fadeIn：渐现, fadeInDown, fadeInUp, fadeInLeft, fadeInRight or flipInX.
                transitionOut	:'fadeOut',//消息关闭动画 fadeOut, fadeOutUp, fadeOutDown, fadeOutLeft, fadeOutRight, flipOutX
                transitionInMobile :'fadeInUp',//	打开消息框的移动轨迹
                transitionOutMobile:	'fadeOutDown',//关闭消息框的移动轨迹
            });
            //ws 连接
            ws();
        }

        KNotice.prototype.Msg = function (title='',message) {
            this.Notice.show({
                title: title,
                icon:"fa fa-commenting",
                message: message,
                /*buttons: [
                    ['<button>已读</button>', function (instance, toast) {
                        instance.hide({
                            transitionOut: 'fadeOutUp',
                            onClosing: function(instance, toast, closedBy){
                                console.info('closedBy: ' + closedBy);
                            }
                        }, toast, 'readMsg');
                    }]
                ],*/
            });
        }
        win.KNotice = new KNotice();
        win.KNotice.init();
        window.prototype = KNotice
    }(window);

}




//连接服务器
function ws(){
    var ws = new WebSocket(WSURL+getUid());
    //连接成功后的回掉函数
    ws.onopen = function(evt) {
        console.log("Connection open success");
        try {
            var cfg = kNoticeCfg
        }catch (e) {
            var cfg ={
                "title":"kNotice",
                "showBtn":true,
                "btn":{
                    "btn-bottom":"25px",
                    "btn-right":"15px",
                },
            }
        }
        buildChatHtml(cfg);
    };

    //接收来自服务断的消息
    ws.onmessage = function(evt) {
        //二进制消息
        if ( evt.data instanceof ArrayBuffer) {
            var buffer = evt.data;
            console.log("Received arraybuffer");
        }else{
            var data = evt.data; //消息体
            let data2 = JSON.parse(data);
            if(data2.title!=""){
                KNotice.Msg(data2.title,data2.info);
            }else{
                KNotice.Msg("",data2.info);
            }
            addNotice(data2);
        }
    };

    //关闭连接 连接失败！
    ws.onclose = function(evt) {
        console.log("Connection closed.");
    };
    $(document).on("click", ".conversation", function() {
        let title ,info ="";
        title = $(this).attr("data-title");
        info = $(this).attr("data-info");
        KNotice.Msg(title,info);
    });
}

//add notice
function addNotice(notice,is_footer=false){
    let str =  '<div data-title="'+notice.title+'" data-info="'+notice.info+'" class="conversation">' +
        '                        <div class="top">' +
        '                            <span></span>' +
        '                            <span class="title">'+notice.title+'</span>' +
        '                            <span class="time">'+notice.time+'</span>' +
        '                        </div>' +
        '                        <div class="bottom">' +
        '                            <span class="user"></span>' +
        '                            <span class="message">'+notice.info+'</span>' +
        '                        </div>' +
        '    </div>';
    if(is_footer){
        $(".conversations").append(str);
    }else{
        $(".conversations").prepend(str);
    }

    Num =Num+1;
    $(".kn-badge").html(Num);

}

//build chat html
function buildChatHtml(cfg){
    let showBtn =""
    if(!cfg.showBtn){
        showBtn ="hidden"
    }
    let str ='<div class="knotice '+showBtn+'">' +
        '    <button class="kn-btn btn-special kn-fixed" style="bottom: '+cfg.btn["btn-bottom"]+';right: '+cfg.btn["btn-right"]+'" onclick="openChat()">' +
        '        <i class="fa fa-commenting"></i>' +
        '        <div class="kn-badge ">0</div>'+
        '    </button>' +
        '    <div id="kn-container">' +
        '        <div class="header">' +
        '            <div><span class="title">'+cfg.title+'</span><button  style="float: right" class="kn-btn" onclick="history()">历史消息</button></div>' +
        '            <button class="kn-btn btn-round btn-icon" onclick="closeChat()"><i class="fa fa-times"></i></button>' +
        '        </div>' +
        '        <div class="wrapper">' +
        '            <div class="list">' +
        '                <div class="conversations">' +

        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';
    $("body").append(str);

}
function openChat () {
    document.getElementById('kn-container').classList.add('open');
    Num = 0;
    $(".kn-badge").html(Num);
}
function closeChat () {
    document.getElementById('kn-container').classList.remove('open');
    document.querySelector('.list').classList.remove('close');
}

function history(){
    if(PageStatus === 1){
        getHistoryNotice();
    }
}


//api get
{
    //获取基本配置
    function getConfig(){

    }
    //获取历史消息
    function getHistoryNotice(){
        PageStatus = 0;
        let url = APIURL +"notice/getHistoryNotice";
        $.ajax({
            url:url,
            type:"get",
            dataType:"json",
            data:{"u-id":getUid(),"page":NowPage},
            success:function (e) {
                PageStatus = 1;
                NowPage += 1;
                if(e.code==200){
                    $.each(e.res,function (i,v) {
                        //console.log(v)
                        addNotice(v,true);
                    });
                    Num = 0;
                    $(".kn-badge").html(0);
                }

            },error:function (e){
                PageStatus = 1;
                console.log(e);
            },
        });
    }
}

//get now uid
function getUid() {
    var uid = "";
    var tags=document.getElementsByTagName("script");
    $.each(tags,function (i,str) {
        str =str.getAttribute("src");
        if(str){
            let n=str.indexOf("common-knotice.js?u-id=");
            if(n !== -1){
                uid =getParameter("u-id",str);
                return;
            }
        }
    })
    return uid;
}
function getParameter(paraStr, url) {
    var result = "";
    var str = "&" + url.split("?")[1];
    var paraName = paraStr + "=";
    if(str.indexOf("&"+paraName)!=-1)
    {
        if(str.substring(str.indexOf(paraName),str.length).indexOf("&")!=-1)
        {
            var TmpStr=str.substring(str.indexOf(paraName),str.length);
            result=TmpStr.substr(TmpStr.indexOf(paraName),TmpStr.indexOf("&")-TmpStr.indexOf(paraName));
        }
        else
        {
            result=str.substring(paraName.length+1,str.length);
        }
    }
    else
    {
        result="";
    }
    return (result.replace("?",""));
}
