# wms-web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Troubleshooting

### Error: error:0308010C:digital envelope routines::unsupported

If you encounter the following error when running `npm run serve`:

```
Error: error:0308010C:digital envelope routines::unsupported
```

You can resolve this issue by following one of these methods:

1. **Downgrade Node.js**: Use Node.js version 16.x.
2. **Set Environment Variable**: Run the following command:
   - For Unix-based systems:
     ```bash
     export NODE_OPTIONS=--openssl-legacy-provider
     ```
   - For Windows:
     ```cmd
     set NODE_OPTIONS=--openssl-legacy-provider
     ```
3. **Update Webpack**: Ensure you are using the latest version of Webpack:
   ```bash
   npm install webpack@latest webpack-cli@latest
   ```

### Error: Rule can only have one resource source

If you encounter the following error when running `npm run serve`:

```
Error: Rule can only have one resource source (provided resource and test + include + exclude)
```

You can resolve this issue by following these steps:

1. **Check Webpack Configuration**: Ensure that each rule in your `webpack.config.js` or `vue.config.js` only defines one resource source (either `test`, `include`, or `exclude`).
2. **Update Dependencies**: Make sure you are using the latest versions of Webpack and related plugins:
   ```bash
   npm install webpack@latest webpack-cli@latest
   ```
3. **Clear Cache**: Delete the `node_modules/.cache` directory and try running the build command again:
   - For Unix-based systems:
     ```bash
     rm -rf node_modules/.cache
     ```
   - For Windows PowerShell:
     ```powershell
     Remove-Item -Recurse -Force node_modules\.cache
     ```
4. **Check Other Files**: Ensure that other related files do not have similar configuration errors.
