/**
 * Created by GIGA on 2017-05-18.
 */
//声明变量： 业主电话：ownerTel、电话号码：tel、验证码：checkCode、密码：password、确认密码：repassword
var ownerTel=document.getElementById("ownerTel");
var tel=document.getElementById("cellPhone");
var checkCode=document.getElementById("checkCode");
var password=document.getElementById("password");
var repassword=document.getElementById("rePwd");

function strToJson(str){
    var json = (new Function("return " + str))();
    return json;
}
//选择所属小区，请求得到小区服务器zoneServerIp地址
$("#zoneCode").change(function(){
        var opt=$("#zoneCode").val();
        $.ajax({
            url:SERVER_IP + "/ucotSmart/getLocalServerInfoAction!noSen_getlocalSerIp.action",
            type:"POST",
            data:"zonecode="+opt,
            success:function(data){
                var data=strToJson(data);
                sessionStorage.zoneServerIp=data.msg;

            },
            error:function(){
                alert("获取服务器地址失败！");
            }
        })
    });

//角色选择若不是业主，则需要输入业主号码
$("#role").change(function(){
    var opt=this.options[this.options.selectedIndex].value;
    if(opt==70){
        $(".owner").css("display","none");
    }else{
        $(".owner").css("display","block");
    }
});

//业主电话
ownerTel.onblur=function(){
    if(this.validity.valueMissing){
        var msg="业主电话不能为空！";
        $("#ownerInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else if(this.validity.patternMismatch){
        var msg="号码输入有误！";
        $("#ownerInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else{
        $("#ownerInfo").css("opacity","0");
        this.setCustomValidity("");
    }
};

//电话号码
tel.onblur=function(){
    if(this.validity.valueMissing){
        var msg="电话不能为空！";
        $("#telInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else if(this.validity.patternMismatch){
        var msg="号码输入有误！";
        $("#telInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else{
        $("#telInfo").css("opacity","0");
        this.setCustomValidity("");
    }
};

//验证码
checkCode.onblur=function(){
    if(this.validity.valueMissing){
        var msg="验证码不能为空!";
        $("#vCodeInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else{
        $("#vCodeInfo").css("opacity","0");
        this.setCustomValidity("");
    }
};

//倒计时60秒
var wait=60;
function time(o) {
    if (wait == 0) {
        o.removeAttribute("disabled");
        o.value="获取动态码";
        o.style.backgroundColor="#fff";
        wait = 60;
    } else {
        o.setAttribute("disabled", true);
        o.value= wait + "s"+" 重发";
        o.style.backgroundColor="#ddd";
        wait--;
        setTimeout(function() {
            time(o)
        }, 1000)
    }
}

//获取验证码
$('#send').click(function() {
    time(send);
});

//密码
password.onblur=function(){
    if(this.validity.valueMissing){
        var msg="密码不能为空！";
        $("#pwdInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else if(this.validity.tooShort){
        var msg="密码不能短于6位！";
        $("#pwdInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else if(this.validity.tooLong){
        var msg="密码不能超过12位！";
        $("#pwdInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else if(this.validity.patternMismatch){
        var msg="密码输入有误！";
        $("#pwdInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else{
        $("#pwdInfo").css("opacity","0");

        this.setCustomValidity("");
    }
};

//确认密码
repassword.onblur=function(){
    if(repassword.value!=password.value){
        var msg="两次输入的密码不一致";
        $("#cPwdInfo").css("opacity","1").html(msg);
        this.setCustomValidity(msg);
    }else{
        $("#cPwdInfo").css("opacity","0");
        this.setCustomValidity("");
    }
};

//注册按钮注册成功
$("#register_btn").click(function(){
    ownerTels=ownerTel.value;
    tels=tel.value;
    passwords=password.value;
    repasswords=repassword.value;
    vCodes=checkCode.value;
    var serIp=sessionStorage.zoneServerIp;
    var zoneValue=$("#zoneCode").val();
    var roleValue=$("#role").val();


    //var bt=window.android.checkNet();
    //if(bt){
        $.ajax({
            url:'http://'+serIp + ':8080/ucotSmart/loginAction!doNotNeedSession_reg.action',
            type:'POST',
            data: "userPage.zonecode="+zoneValue+"&&userPage.role="+roleValue+"&&userPage.ownerphone="+ownerTels
            +"&&userPage.cellphone="+tels+"&&checkCode="+vCodes+"&&userPage.password="+passwords,
            success:function(data) {
                data=strToJson(data);
                alert(data.msg);
            },
            error:function(){
                alert("注册失败！");
            }
        });
    //}else{
        //报错提示
        //alert("网络连接失败！");
    //}
});

