/**
 * Created by GIGA on 2017-04-28.
 */
//"use strict";

//电气设备属性
var electricLists=[
    {"type":1,"name":"普通灯","value":"light","status":["开关"]},
    {"type":2,"name":"调光灯","value":"dimmer_light","status":["开关","亮度加","亮度减"]},
    {"type":4,"name":"窗帘","value":"curtain","status":["拉开","闭合","暂停"]},
    {"type":5,"name":"插座","value":"socket","status":["开关"]},
    {"type":7,"name":"空调","value":"air","status":["开关","模式","风速","温度加","温度减"]},
    {"type":9,"name":"电视","value":"tv","status":["开关","频道加","频道减","音量加","音量减","静音"]},
    {"type":40,"name":"电扇","value":"fans","status":["开关","摇头","风速","定时"]},
    {"type":41,"name":"IPTV","value":"iptv","status":["开关","播放/暂停","频道加","频道减","音量加","音量减","静音"]},
    {"type":42,"name":"机顶盒","value":"stb","status":["待机","频道加","频道减","音量加","音量减","导视"]},
    {"type":43,"name":"影碟机","value":"dvd","status":["开关","开关仓","暂停","播放","停止","静音","上一曲","下一曲","快进","快退"]},
    {"type":44,"name":"投影仪","value":"projector","status":["开关","音量加","音量减","变焦加","变焦减","画面加","画面减","自动","暂停","亮度","静音"]}
];

//字符串转换成JSON
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

//动态列表生成样式
var elecs=new Array();
var eLists=new Array();
$(document).ready(function(){
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/sceneControlAction!sendScenceSettting.action',
        type:"POST",
        data:"token="+sessionStorage.token,
        success:function(js){
            console.log("同步成功!");
        },
        error:function(){
            console.log("同步失败！");
        }
    });

    //获取home电器状态列表
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/smartHomeAction!queryHomeElectricAndEstatus.action',
        //url:'data/queryHomeElectricAndEstatus.json',
        type:'POST',
        data:"token="+sessionStorage.token,
        success:function(js){
            var js=strToJson(js);
            var html="";
            var html1="";
            //动态生成房间列表
            html+=`<div class="roomList"><ul class="fl grads nav-pills">`;
            //遍历obj房间
            $.each(js.obj,function(i,elctrics_1){
                sessionStorage.Lenth=js.obj.length;
                var html2="";
                //第一项增加active 属性
                if(i===0){
                    html+=`
                    <li class="active"><a data-toggle="tab" href="#${elctrics_1.roomId}">${elctrics_1.roomName}</a></li>
                `;
                    $("#roomName").html(elctrics_1.roomName);
                    html1+=`
                    <div class="tab-pane active" id="${elctrics_1.roomId}">
                 `;
                }else{
                    html+=`
                    <li><a data-toggle="tab" href="#${elctrics_1.roomId}">${elctrics_1.roomName}</a></li>
                `;
                    html1+=`
                    <div class="tab-pane" id="${elctrics_1.roomId}">
                 `;
                }
                //遍历房间电器
                for(var j=0;j<elctrics_1.electricList.length;j++){
                    //将电器id，室内机Mac地址，电气状态status，存储到elec中。再将elec进行push到elecs中
                    var elec=new Object();
                    var electric=elctrics_1.electricList[j];
                    //获取Mac，electricId，status保存到elec中
                    elec.mac=electric.mac;
                    elec.electricId=electric.electricId;
                    elec.status=electric.status;
                    elecs.push(elec);
                    for(var k=0;k<electricLists.length;k++){
                        if(electricLists[k].type==electric.type){
                            var type=electricLists[k];
                            var elist=new Object();
                            elist.value=type.value;
                            elist.name=electric.name;
                            eLists.push(elist);

                            //获取房间室内机Mac地址，与电器id确定唯一电器
                            var mac=JSON.stringify(electric.mac);
                            var electricId=electric.electricId;
                            //获取后台数据电器状态status
                            var status=electric.status;
                            //将室内机Mac，和电器id确定唯一电器
                            var a=elec.mac+"-"+electricId;
                            //动态生成电器列表
                            html2+=" <div class='fl electric "+type.value+" "+electric.electricId+"'>" +
                                "<dl class='toClearTimer' id="+elec.mac+"-"+electricId+" onclick='tog(this);handControl("+mac+", "+electricId+")'>" +
                                "<dt></dt><dd>"+electric.name+"</dd></dl><div id='"+type.value+"'></div></div>";
                        }
                    }
                }
                html1=html1+html2+`</div>`;
            });
            html+=`</ul></div><div class="detail fl tab-content">`;
            html=html+html1+`</div>`;
            $("#content1").html(html);
            var Length=sessionStorage.Lenth;
            var Width=parseFloat($(".grads>li").css("width"));
            var roomliWith=parseFloat($(".roomList").css("width"));
            $(".grads").css("width",Length*Width);
            if(roomliWith>=Length*Width){
                $(".grads").css("margin-left",roomliWith/2-Length*Width/2);
            }

            //点击不同房间，标签显示不同房间名
            $(".grads li").on('click',function(){
                $("#roomName").html($(this).text());
            });
            //进入不同的电器面板控件
            for(var j=0;j<eLists.length;j++){
                touchShow("."+eLists[j].value,"#"+eLists[j].value,eLists[j].name);
            }
            //touchShow(".dimmer_light","#dimmer_light","调光灯");
        },
        error:function(){
            //alert("获取home状态列表失败！");
            checknet();
        }
    });
});


