

module.exports = {
	module: {
    loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    loose: ['es6.classes', 'es6.modules']
                }
            }
            ]
    },
	entry:{
		index:['./H5Lock.js','./index.js']
	},
	output:{
		filename:'./dist/[name].js'
	}
}