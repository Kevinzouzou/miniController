/**
 * Created by GIGA on 2017-05-22.
 */
function strToJson(str){
    var json = (new Function("return " + str))();
    return json;
}
//检查是否有网络
function checknet(){
    //var bt=window.android.checkNet();
    //if(bt){
        $("#lostNet").css("display","block");
    //}
}
//远程开锁模块
$(".remoteUnlock").on('click',function(){
    div=`<ul class="btns center">
            <li class="center fl tobtn" id="unlock">开锁</li>
            <li class="center fl tobtn" id="createQr">二维码</li>
        </ul>`;
    $("#roomName").css("display","none");
    $("#sceneModel").html(div).css("display","block");
    $("#unlock").css({"background":"#fff","color":"#37a85d"});
    $("#createQr").css({"background":"transparent","color":"rgba(155,234,170,0.8)"});
    $(".lock").css("display","block");
    //门口机多少，及其每个门口机开锁控制生成
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/doorCtrollerAction!appFindDoorController.action',
        type:"POST",
        data:"token="+sessionStorage.token,
        success:function(js){
            var js=strToJson(js);
            var div="";
            //解析 code 既是房间号门口机 如code："200002d1p1z1b1u-116D"
            $.each(js.obj,function(i,addList){
                var tCode=tranCode(addList.code);
                div+="<li><span class='doorLock'>"+tCode+"</span>"+
                    "<i class='unlocking' mac='"+addList.mac+"'></i></li>"
            });
            $(".lock").html(div);
            //开锁
            $(".unlocking").on('click',function(){
                time(this);
                tm(this,15);
            });
        },
        error:function(){
            //alert("开锁失败！");
            checknet();
        }
    });

    //开锁
    $("#unlock").on('click',function(){
        $("#unlock").css({"background":"#fff","color":"#37a85d"});
        $("#createQr").css({"background":"transparent","color":"rgba(155,234,170,0.8)"});
        $(".lock").css("display","block");
        $(".setTime").css("display","none");
        if($(".lock").html()==""){
            checknet();
        }
    });
    //二维码模块
    $("#createQr").on('click',function(){
        $("#lostNet").css("display","none");
        //生成二维码功能模块显示
        $("#unlock").css({"background":"transparent","color":"rgba(155,234,170,0.8)"});
        $("#createQr").css({"background":"#fff","color":"#37a85d"});
        $(".lock").css("display","none");
        $(".setTime").css("display","block");

        //$(".setTime").toggleClass("show");
        //设置#forDate有效日期，默认值为当前日期时间
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        document.getElementById("forDate").value =currentdate;
        //进度条自带插件设置CSS
        $("#forMinute").siblings().css("margin","21px 0 18px");
    });
});
//开门，门卡机
function time(th) {
    var mac=$(th).attr("mac");
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/recordAction!webOpenDoor.action',
        type:"POST",
        data: "token="+sessionStorage.token+"&&mac="+mac,
        success:function(js){
            var js=strToJson(js);
        },
        error:function(){
            //alert("开门失败");
            checknet();
        }
    });
}
//定时 wait 时间后开锁图标回位 默认15秒
function tm(th,wait) {
    if (wait == 0) {
        $(th).css("backgroundImage","url(img/lock.png)").html("");
    } else {
        $(th).css("backgroundImage","url(img/unlock.png)").html(wait+"s  ");
        wait--;
        setTimeout(function() {
            tm(th,wait)
        }, 1000)
    }
}

//生成二维码图片
$(".toCreate").on('click',function(){
   $(".qrCodeHide").css("display","block");
    //有效分钟：forMinute 有效日期：forDate deadtime:deadtime
    var forMinute=document.getElementById("forMinute").value;
    var forDate=document.getElementById("forDate");
    var deadtime=forDate.value;
    forDate = forDate.value.replace(new RegExp("-","gm"),"/").replace(new RegExp("T")," ");
    //有效日期差值 difference
    var now=new Date();
    var date=new Date(forDate);
    var difference=parseInt((date-now)/1000/60);
    if(difference<=forMinute){
        difference=0;
    }else if(difference>forMinute){
        forMinute=0;
    }else{
        difference=0;
        forMinute=document.getElementById('forMinute').value;
    }
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/doorCardAction!generateUnlockQRcode.action',
        type:'POST',
        data:"token="+sessionStorage.token+"&&time="+forMinute+"&&deadtime="+deadtime,
        success:function(data){
            data=strToJson(data);
            sessionStorage.qrCodeUrl=data.obj.picUrl;
            console.log(typeof(sessionStorage.qrCodeUrl)+"qrCodeUrl");
            $(".showMyHome").html(translate(data.obj.code));
            $('.qCode').html("");
            $('.qCode').qrcode(data.obj.picUrl);
        },
        error:function(){
            //alert("生成二维码失败！");
            checknet();
        }
    });
});

//返回生成二维码
$(".back").on('click',function(){
    $(".qrCodeHide").css("display","none");
});

