module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app:  'app',
        dist: 'app/build'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {

            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '<%= yeoman.app %>/views/*/*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9001,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35728
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/src/lib',
                                connect.static('./src/lib')
                            ),
                            connect().use(
                                '/app/src/css',
                                connect.static('./app/src/css')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/css/index.min.css': [
						'<%= yeoman.app %>/src/css/main.css',
                        '<%= yeoman.app %>/src/css/mod/common/layout.css',
						'<%= yeoman.app %>/src/css/mod/common/pagination.css',
						'<%= yeoman.app %>/src/css/mod/common/modal.css',
						'<%= yeoman.app %>/src/css/mod/common/table.css',
						'<%= yeoman.app %>/src/css/mod/common/form.css',
						'<%= yeoman.app %>/src/css/mod/common/scrollbar.css',
						'<%= yeoman.app %>/src/css/mod/common/button.css',
						'<%= yeoman.app %>/src/css/mod/common/sideNav.css',
						'<%= yeoman.app %>/src/css/mod/login/{,*/}*.css',
						'<%= yeoman.app %>/src/css/mod/setting/{,*/}*.css',
                    ]
                }
            }
        },
        uglify: {
			options: {
				mangle: false, //������������
				preserveComments: 'false', //��ɾ��ע�ͣ�������Ϊ false��ɾ��ȫ��ע�ͣ���some������@preserve @license @cc_on��ע�ͣ�
				footer:'\n/*! �����޸��ڣ� <%= grunt.template.today("yyyy-mm-dd") %> */'//����footer
			},
            dist: {
                files: {
                    '<%= yeoman.dist %>/js/login.min.js': [
                        '<%= yeoman.app %>/src/js/controllers/login/index.js'
                    ],
                    '<%= yeoman.dist %>/js/header.min.js': [
                        '<%= yeoman.app %>/src/js/controllers/pub/header.js'
                    ],
                    '<%= yeoman.dist %>/js/setting.min.js': [
                        '<%= yeoman.app %>/src/js/controllers/setting/userSetting.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/roleSetting.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/safety.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/systemAlarm.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/audit.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/auditAnaly.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/assess.js',
                        '<%= yeoman.app %>/src/js/controllers/setting/activeUser.js'
                    ]
                }
            }
        },
    });
    grunt.registerTask('default', [
        'serve'
    ]);
};
