const jwt = require('jsonwebtoken')
const moment = require('moment')

// 用户登录
const POST_ = async (ctx, next) => {
    let {
        username,
        password
    } = ctx.request.body
    let user = await ctx.mdb.findOne('user', { username, password })
    if (!user) {
        ctx.retErr({
            message: '用户名或密码错误',
            status: 401
        })
        return
    }
    let routers = await ctx.mdb.find('routers', {
        $or: [{
            roles: user.role
        }]
    })
    routers = routers.map(r => ({
        path: r.path,
        key: r.key,
        name: r.name,
        children: r.children,
        sort: r.sort,
        icon: r.icon
    }))
    if (user) {
        const userToken = {
            username,
            loginTime: Date.now()
        }
        const expiresIn = moment().add(7, 'days').format('x')
        const token = jwt.sign(userToken, ctx.app.secret, { expiresIn })
        ctx.jsonResp({
            username: user.username,
            token,
            routers
        }, {
            message: '登陆成功'
        })
    } else {
        ctx.retErr({
            code: 401,
            message: '账号或密码错误'
        })
    }
}

module.exports = {
    POST_
}