var modelPages=new Array();
//场景控制
$(document).ready(function(){
    console.log("3");
    //场景控制：不同的种类的场景模式
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/sceneControlAction!getHscence.action',
        type:'POST',
        data:"token="+sessionStorage.token,
        success:function(js) {
            console.log("success");
            var div="";
            var js=strToJson(js);
            $.each(js.obj.data,function(i,model){
                var modelPage=new Object();
                modelPage.type=model.type;
                modelPage.id=model.id_1;
                modelPages.push(modelPage);
                div+="<div class='fl electric electric-"+model.type+"'>"+
                    "<dl onclick='mog(this,"+model.id_1+");'><dt></dt>"+
                    "<dd class='noBag'>"+model.name.split(",")[0]+"</dd><dd class='modRoom noBag'>"+model.name.split(",")[1]+"</dd></dl>"+
                    "<div id='electric-"+model.type+"' class='modelInfo'></div></div>";

                    $("#content2").html(div);
              });
            for(var i=0;i<modelPages.length;i++){
                touchModelShow(".electric-"+modelPages[i].type,"#electric-"+modelPages[i].type,modelPages[i].id);
            }
        },
        error:function(){
            console.log("err");
        //alert("场景控制获取数据失败！");
            checknet();
        }
    });
});

//开关按钮交替开和关
function tog(th){
    var ele = $(th).children("dt");
    var eldt= $(th).children("dd");
    ele.toggleClass("active");
    eldt.toggleClass("fontColor");
}
//模式交替
function mog(th,modId){
    var ele = $(th).children("dt");
    var eldt= $(th).children("dd");
    //触碰，即开启模式
    $(th).on('touchstart',function(e){
        e.preventDefault();
        ele.addClass("active");
        eldt.addClass("fonts");
        $(".elecStatus").css("color", "#30b15f").html("开");
        $.ajax({
            url: 'http://'+zoneServerIp + ':8080/ucotSmart/sceneControlAction!sendSwitchSenceSetting.action',
            type: "POST",
            data: "status=" + 'open' + "&&token=" +sessionStorage.token + "&&id=" + modId,
            success: function (js) {
                console.log(js + "模式触发成功");
            },
            error: function () {
                checknet();
                //alert("触发失败");
            }
        });
    });
    //触碰结束，模式样式变化结束
    $(th).on('touchend',function(e){
        e.preventDefault();
        ele.removeClass("active");
        eldt.removeClass("fonts");
    })
}

//手动控制单个电器
function handControl(mac,electricId){
    var sta=0;
    var mac=JSON.stringify(mac);
    mac=strToJson(mac);
    var id=mac+"-"+electricId;
    var iid=document.getElementById(id);
    //发送状态码，开既是：9，关既是：99
    if( $(iid).children("dt").hasClass("active")){
        sta=9;
    }else{
        sta=99;
    }
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/smartHomeAction!manualContrll.action',
        type:'POST',
        data:"hestatus.id_1="+electricId+"&&hestatus.status="+sta+"&&hestatus.homemac="+mac+"&&token="+sessionStorage.token,
        success:function(msg){
            msg=strToJson(msg);
        },
        error:function(){
             checknet();
            //alert('手动控制单个失败');
        }
    });
}

//根据数据状态改变样式
var staShows=function(){
    for(var i=0;i<elecs.length;i++) {
        var el=elecs[i];
        if(el.status!==null){
            var a=el.mac+"-"+el.electricId;
            var id=document.getElementById(a);
            sta=el.status.split(",");
            var s=parseInt(sta[0]);
            //状态是1，则显示状态，是0，则不显示
            if(s===1){
                $(id).children("dt").addClass("active").siblings().addClass("fontColor");
            }else if(s===0){
                $(id).children("dt").removeClass("active").siblings().removeClass("fontColor");
            }
        }
    }
};

//页面加载1秒后，查看电器列表加载后状态
$(document).ready(function(){
    setTimeout('staShows()',1000);
});

