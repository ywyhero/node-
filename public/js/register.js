$('#register').on('click', function() {
    var name = $('#registername').val();
    var password = $('#registerpassword').val();
    if (name === '' || password === '') {
        alert('登录名或者密码为空')
        return
    }
    $.post('/api/register', {
        "name": name,
        "password": password
    }, function(res) {
        if (res.code === 1) {
            window.location.href = '/login'
        } else if (res.code === -5) {
            alert('登陆名重复')
        }
    })
})