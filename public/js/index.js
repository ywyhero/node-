var username = ''
var page = 1
getLists(1)

function getLists(page) {
    $.post('/api/alllists', { 'limit': 12, 'page': page }, function(result) {
        var lists = result.result.lists
        $('#lists').html('')
        for (var i = 0; i < lists.length; i++) {
            var div = $('<div class="col-md-4"><h1>' + lists[i].name + '</h1><p>' + lists[i].content + '</p></div>')
            $('#lists').append(div);
        }
    })
}
$('.pagenum:first').addClass('active')
$('.pagenum').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active')
    page = parseInt($(this).children().html())
    getLists(page)
    var maxpage = parseInt($('.pagenum:last').children().html())
    if (page === maxpage) {
        $('.next').addClass('disabled')
    } else if (page < maxpage) {
        $('.next').removeClass('disabled')
    }
    var minpage = parseInt($('.pagenum:first').children().html())
    if (page === minpage) {
        $('.previous').addClass('disabled')
    } else if (page > minpage) {
        $('.previous').removeClass('disabled')
    }
})
$('.next').on('click', function() {
    page = parseInt(page + 1)
    $('.pagenum').eq(page - 1).addClass('active').siblings().removeClass('active')
    var current = $('.pagenum').eq(page - 1).children().html()
    getLists(current)
    var maxpage = parseInt($('.pagenum:last').children().html())
    if (page === maxpage) {
        $('.next').addClass('disabled')
    } else if (page < maxpage) {
        $('.next').removeClass('disabled')
    }
    var minpage = parseInt($('.pagenum:first').children().html())
    if (page === minpage) {
        $('.previous').addClass('disabled')
    } else if (page > minpage) {
        $('.previous').removeClass('disabled')
    }
})
$('.previous').on('click', function() {
    page = parseInt(page - 1)
    $('.pagenum').eq(page - 1).addClass('active').siblings().removeClass('active')
    var current = $('.pagenum').eq(page - 1).children().html()
    getLists(current)
    var maxpage = parseInt($('.pagenum:last').children().html())
    if (page === maxpage) {
        $('.next').addClass('disabled')
    } else if (page < maxpage) {
        $('.next').removeClass('disabled')
    }
    var minpage = parseInt($('.pagenum:first').children().html())
    if (page === minpage) {
        $('.previous').addClass('disabled')
    } else if (page > minpage) {
        $('.previous').removeClass('disabled')
    }
})
$.post('/api/userInfo', {}, (res) => {
    if (res.username !== '') {
        username = res.username;
        $('#loginInfo').html('');
        let user = '<li style="margin-right:20px;"><a>欢迎您：' + res.username + '</a></li><button id="loginout" class="btn btn-danger navbar-btn">退出</button>'
        $('#loginInfo').html(user)
        $('#headImg').attr('src', res.imgurl)
        $('#header-name').html(res.username)
        $('#loginout').on('click', function() {
            $.post('/api/loginout', {}, function(res) {
                if (res.code === 1) {
                    window.location.href = '/'
                }
            })
        })
        $('#submit').on('click', function() {
            var content = $('#text').val();
            if (content !== '') {
                var time = new Date()
                $.post('/api/submit', { "content": content, 'name': username, 'time': time }, function(res) {
                    if (res.code === 1) {
                        $('#text').val('');
                        getLists(1)
                    }
                })
            } else {
                alert('请输入内容')
            }

        })
        $('#mylists').on('click', function() {
            $('#pagination').hide();
            $.post('/api/mylists', { 'name': username }, function(res) {
                var content = res.result.lists;
                $('#lists').html('');
                for (var i = 0; i < content.length; i++) {
                    var div = $('<div class="col-md-4"><h1>' + username + '</h1><p>' + content[i].content + '</p></div>')
                    $('#lists').append(div);
                }

            })
        })
        $('#userlists').on('click', function() {
            $('#pagination').hide();
            $.post('/api/userlists', function(res) {
                $('#lists').html('');
                var users = res.result.lists
                for (var i = 0; i < users.length; i++) {
                    var div = $('<div class="col-md-4"><h1>' + users[i] + '</h1></div>')
                    $('#lists').append(div);
                }

            })
        })
    }
})

$('.nav > li').on('click', function() {
    $(this).addClass('active').siblings('li').removeClass('active')
})