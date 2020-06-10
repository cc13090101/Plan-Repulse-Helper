// ==UserScript==
// @icon         https://jrol.xyz/favicon.ico
// @name         Plan Repulse Helper
// @namespace    https://jrol.xyz/game
// @version      0.0.20200610
// @description  Plan Repulse 远征胖次
// @author       木木祭曦
// @grant        none
// @match        https://jrol.xyz/game/game.php*
// @match        https://jrol.xyz/game/index.php*
// @homepageURL  https://github.com/cc13090101/Bondage-College-Helper
// @downloadURL  https://github.com/cc13090101/Bondage-College-Helper/raw/master/Bondage-College-Helper.user.js
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...
    var flag_index = true;
    var flag_timecount = true;
    var flag_fleetTable = true;
    var flag_fleetStep1 = true;
    var flag_fleetStep2 = true;
    var flag_fleetStep3 = true;
    var flag_buildings = true;
    var flag_research = true;
    var flag_officier = true;

    var username = "";//用户名
    var password = "";//密码
    var model_fleetTable = "16";//舰队调度模式（15：探险；16：突袭）

    var model_level = "2_5";//突袭难度（说明详见说明书），另外，请自行判断战斗技能是否符合带路要求
    var ship203_num = "35";//困难+模式难度调整，无上限（我不信，字段的大小肯定限制了输入的最大值，只不过玩家达不到）
    var timecount = 300;//页面操作、刷新倒计时（单位：秒）,防止会话超时
    var cp_0 = "";// 默认舰队调度初始页面对应的岛屿

    var galaxy_0 = "";//默认出发岛屿 海域
    var system_0 = "";//默认出发岛屿 群岛
    var planet_0 = "";//默认出发岛屿 名次
    var type_0 = "1";//默认出发岛屿 类型（1：岛屿；2：废墟；3：人工岛）
    var target_mission_0 = "0";//默认出发岛屿 隐藏参数不知道什么用（默认为0，不要修改）

    var galaxy_1 = "";//默认抵达岛屿 海域
    var system_1 = "";//默认抵达岛屿 群岛
    var planet_1 = "";//默认抵达岛屿 名次
    var type_1 = "1";//默认抵达岛屿 类型（1：岛屿；2：废墟；3：人工岛）

    var staytime_num = "1";//舰队调度时间（1至17）
    var speed_num = "10";//舰队航速（1至10，对应10%至100%）

    //这里的配置不要乱动，上面的随意。
    var NoChooseCSS = "-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;";
    var LocationUrl = document.location.href.toString();
    var HostUrl = "https://jrol.xyz/game/";
    document.body.style.backgroundColor="#66CCFF";
    document.body.style.backgroundImage="url()";

    //添加舰队调度状态修改按钮(暂不开放使用)
    var div_flag_fleetTable = document.createElement("div");
    div_flag_fleetTable.id = "div_flag_fleetTable";
    div_flag_fleetTable.style = NoChooseCSS + "width:120px; height:15px;z-index:9999;position:absolute !important;left: 299px;top:65px; background-color:black";
    div_flag_fleetTable.innerHTML = "舰队调度-状态:    <span id=\"flag_fleetTable\">锁定</span>";
    //document.getElementsByTagName("body")[0].appendChild(div_flag_fleetTable);
    div_flag_fleetTable.onclick = change_flag_fleetTable;
    var span_flag_fleetTable = document.getElementById("flag_fleetTable");
    function change_flag_fleetTable(){
        if(flag_fleetTable){
            flag_fleetTable = false;
            span_flag_fleetTable.innerText = "正常";
        }else{
            flag_fleetTable = true;
            span_flag_fleetTable.innerText = "锁定";
        }
    }

    //添加倒计时（到时间自动跳转舰队调度页面）
    var div_timecount = document.createElement("div");
    div_timecount.id = "div_timecount";
    div_timecount.style = " width:180px; height:15px;z-index:9999;position:absolute !important;left: 299px;top:30px; background-color:black";
    div_timecount.innerHTML = "页面剩余操作时间-倒计时:<span id=\"timecount\">" + timecount + "</span>秒";
    document.getElementsByTagName("body")[0].appendChild(div_timecount);
    var span_timecount;
    window.setInterval(function() {
		if(LocationUrl.indexOf(HostUrl + "game.php") != -1 && flag_timecount){
            span_timecount = document.getElementById("timecount");
            var num_timecount = Number(span_timecount.innerText);
            if(num_timecount > 0){
                num_timecount = num_timecount - 1;
                span_timecount.innerText = num_timecount;
            }else{
                window.location.href = HostUrl + "game.php?page=fleetTable&cp=" + cp_0;
            }
        }
	}, 1000);

    //自动登录
    if(LocationUrl.indexOf(HostUrl + "index.php") != -1 && flag_index){
        var universe = document.getElementById("universe");
        for (var i_universe = 0; i_universe < universe.options.length; i_universe++){
            if (universe.options[i_universe].value == "1"){
                universe.options[i_universe].selected = true;
                break;
            }
        }
        document.getElementById("username").value = username;
        document.getElementById("password").value = password;
        var inputs = document.getElementsByTagName("input");
        for(var input of inputs) {
            if(input.type == "submit" && input.value == "登录"){
                input.click();
            }
        }
    }

    //自动刷新舰队调度列表
    var timmer_fleettime = 0;
    var planetSelector = document.getElementById("planetSelector");
    if(LocationUrl.indexOf(HostUrl + "game.php?page=fleetTable") != -1 && flag_fleetTable){
        if(LocationUrl.indexOf(HostUrl + "game.php?page=fleetTable&cp="+cp_0) == -1){
            window.location.href = HostUrl + "game.php?page=fleetTable&cp=" + cp_0 + "&flag_fleetTable=" + flag_fleetTable;
        }
        var values_JD = document.getElementsByClassName("transparent")[0].innerText.replace("舰队","").replace(" ","").split("/");
        for (var i_value_JD = 1; i_value_JD <= Number(values_JD[0]); i_value_JD++){
            var fleettime = document.getElementById("fleettime_" + i_value_JD);
            if (fleettime.innerText == "-"){
                location.reload();
                timmer_fleettime = 0;
            }else{
                var clock = fleettime.innerText.split(":");
                var seconds = Number(clock[0])*3600 + Number(clock[1])*60 + Number(clock[2]);
                if(timmer_fleettime == 0 || timmer_fleettime > seconds){
                    timmer_fleettime = seconds;
                }
            }
        }
        if(timmer_fleettime > 0){
            setTimeout(function(){
                location.reload();
                timmer_fleettime = 0;
            }, (timmer_fleettime + 1) * 1000);
        }      
        for (var i_planetSelector = 0; i_planetSelector < planetSelector.options.length; i_planetSelector++){
            if (planetSelector.options[i_planetSelector].value == cp_0){
                planetSelector.options[i_planetSelector].selected = true;
                break;
            }
        }
        var values_TX = document.getElementsByClassName("transparent")[1].innerText.replace("探险","").replace(" ","").split("/");
        if((Number(values_TX[0]) < Number(values_TX[1])) && (Number(values_JD[0]) < Number(values_JD[1]))){
            switch(model_fleetTable) {
                case "15":
                    document.getElementById("ship240_input").value = "1";//1紫云（常用）
                    break;
                case "16":
                    switch(model_level) {
                            //添加出战船只的格式为：
                            //document.getElementById("ship000_input").value = "0";
                            //000为船只编号，0为船只数量，不支持叠加，请一次性算清（每个航道单独计算）
                            //具体船只编号会给出说明文档

                            //简单模式
                        case "1_1"://深海小型支队：1吹雪
                            document.getElementById("ship204_input").value = "1";//1吹雪（必备）
                            break;
                        case "1_2"://深海巡洋支队：2Z16
                            document.getElementById("ship205_input").value = "2";//2Z16（必备）
                            break;
                        case "1_3"://深海主力舰队：3萤火虫
                            document.getElementById("ship206_input").value = "3";//3萤火虫（必备）
                            break;
                        case "1_4"://深海基地：4基林
                            document.getElementById("ship207_input").value = "4";//4基林（必备）
                            document.getElementById("ship224_input").value = "5";//5阿拉斯加（自配）
                            document.getElementById("ship225_input").value = "5";//5胡德（自配）
                            break;
                        case "1_5"://深海航母战斗群：5逸仙
                            document.getElementById("ship214_input").value = "5";//5逸仙（必备）
                            break;
                        case "1_6"://深海哨戒小队：无
                            break;

                            //困难模式（困难+模式）
                        case "2_1"://深海高速巡洋队：1海王星，战斗科技10以上
                            document.getElementById("ship203_input").value = ship203_num;//登陆舰（难度调整）
                            document.getElementById("ship216_input").value = "1";//1海王星（必备）
                            document.getElementById("ship243_input").value = "1";//1马里兰（战斗回收）
                            break;
                        case "2_2"://深海巡弋舰队：1基洛夫，战斗科技12以上
                            document.getElementById("ship203_input").value = ship203_num;//登陆舰（难度调整）
                            document.getElementById("ship217_input").value = "1";//1基洛夫（必备）
                            document.getElementById("ship243_input").value = "1";//1马里兰（战斗回收）
                            break;
                        case "2_3"://深海破袭支队：1肯特，战斗科技14以上
                            document.getElementById("ship203_input").value = ship203_num;//登陆舰（难度调整）
                            document.getElementById("ship218_input").value = "1";//1肯特（必备）
                            document.getElementById("ship243_input").value = "1";//1马里兰（战斗回收）
                            break;
                        case "2_4"://深海船坞：1欧根亲王，战斗科技16以上
                            document.getElementById("ship203_input").value = ship203_num;//登陆舰（难度调整）
                            document.getElementById("ship219_input").value = "1";//1欧根亲王（必备）
                            document.getElementById("ship243_input").value = "1";//1马里兰（战斗回收前置）
                            document.getElementById("ship209_input").value = "2";//2祥凤（战斗回收）
                            document.getElementById("ship241_input").value = "43000";//43000u47（自配）
                            document.getElementById("ship228_input").value = "1200";//1200密苏里（自配）
                            document.getElementById("ship227_input").value = "250";//250俾斯麦（自配）
                            break;
                        case "2_5"://深海主力纵队：1彭萨克拉，战斗科技17以上
                            document.getElementById("ship203_input").value = ship203_num;//登陆舰（难度调整）
                            document.getElementById("ship220_input").value = "1";//1彭萨克拉（必备）
                            document.getElementById("ship243_input").value = "1";//1马里兰（战斗回收前置）
                            document.getElementById("ship209_input").value = "2";//2祥凤（战斗回收）
                            document.getElementById("ship241_input").value = "114000";//114000u47（自配）
                            document.getElementById("ship228_input").value = "4500";//4500密苏里（自配）
                            document.getElementById("ship227_input").value = "900";//900俾斯麦（自配）
                            break;
                    }
                    break;
            }

            document.getElementsByName("galaxy")[0].value = galaxy_0;
            document.getElementsByName("system")[0].value = system_0;
            document.getElementsByName("planet")[0].value = planet_0;
            document.getElementsByName("type")[0].value = type_0;
            document.getElementsByName("target_mission")[0].value = target_mission_0;
            var inputs_fleetTable = document.getElementsByTagName("input");
            for(var input_fleetTable of inputs_fleetTable) {
                if(input_fleetTable.type == "submit" && input_fleetTable.value == "继续"){
                    input_fleetTable.click();
                }
            }
        }
    }

    //自动设置舰队调度目的地
    if(LocationUrl.indexOf(HostUrl + "game.php?page=fleetStep1") != -1 && flag_fleetStep1){
        document.getElementById("galaxy").value = galaxy_1;
        document.getElementById("system").value = system_1;
        document.getElementById("planet").value = planet_1;

        var select_type = document.getElementById("type");
        for (var i_select_type = 0; i_select_type < select_type.options.length; i_select_type++){
            if (select_type.options[i_select_type].value == type_0){
                select_type.options[i_select_type].selected = true;
                updateVars();//刷新页面数据，原游戏自带js方法
                break;
            }
        }

        var select_speed = document.getElementById("speed");
        for (var i_select_speed = 0; i_select_speed < select_speed.options.length; i_select_speed++){
            if (select_speed.options[i_select_speed].value == speed_num){
                select_speed.options[i_select_speed].selected = true;
                updateVars();//刷新页面数据，原游戏自带js方法
                break;
            }
        }

        var inputs_fleetStep1 = document.getElementsByTagName("input");
        for(var input_fleetStep1 of inputs_fleetStep1) {
            if(input_fleetStep1.type == "submit" && input_fleetStep1.value == "继续"){
                input_fleetStep1.click();
            }
        }
    }

    //自动设置舰队调度配置
    if(LocationUrl.indexOf(HostUrl + "game.php?page=fleetStep2") != -1 && flag_fleetStep2){
        document.getElementById("radio_" + model_fleetTable).checked = "checked";//15:探险；16:突袭
        var staytime = document.getElementsByName("staytime")[0];
        for (var i_staytime = 0; i_staytime < staytime.options.length; i_staytime++){
            if (staytime.options[i_staytime].value == staytime_num){
                staytime.options[i_staytime].selected = true;
                break;
            }
        }
        var inputs_fleetStep2 = document.getElementsByTagName("input");
        for(var input_fleetStep2 of inputs_fleetStep2) {
            if(input_fleetStep2.type == "submit" && input_fleetStep2.value == "继续"){
                input_fleetStep2.click();
            }
        }
    }

    //检测到突袭结束页面，立刻返回舰队调度页面
     if(LocationUrl.indexOf(HostUrl + "game.php?page=fleetStep3") != -1 && flag_fleetStep3){
         window.location.href = HostUrl + "game.php?page=fleetTable&cp=" + cp_0;
    }

    //主界面重写
    var View_content_table_Html = "<table style=\"width:1400px\"><tbody>"+
        "<tr>"+
        "<td id=\"view_buildlist\" colspan=\"2\"></td>"+
        "</tr>"+
        "<tr>"+
        "<td id=\"view_main\" style=\"width:780px\"></td>"+
        "<td style=\"vertical-align:top !important;\"><table style=\"width:620px\"><tbody id=\"view_help\">"+
        "<tr><th style=\"text-align:center;width:50%;\">名称</th><th style=\"text-align:center;width:10%;\">建议等级</th><th style=\"text-align:center;width:10%;\">当前等级</th><th style=\"text-align:center;width:30%;\">操作</th></tr>"+
        "</tbody></table></td>"+
        "</tr></tbody></table>";

    //添加建造单项
    var tr_buildings_innerHTML_model = "<tr id=\"tr_{编号}\">"+
        "<td>{名称}</td>"+
        "<td>{建议等级}</td>"+
        "<td><font id=\"f_{编号}\" color=\"red\">{当前等级}</font></td>"+
        "<td>{按钮}</td>"+
        "</tr>";

    function tr_buildings_Add(num, suggestLevel){
        var view_main = document.getElementById("view_main").children[0].children[0];
        var view_help = document.getElementById("view_help");
        var elementnum;
        var elementname;
        var elementlevel;
        var tr0 ;
        var tr0_a;
        var tr0_innerHtml;
        var tr0_innerText;
        var tr1 ;
        var tr1_form ;
        for(var i_buildings = 0;i_buildings < (view_main.children.length/3); i_buildings++){
            tr0 = view_main.children[i_buildings * 3];
            tr0_a = tr0.children[1];
            tr0_innerHtml = tr0_a.innerHTML;
            tr0_innerText = tr0_a.innerText;
            elementnum = tr0_innerHtml.substring(tr0_innerHtml.indexOf("info(") + 5, tr0_innerHtml.indexOf(")\">"));
            //elementname = tr0_innerText.substring(0,tr0_innerText.indexOf(" (等级"));
            elementname = tr0_innerHtml.substring(0,tr0_innerHtml.lastIndexOf(" (等级 "));
            elementlevel = tr0_innerText.substring(tr0_innerText.indexOf("(等级 ")+4,tr0_innerText.lastIndexOf(")"));
            tr1 = view_main.children[i_buildings * 3 + 1];
            tr1_form = tr1.children[0].children[0].children[0].children[0].children[1].innerHTML;
            if(elementnum == num){
                var tr_buildings_innerHTML = tr_buildings_innerHTML_model.replace(/{编号}/g,elementnum).replace(/{名称}/g,elementname).replace(/{建议等级}/g,suggestLevel).replace(/{当前等级}/g,elementlevel).replace(/{按钮}/g,tr1_form);
                view_help.innerHTML += tr_buildings_innerHTML;
                if(suggestLevel <= elementlevel){
                    var font = document.getElementById("f_" + elementnum);
                    font.color = "blue";
                }
            }
        }
    }

    //建造
    if(LocationUrl.indexOf(HostUrl + "game.php?page=buildings") != -1 && flag_buildings){
        var buildings_content = document.getElementById("content");
        var buildings_buildlist = document.getElementById("buildlist");
        var buildings_innerHTML ;
        if(buildings_buildlist != null){
            buildings_content.removeChild(buildings_buildlist);
        }
        buildings_innerHTML = buildings_content.innerHTML;
        buildings_content.innerHTML = View_content_table_Html;
        var buildings_view_buildlist = document.getElementById("view_buildlist");
        if(buildings_buildlist != null){
             buildings_view_buildlist.appendChild(buildings_buildlist);
        }
        var buildings_view_main = document.getElementById("view_main");
        buildings_view_main.innerHTML = buildings_innerHTML;
        buildings_Add();
    }

    function buildings_Add(){
        tr_buildings_Add(1, 50);
        tr_buildings_Add(2, 50);
        tr_buildings_Add(3, 50);
        tr_buildings_Add(6, 15);
        tr_buildings_Add(14, 20);
        tr_buildings_Add(15, 8);
        tr_buildings_Add(21, 25);
        tr_buildings_Add(22, 20);
        tr_buildings_Add(23, 20);
        tr_buildings_Add(24, 20);
        tr_buildings_Add(31, 22);
        tr_buildings_Add(41, 1);
        tr_buildings_Add(44, 4);
        tr_buildings_Add(33, 10);
    }

    //开发
    if(LocationUrl.indexOf(HostUrl + "game.php?page=research") != -1 && flag_research){
        var research_content = document.getElementById("content");
        var research_buildlist = document.getElementById("buildlist");
        var research_innerHTML ;
        if(research_buildlist != null){
            research_content.removeChild(research_buildlist);
        }
        research_innerHTML = research_content.innerHTML;
        research_content.innerHTML = View_content_table_Html;
        var research_view_buildlist = document.getElementById("view_buildlist");
        if(research_buildlist != null){
            research_view_buildlist.appendChild(research_buildlist);
        }
        var research_view_main = document.getElementById("view_main");
        research_view_main.innerHTML = research_innerHTML;
        research_Add();
    }

    function research_Add(){
        tr_buildings_Add(106, 12);
        tr_buildings_Add(108, 15);
        tr_buildings_Add(109, 20);
        tr_buildings_Add(110, 22);
        tr_buildings_Add(111, 25);
        tr_buildings_Add(113, 16);
        tr_buildings_Add(114, 15);
        tr_buildings_Add(115, 8);
        tr_buildings_Add(117, 15);
        tr_buildings_Add(118, 15);
        tr_buildings_Add(120, 25);
        tr_buildings_Add(121, 20);
        tr_buildings_Add(122, 20);
        tr_buildings_Add(123, 5);
        tr_buildings_Add(124, 25);
        tr_buildings_Add(131, 2);
        tr_buildings_Add(132, 9);
        tr_buildings_Add(133, 0);
        tr_buildings_Add(199, 10);
    }

    //战利品
    //if(LocationUrl.indexOf(HostUrl + "game.php?page=officier") != -1 && flag_officier){
    //    var officier_content = document.getElementById("content");
    //    var officier_tbody = officier_content.children[3].children[0];
    //    for(var i_officier_tbody = 0;i_officier_tbody < (officier_tbody.children.length/2); i_officier_tbody++){
    //        tr2 = view_main.children[i_officier_tbody * 2 + 1];
    //    }
    //    officier_Add();
    //}

   // function officier_Add(){
   //     tr_buildings_Add(num, suggestLevel);
   // }

})();