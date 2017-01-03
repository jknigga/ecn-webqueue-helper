// ==UserScript==
// @name         ECN Webqueue Helper
// @namespace    https://github.com/jknigga/ecn-webqueue-helper
// @version      0.7
// @description  try to take over the world!
// @author       Jakob Knigga
// @match        https://engineering.purdue.edu/webqueue/*
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @updateURL    https://raw.githubusercontent.com/jknigga/ecn-webqueue-helper/master/ecn-webqueue-helper.userscript.js
// @grant        none
// ==/UserScript==

(function ($, undefined) {
    $(function () {
        var refreshtime;

        function checkPageChange() {
            var checktime = $('#last-refresh').html();
            console.log(checktime);
            if (checktime != refreshtime) {
                getRows();
                refreshtime = checktime;
            }
        }
        function removeOnclick() {
            $('tr').each(function(){
                var num = $(this).attr('id');
                var temp = $(this).closest('#item-table').prev('.group-by-header').html();
                temp = temp.split(': ');
                var queue = temp[1].toLowerCase();

                $(this).removeAttr('onclick');
                var item = $(this).find('.body-number').html();
                if ($.inNumeric(item) == false) {
                    item = item.replace('<img src="images/lock.gif">&nbsp;','');
                }
                $(this).find('td:not(:first)').click(function(){
                    showItem(queue,item,'');
                });
            });
        }
        function getRows() {
            removeOnclick();
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
