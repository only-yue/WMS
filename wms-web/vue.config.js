module.exports = {
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        ws: true,
        secure: false,
        onProxyRes: function(proxyRes, req, res) {
          console.log('代理请求路径：', req.url);
          console.log('代理响应状态：', proxyRes.statusCode);
        },
        onError: function(err, req, res) {
          console.error('代理错误：', err);
        }
      }
    },
    host: 'localhost',
    open: true,
    https: false,
    disableHostCheck: true,
  },
  configureWebpack: {
    module: {
      rules: []  // 移除自定义规则，使用 Vue CLI 的默认配置
    }
  }
} 