//显示进度条的值，即分钟数
$("#forMinute").change(function(){
    $("span.forMin").html(this.value);
});

//进度条插件
$(function(){
    var len=window.screen.width/10;
    $('#forMinute').jRange({
        from: 0, //滑动范围的最小值，数字，如0
        to: 100, //滑动范围的最大值，数字，如100
        step: 1,//步长值，每次滑动大小
        scale: [0, 100],//滑动条下方的尺度标签，数组类型，如[0,50,100]
        format: '%s',//数值格式
        width:6.51*len, //滑动条宽度
        display:'inline-block',
        showLabels: true,// 是否显示滑动条下方的尺寸标签
        showScale: true //是否显示滑块上方的数值标签
    });
});

//有效日期时间 插件
$(function () {
    var newjavascript={
        plugdatetime:function ($dateTxt,type) {
            //     var curr = new Date().getFullYear();
            var opt = {};
            opt.time = {preset : type};
            opt.date = {preset : type};
            opt.datetime = {
                preset : type,
                minDate: new Date(2015,01,01,00,00),
                maxDate: new Date(2025,12,31,24,59),
                tepMinute: 1
            };
            $dateTxt.val('').scroller('destroy').scroller(
                $.extend(opt[type],
                    {
                        theme: "android-ics light",//"sense-ui",
                        mode: "scroller",
                        display: "modal",
                        lang: "english",
                        yearText: "年",
                        monthText: "月",
                        dayText: "日",
                        hourText: "时",
                        minuteText: "分",
                        secondsText: "秒",
                        timeWheels: "HHiiss",
                        timeFormat: "HH:ii:ss",
                        nowText:"今天",
                        setText: '确定',
                        cancelText: '取消',
                        dateFormat: 'yy-mm-dd'
                    }
                )
            );
        }
    };
    newjavascript.plugdatetime($("#forDate"), "datetime")
});

$(document).ready(function(){
    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    //判断浏览器是否为微信浏览器
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        $(".content").css("min-height","12.74rem");
        $(".lock").css("height","12.74rem");
        $(".setTime>.tab-content").css("height","13.47rem");
        $(".setup").css("height","12.74rem");
        //在微信中打开
        //截屏 方法1 截图再分享
        $(".toImgShare").on('click',function(event){
            event.preventDefault();
            $(".toImgShare").css("display","none");
            $(".otherStep").css("display","block");
            var toImge=document.getElementsByClassName("toImg");
            html2canvas(toImge, {
                allowTaint: true,
                taintTest: false,
                onrendered: function(canvas) {
                    canvas.id = "mycanvas";
                    //document.body.appendChild(canvas);
                    //生成base64图片数据
                    var dataUrl = canvas.toDataURL();
                    var newImg = document.createElement("img");
                    newImg.src =  dataUrl;
                    newImg.style.padding="20px 0";
                    var addImg=document.getElementById("addImg");
                    addImg.appendChild(newImg);
                }
            });
            $(".toImg").html("");
        });
    }else{
        var scrHeight=window.screen.height;
        var perWidth=window.screen.width/10;
        var charHeight=scrHeight-3.71*perWidth+"px";
        $(".content").css("min-height",charHeight);
        $("#lostNet").css("height",charHeight);
        $(".lock").css("height",charHeight);
        $(".setTime>.tab-content").css("height",scrHeight-5.32*perWidth+"px");
        $(".qrCodeHide").css("height",scrHeight-1.7*perWidth+"px");
        $(".setup").css("height",charHeight);
        //方法2 调用安卓接口 在apk 上分享
        $(".toImgShare").on('click',function(){
            window.android.sharePicFromJs(sessionStorage.qrCodeUrl);
        })
    }
});

//解析家庭门卡地址
function translate(code){
    var index1=code.indexOf("d");
    var index2=code.indexOf("p");
    var index3=code.indexOf("z");
    var index4=code.indexOf("b");
    var index5=code.indexOf("u");
    var index6=code.indexOf("f");
    var index7=code.indexOf("h");
    var code1=code.substring(0, index1);
    var code2=code.substring(index1+1, index2);
    var code3=code.substring(index2+1, index3);
    var code4=code.substring(index3+1, index4);
    var code5=code.substring(index4+1, index5);
    var code6=code.substring(index5+1, index6);
    var code7=code.substring(index6+1, index7);
    var o=code1+"街区"+code2+"期"+code3+"区"+code4+"栋"+code5+"单元"+code6+"层"+code7+"室";
    return o;
}
//门口机地址
function tranCode(code){
    var index1=code.indexOf("d");
    var index2=code.indexOf("p");
    var index3=code.indexOf("z");
    var index4=code.indexOf("b");
    var index5=code.indexOf("u");
    var code1=code.substring(0, index1);
    var code2=code.substring(index1+1, index2);
    var code3=code.substring(index2+1, index3);
    var code4=code.substring(index3+1, index4);
    var code5=code.substring(index4+1, index5);
    var o=code2+"期"+code3+"区"+code4+"栋"+code5+"单元";
    return o;
}