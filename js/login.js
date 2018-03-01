/**
 * Created by GIGA on 2017-04-27.
 */
function strToJson(str){
  var json = (new Function("return " + str))();
  return json;
}
//检查是否有网络
function checknet(){
  $("#lostNet").css("display","block");
}
$(document).ready(function(){
  //从Cookie获取到用户名
  var username = getCookie("This is username") ;
  //如果用户名为空,则给表单元素赋空值
  if ( username == ""  ){
    document.getElementById("userName").value="" ;
    document.getElementById("userPwd").value="" ;
    document.getElementById("remember").checked=false ;
  }
  //获取对应的密码,并把用户名,密码赋值给表单
  else{
    var password = getCookie(username) ;
    document.getElementById("userName").value = username ;
    document.getElementById("userPwd").value = password ;
    document.getElementById("remember").checked = true ;
  }
});

//根据注销参数 sessionStorage.num=1 修改密码为空，记住密码和自动登录 checked=false
$(document).ready(function(){
  var num=sessionStorage.num;
  if(num==1){
    sessionStorage.num=0;
    $("#userPwd").val("");
    document.getElementById("remember").checked = false ;
    document.getElementById("autoLogin").checked = false ;
  }
});

//自动登录勾选，则记住密码自动勾选
$("#autoLogin").change(function(){
  if($("#autoLogin").prop("checked")==true){
    document.getElementById("remember").checked=true;
  }
});

$(document).ready(function(){
  //自动登录
  if($("#autoLogin").prop("checked")){
    document.getElementById("remember").checked=true;
    var username=$("#userName").val();
    var password=getCookie(username);
    $.ajax({
      url:SERVER_IP + '/ucotSmart/loginAction!doNotNeedSession_login.action',
      type:'POST',
      data: "userPage.username="+username+"&&userPage.password="+password,
      success:function(data) {
        function strToJson(str){
          var json = (new Function("return " + str))();
          return json;
        }
        var js=strToJson(data);
        if (js.success === true) {
          //取token号，和取服务器地址serverIp
          sessionStorage.token=js.msg;
          sessionStorage.zoneServerIp=js.obj.serverIp;
          window.location.href = "tab-pages.html";
          return js;
        }else{
          alert('自动登陆失败');
          return false;
        }
      }
    })
  }
});

//设置cookie
var passKey = '4c05c54d952b11e691d76c0b843ea7f9';
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  //设置过期时间
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + encrypt(escape(cvalue), passKey) + "; " + expires;
}
//获取cookie
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) != -1){
      var cnameValue = unescape(c.substring(name.length, c.length));
      return decrypt(cnameValue, passKey);
    }
  }
  return "";
}
//清除cookie
function delCookie(cname) {
  setCookie(cname, "", -1);
}

function check (){
  //获取表单输入:用户名,密码,是否保存密码
  var username = document.getElementById("userName").value.trim() ;
  var password = document.getElementById("userPwd").value.trim() ;
  var isRmbPwd = document.getElementById("remember").checked ;

  //判断用户名,密码是否为空(全空格也算空)
  if ( username.length != 0 && password.length != 0 ){
    //若复选框勾选,则添加Cookie,记录密码
    if ( isRmbPwd == true )
    {
      setCookie ( "This is username", username, 7 ) ;
      setCookie ( username, password, 7 ) ;
    }
    //否则清除Cookie
    else
    {
      delCookie ( "This is username" ) ;
      delCookie ( username ) ;
    }
    return true ;
  }
  //非法输入提示
  else
  {
    alert('请输入必填字段!!!');
    return false ;
  }
}

//登陆按钮触发事件
$("#login_btn").click(function(){
    var uname=$("#userName").val();
    var upwd=$("#userPwd").val();
  //判断是否有网连接
  //  var bt=window.android.checkNet();
  //  if(bt){
      $.ajax({
        url:SERVER_IP + '/ucotSmart/loginAction!doNotNeedSession_login.action',
        type:'post',
        data: "userPage.username="+uname+"&&userPage.password="+upwd,
        success:function(data) {
          var js=strToJson(data);
          console.log(js.obj);
          console.log(js.obj.serverIp);
          //取token号，和取服务器地址serverIp
          sessionStorage.token=js.msg;
          console.log(sessionStorage.token+" --token");
          sessionStorage.zoneServerIp=js.obj.serverIp;
          window.location.href = "tab-pages.html";
        },
        error:function(){
          alert('登录失败！');
        }
      });
    //}else{
      //报错提示
      //alert("网络连接失败！");
    //}
});

//按回车键等同于登陆按钮触发事件
$(document).keyup(function (event) {
  if(event.keyCode==13){
    $('#login_btn').trigger("click");
  }
});