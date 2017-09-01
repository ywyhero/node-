$('#login').on('click', function() {
    var name = $('#loginname').val();
    var password = $('#loginpassword').val();
    var key = CryptoJS.enc.Utf8.parse('VINEYAO!@#$%^&*=')
    password = CryptoJS.AES.encrypt(password, key, {
        mode: CryptoJS.mode['ECB'],
        padding: CryptoJS.pad['ZeroPadding'],
        iv: key
    }).toString();
    $.post('/api/login', {
        'name': name,
        'password': password
    }, function(res) {
        if (res.code === 1) {
            window.location.href = '/home'
        } else if (res.code === -5) {
            alert('此用户名没有注册')
        } else {
            alert('密码错误')
        }

    })

})