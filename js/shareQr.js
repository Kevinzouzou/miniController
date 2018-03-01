/**
 * Created by GIGA on 2017-05-27.
 */
function strToJson(str){
    var json = (new Function("return " + str))();
    return json;
}
function forShare() {
    var url=location.href.split('#')[0];
    //console.log(url);
    alert(url);
    $.ajax({
        url: serip + ":8080/ucotSmart/weixinPostAction!getAuthorization.action",
        type: "GET",
        data:"url="+url,
        success: function (data) {
            data = strToJson(data);
            sessionStorage.timestamp = data.obj.timestamp;
            sessionStorage.noncestr = data.obj.noncestr;
            sessionStorage.signature = data.obj.signature;
            console.log(data);

            //console.log(data.obj.timestamp);
            //console.log(data.obj.noncestr);
            //console.log(data.obj.signature);
        },
        error: function () {
            alert("请求失败！");
        }
    });

    var id = '${id}';//服务端设置的id,用于下面拼接生成需要分享的link
    var timestamp = parseInt(sessionStorage.timestamp);//因为服务端是String类型，此处转化成数值类型
    //var timestamp = new Date();
    //    timestamp=timestamp.getTime();
    var nonceStr = sessionStorage.noncestr;
    var signature = sessionStorage.signature;
    var qrCodeUrl = sessionStorage.qrCodeUrl;
    console.log(timestamp);
    console.log(nonceStr);
    console.log(signature);
    console.log(qrCodeUrl);
    wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: "wx54b8cef011afad65",//'wxa034b7003154ee6c', // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
    alert(wx.config);
    wx.ready(function () {
        //alert("wx.ready");
        alert(qrCodeUrl);
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        wx.onMenuShareTimeline({
            title: 'xxxxxxxxxxxxx', // 分享标题
            link: qrCodeUrl, // 分享链接
            imgUrl: 'http://192.168.1.254:8080/ucotSmart/html5/mini-controller/img/wult.png', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                alert("用户确认分享后执行的回调函数");
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
                alert("用户取消分享后执行的回调函数");
            }
        });

        wx.onMenuShareAppMessage({
            title: 'xxxxxxx', // 分享标题
            desc: 'xxxxxxx', // 分享描述
            link: qrCodeUrl, // 分享链接
            imgUrl: 'http://192.168.1.254:8080/ucotSmart/html5/mini-controller/img/wult.png', // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
}
//    var imgUrl = "http://192.168.1.128/mini-controller/img/wult.png";  //图片LOGO注意必须是绝对路径
//    var lineLink = "http://192.168.1.128/mini-controller/img/wult.png";   //网站网址，必须是绝对路径
//    var descContent = '互动网络(www.gdibn.com)对待每一位客户。'; //分享给朋友或朋友圈时的文字简介
//    var shareTitle = '广州网络';  //分享title
//    var appid = "wx54b8cef011afad65"; //apiID，可留空
//    var qrCodeUrl=sessionStorage.qrCodeUrl;
//    alert("11");
//    function shareFriend() {
//        alert("friend");
//        WeixinJSBridge.invoke('sendAppMessage',{
//            "appid": appid,
//            "img_url": qrCodeUrl,
//            "img_width": "200",
//            "img_height": "200",
//            "link": qrCodeUrl,
//            "desc": descContent,
//            "title": shareTitle
//        }, function(res) {
//            alert("friend res");
//            //_report('send_msg', res.err_msg);
//        })
//    }
//    function shareTimeline() {
//        WeixinJSBridge.invoke('shareTimeline',{
//            "img_url": qrCodeUrl,
//            "img_width": "200",
//            "img_height": "200",
//            "link": qrCodeUrl,
//            "desc": descContent,
//            "title": shareTitle
//        }, function(res) {
//            //_report('timeline', res.err_msg);
//        });
//    }
//    function shareWeibo() {
//        WeixinJSBridge.invoke('shareWeibo',{
//            "content": descContent,
//            "url": lineLink,
//        }, function(res) {
//            //_report('weibo', res.err_msg);
//        });
//    }
//// 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
//    document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
//        // 发送给好友
//        alert("share start");
//        WeixinJSBridge.on('menu:share:appmessage', function(argv){
//            shareFriend();
//            alert("share friend done");
//        });
//        // 分享到朋友圈
//        WeixinJSBridge.on('menu:share:timeline', function(argv){
//            shareTimeline();
//        });
//        // 分享到微博
//        WeixinJSBridge.on('menu:share:weibo', function(argv){
//            shareWeibo();
//        });
//    }, false);
//}