//forAjax 轮询查询电器状态
function showUpdate(){
    $.ajax({
        url:'http://'+zoneServerIp + ':8080/ucotSmart/statusReportAction!findHestatusByCodeForAjax.action',
        type:'GET',
        data:'token='+sessionStorage.token,
        success:function(data){
            var data=strToJson(data);
            if(data.msg==="hasnew"){
                $.each(data.obj,function(i,elect){
                    var etype=elect.etype;
                    var status1=elect.status;
                    var mac1=elect.homemac;
                    var elecId=elect.id_1;
                    var id=mac1+"-"+elecId;
                    var iid=document.getElementById(id);
                    status1=status1.split(",");
                    //状态是1，则显示状态，是0，则不显示
                    if(status1[0]==="1"){
                        $(iid).children("dt").addClass("active").siblings().addClass("fontColor");
                    }else if(status1[0]==="0"){
                        $(iid).children("dt").removeClass("active").siblings().removeClass("fontColor");
                    }
                });
            }
        },
        error:function(){

        }
    });
}

//forajax 轮询查询电器状态 300次后，或跳转其他功能页面时自动停止，间隔为1s
function refresh(){
    var i=0;
    timer=setInterval(function(){
        i++;
        //console.log("轮询查询状态 "+i+" 次");
        showUpdate();
        if(i>=300 || !$("#content1").hasClass("active")){
            clearInterval(timer);
        }
    },1000);
}

//加载10s后自动轮询电器状态
var timeout=setTimeout('refresh()',10000);

//动态列表“显示”则定时10s后自动轮询，否则不轮询
$(".tips li a").on('click',function(){
    timeout=setTimeout(function(){
        if($("#content1").hasClass("active")){
            window.clearTimeout(timeout);
            refresh();
        }else{
            window.clearTimeout(timeout);
        }
    },10000);
});

//返回上一页
//$(".toLast").on('click',function(){
$(".toLast").on('touchstart',function(){
    window.history.go(-1);
    //window.history.back(-1);
});

//注销 设置参数sessionStorage.num=1 再修改（密码为空 记住密码和自动登录为 false）
//$(".cancel").on("click",function(){
$(".cancel").on("touchstart",function(){
    //后台请求注销退出
    $.ajax({
        url:"http://"+zoneServerIp + ":8080/ucotSmart/loginAction!doNotNeedSession_logout.action",
        type:"POST",
        data:"token="+sessionStorage.token,
        success:function(data){
            var data=strToJson(data);
            if(data.success==true){
                sessionStorage.num=1;
                location.href="index.html";
            }
        },
        error:function(){
            checknet();
            //alert("注销失败！");
        }
    });
});

//底部不同菜单选择，顶部不同显示
$(".dynamicList").on('click',function(){
   $("#roomName").css("display","block");
   $("#sceneModel").css("display","none");
});
$(".sceneControl").on('click',function(){
   $("#roomName").css("display","none");
   $("#sceneModel").html("场景").css("display","block");
});
$(".my").on('click',function(){
   $("#lostNet").css("display","none");
   $("#roomName").css("display","none");
   $("#sceneModel").html("").css("display","block");
});

