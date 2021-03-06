// ==UserScript==
// @name         ECN Webqueue Helper
// @namespace    https://github.com/jknigga/ecn-webqueue-helper
// @version      1.0
// @description  try to take over the world!
// @author       Jakob Knigga
// @match        https://engineering.purdue.edu/webqueue/*
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @updateURL    https://raw.githubusercontent.com/jknigga/ecn-webqueue-helper/master/ecn-webqueue-helper.userscript.js
// @resource     myblacklist https://raw.githubusercontent.com/jknigga/ecn-webqueue-helper/master/blacklist.txt
// @grant        GM_getResourceText
// ==/UserScript==

(function ($, undefined) {
    $(function () {

        var raw_list = GM_getResourceText("myblacklist");
        raw_list = raw_list.replace(/(\r\n|\n|\r)/gm,"");
        var blacklist = raw_list.split(",");
        var newstyles = '<style>.row-spam td {background: rgb(255, 232, 232);}</style>';
        var refreshtime;

        function checkPageChange() {
            var checktime = $('#last-refresh').html();
            console.log(checktime);
            if (checktime != refreshtime) {
                getRows();
                refreshtime = checktime;
            }
        }
        function processRow() {
            $('tr').each(function(){
                var num = $(this).attr('id');
                var temp = $(this).closest('#item-table').prev('.group-by-header').html();
                temp = temp.split(': ');
                var queue = temp[1].toLowerCase();

                $(this).removeAttr('onclick');
                var item = $(this).find('.body-number').html();
                if (item) {
                    if (item.indexOf("lock") > 0) {
                        item = item.replace('<img src="images/lock.gif">&nbsp;','');
                    }
                    $(this).find('td:not(:first)').click(function(){
                        showItem(queue,item,'');
                    });
                }
                var from = $(this).find('.body-from_username').html();
                if (blacklist.indexOf(from) > 0) {
                    $(this).addClass('row-spam');
                }
            });
        }
        function getRows() {
            processRow();
            $('.head-number').before('<th class="head-trash" style="width:45px;">Trash?</th>');
            $('.body-number').each(function(){
                var num = $(this).html();
                if ($.isNumeric(num)) {
                    $(this).before('<td class="trash-column"><button class="trash-button" style="font-size: 9px;" id="'+num+'">Trash</button></td>');
                } else {
                    $(this).before('<td class="trash-column"></td>');
                }
            });
        }
        function markTrashAjax(queue,item){
            $.ajax({
                method: "POST",
                url: "https://engineering.purdue.edu/webqueue/index.cgi",
                data: { action: "edit", queue_name: queue, number : item, refile_queue : "trash", submit: "Mark as Trash" }
            })
                .done(function() {
                    $('.body-number').filter(function(){
                        return $(this).text() === item;
                    }).parent().remove();
                });
        }
        $(document).ready(function(){
            //add styles
            $(document.body).append(newstyles);
            //do the stuff
            setInterval(checkPageChange,2000);
            $('body').on('click','.trash-button',function(){
                var num = $(this).attr('id');
                var temp = $(this).closest('#item-table').prev('.group-by-header').html();
                temp = temp.split(': ');
                var queue = temp[1].toLowerCase();
                markTrashAjax(queue,num);
            });
        });
    });
})(window.jQuery.noConflict(true));