//电器列表长按电器进入电器控制面板
function touchShow(cls,id,name){
    //设置一个长按的计时器，如果点击这个图层超过1秒则触发，进入电器查看面板控制
    var time = 0;//初始化起始时间
    $(cls).on('touchstart',function(e){
        e.stopPropagation();
        time = setTimeout(function(){
            showImg();
        }, 1000);//这里设置长按响应时间
    });

    $(cls).on('touchend',function(e){
        e.stopPropagation();
        clearTimeout(time);
    });

    function showImg(){
        $("#roomName").css("display","none");
        $("#sceneModel").html(name).css("display","block");
        $(id).css("display","block");
        if(id=="#dimmer_light"){
            //调光灯面板内容
            div=`
            <div id="cans">
                <canvas id="canvas"></canvas>
            </div>
            <div class="brightness">
                <span class="word">亮度</span>
                <div class="scale_panel">
                    <div class="scale" id="bar">
                        <div></div>
                        <span id="btn"></span>
                    </div>
                </div>
                <span id="title">0</span>
            </div>
        `;
            $(id).html(div);
            //canvas画除面板灯外环
            jQuery.fn.can = function (d,va,lab) {
                document.getElementsByTagName('html')[0].style.fontSize=window.screen.width/10 +'px';
                var len=parseFloat(window.screen.width/10);
                var canvasWidth=len*5.73;
                var canvasHeight=len*6.8;
                var innerR=len*2.67;
                canvas.setAttribute('width',canvasWidth+'px');
                canvas.setAttribute('height',canvasHeight+'px');

                //灰色圆环
                var ctx = d.getContext('2d');
                ctx.font = 0.4*len+'px simhei';
                ctx.textBaseline = 'middle';
                var deg = 0;
                //绘制虚线
                ctx.setLineDash([0.08*len,0.16*len]);
                ctx.lineWidth = 0.4*len;
                ctx.clearRect(0, 0, 5.73*len, 6.8*len);
                //灰色外框
                ctx.beginPath();
                ctx.arc(canvasWidth/2, 3.53*len, innerR, -5*Math.PI/4, Math.PI/4);
                ctx.strokeStyle ='rgba(191,191,191,0.5)';// '#bfbfbf';
                ctx.stroke();

                //进度条
                ctx.beginPath();
                deg += va;
                ctx.arc(canvasWidth/2, 3.53*len, innerR, -5*Math.PI / 4, deg *3* Math.PI / 200 -5* Math.PI / 4);
                ctx.strokeStyle = '#30b15f';
                ctx.stroke();

                //进度提示文字//
                var txt = va + '%';
                ctx.fillStyle='#333';
                var w = ctx.measureText(txt).width;

                ctx.fillText(txt, canvasWidth/2 - w / 2, 5.53*len);
                var txt1 = lab;
                var w1=ctx.measureText(txt1).width;
                ctx.fillText(txt1, canvasWidth/2-w1/2, 6.53*len);
            };
            //进度条
            var scale = function (btn,bar,title){
                this.btn=document.getElementById(btn);
                this.bar=document.getElementById(bar);
                this.title=document.getElementById(title);
                this.step=this.bar.getElementsByTagName("div")[0];
                this.init();
            };
            scale.prototype={
                //初始化，移动端touch事件，PC端则相应为mouse事件
                init:function (){
                    var f=this,g=document,b=window,m=Math;
                    f.btn.addEventListener('touchstart',function (e){
                        var x=(e||b.event).touches[0].clientX;
                        var l=this.offsetLeft;
                        var max=f.bar.offsetWidth-this.offsetWidth;
                        g.addEventListener('touchmove',function (e){
                            //event.preventDefault();
                            e.stopPropagation();
                            var thisX=(e||b.event).touches[0].clientX;
                            var to=m.min(max,m.max(-2,l+(thisX-x)));
                            f.btn.style.left=to+'px';
                            f.ondrag(m.round(m.max(0,to/max)*100),to);
                            b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();
                        });
                        g.addEventListener('touchend',function(){new Function('this.ontouchmove=null')});
                    });
                },
                //进度条拖拽事件
                ondrag:function (pos,x){
                    this.step.style.width=Math.max(0,x)+'px';
                    this.title.innerHTML=pos+'%';
                    $('#d1').can(canvas,pos,"调光灯");
                }
            };
            $('#cans').can(canvas,0,"调光灯");
            new scale('btn','bar','title');
        }else{
            console.log("不是调光灯面板控件");
        }
    }
}

function touchModelShow(cls,id,modId){
    //会客模式长按事件
    var timeReceive = 0;//初始化起始时间
    $(cls).on('touchstart',function(e){
        e.stopPropagation();
        timeReceive = setTimeout(function(){
            showReceive(e);
        }, 1000);//这里设置长按响应时间
    });

    $(cls).on('touchend',function(e){
        e.stopPropagation();
        clearTimeout(timeReceive);
    });
    function showReceive(e){
        //event.preventDefault();
        e.stopPropagation();
        $("#roomName").css("display","none");
        $("#sceneModel").html("会客模式").css("display","block");
        //进入模式后的模式面板界面
        $.ajax({
            url:'http://'+zoneServerIp + ':8080/ucotSmart/sceneControlAction!getScenceDetail.action',
            type:'POST',
            data:'id='+modId,
            success:function(js){
                var js=strToJson(js);
                var div="";
                div="<img src='img/img@2x.png'/><ul class='elecDifference'>";
                for(var key in js.obj){
                    var b=js.obj[key];
                    for(var key2 in b){
                        var keyType=key2.split(",")[1];
                        for(var i=0;i<electricLists.length;i++){
                            var inti=electricLists[i];
                            var actionElec=inti.status[b[key2].action];
                            if(inti.type==keyType) {
                                div+="<li class='elecImg "+inti.value+"'><span class='elecName '>"+key2.split(",")[0]+"</span>"+
                                    "<span class='elecStatus'>"+actionElec+"</span>"+
                                    "<span class='elecRoom'>"+key+"</span></li>";
                            }
                        }

                    }
                }
                div+="</ul>";
                $(id).html(div);
                $(id).css("display","block");
            },
            error:function(){
                //alert("进入模式面板失败");
                checknet();
            }
        });
    }
}


