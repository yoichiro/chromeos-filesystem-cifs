"use strict";

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var config = {
        app: 'app',
        dist: 'dist',
        tasks: grunt.cli.tasks
    };

    grunt.initConfig({
        config: config,
        watch: {
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/*.html',
                    '<%= config.app %>/icons/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.app %>/manifest.json',
                    '<%= config.app %>/_locales/{,*/}*.json'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost',
                open: true
            },
            server: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            chrome: {
                options: {
                    open: false,
                    base: [
                        '<%= config.app %>'
                    ]
                }
            },
            test: {
                options: {
                    open: false,
                    base: [
                        'test',
                        '<%= config.app %>'
                    ]
                }
            }
        },
        clean: {
            server: '.tmp',
            chrome: '.tmp',
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '<%= config.app %>/scripts/smb_client/{,*/}*.js',
                '!<%= config.app %>/scripts/deps/*',
                '!<%= config.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'icons/{,*/}*.png',
                        'styles/{,*/}*.*',
                        '_locales/{,*/}*.json'
                    ]
                }]
            }
        },
        concat: {
            dist: {
                src: [
                    '<%= config.app %>/scripts/deps/encoding.js',
                    '<%= config.app %>/scripts/deps/encoding-indexes.js',
                    '<%= config.app %>/scripts/deps/BigInteger.min.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/core.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/enc-utf16.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/hmac.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/md5.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/evpkdf.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/cipher-core.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/mode-ecb.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/tripledes.js',
                    '<%= config.app %>/bower_components/cryptojslib/components/pad-nopadding.js',
                    '<%= config.app %>/scripts/deps/md4.js',
                    '<%= config.app %>/scripts/deps/lib-typ edarrays.js',
                    '<%= config.app %>/scripts/smb_client/smb_client.js',
                    '<%= config.app %>/scripts/smb_client/models/models.js',
                    '<%= config.app %>/scripts/smb_client/smb1/smb1.js',
                    '<%= config.app %>/scripts/smb_client/smb2/smb2.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/models.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/models.js',
                    '<%= config.app %>/scripts/smb_client/constants.js',
                    '<%= config.app %>/scripts/smb_client/debug.js',
                    '<%= config.app %>/scripts/smb_client/binary_utils.js',
                    '<%= config.app %>/scripts/smb_client/types.js',
                    '<%= config.app %>/scripts/smb_client/session.js',
                    '<%= config.app %>/scripts/smb_client/auth/auth.js',
                    '<%= config.app %>/scripts/smb_client/auth/hash_response_base.js',
                    '<%= config.app %>/scripts/smb_client/auth/lm_hash.js',
                    '<%= config.app %>/scripts/smb_client/auth/lm_response.js',
                    '<%= config.app %>/scripts/smb_client/auth/ntlm_hash.js',
                    '<%= config.app %>/scripts/smb_client/auth/ntlm_v2_hash.js',
                    '<%= config.app %>/scripts/smb_client/auth/ntlm_v2_response.js',
                    '<%= config.app %>/scripts/smb_client/auth/lm_v2_response.js',
                    '<%= config.app %>/scripts/smb_client/auth/ntlm_v2_session_response.js',
                    '<%= config.app %>/scripts/smb_client/auth/type_1_message.js',
                    '<%= config.app %>/scripts/smb_client/auth/type_2_message.js',
                    '<%= config.app %>/scripts/smb_client/auth/type_3_message.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/header.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/header.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/packet_helper.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/packet_helper.js',
                    '<%= config.app %>/scripts/smb_client/models/packet.js',
                    '<%= config.app %>/scripts/smb_client/models/file.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/request_utils.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/response_utils.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/response_utils.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/negotiate_protocol_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/negotiate_protocol_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/negotiate_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/session_setup_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/session_setup_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/session_setup_andx_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/session_setup_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/echo_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/tree_connect_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/tree_connect_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/tree_connect_andx_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/tree_connect_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/nt_create_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/create_context.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/create_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/nt_create_andx_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/create_response.js',
                    '<%= config.app %>/scripts/smb_client/dce_rpc/dce_rpc.js',
                    '<%= config.app %>/scripts/smb_client/dce_rpc/dcerpc_bind.js',
                    '<%= config.app %>/scripts/smb_client/dce_rpc/dcerpc_bind_ack.js',
                    '<%= config.app %>/scripts/smb_client/dce_rpc/dcerpc_net_share_enum_all_request.js',
                    '<%= config.app %>/scripts/smb_client/dce_rpc/dcerpc_net_share_enum_all_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/transaction_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/ioctl_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/transaction_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/ioctl_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/close_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/close_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/query_path_info_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/query_info_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/query_path_info_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/query_info_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/find_first2_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/find_first2_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/find_next2_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/find_next2_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/query_directory_info_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/query_directory_info_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/find_close2_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/seek_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/seek_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/read_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/read_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/read_andx_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/read_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/write_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/write_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/write_andx_response.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/write_response.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/create_directory_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/delete_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/delete_directory_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/rename_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/empty_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/empty_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/models/logoff_andx_request.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/file_disposition_information.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/file_rename_information.js',
                    '<%= config.app %>/scripts/smb_client/smb2/models/set_info_request.js',
                    '<%= config.app %>/scripts/smb_client/smb1/protocol.js',
                    '<%= config.app %>/scripts/smb_client/smb2/protocol.js',
                    '<%= config.app %>/scripts/smb_client/communication.js',
                    '<%= config.app %>/scripts/smb_client/chrome_socket_2.js',
                    '<%= config.app %>/scripts/smb_client/smb1/client_impl.js',
                    '<%= config.app %>/scripts/smb_client/smb2/client_impl.js',
                    '<%= config.app %>/scripts/smb_client/client.js',
                    '<%= config.app %>/scripts/task_queue.js',
                    '<%= config.app %>/scripts/metadata_cache.js',
                    '<%= config.app %>/scripts/cifs_fs.js',
                    '<%= config.app %>/scripts/cifs_client.js',
                    '<%= config.app %>/scripts/background.js'
                ],
                dest: '<%= config.dist %>/background.js'
            }
        },
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: false,
                    background: {
                        target: 'background.js'
                    }
                },
                src: '<%= config.app %>',
                dest: '<%= config.dist %>'
            }
        },
        compress: {
            dist: {
                options: {
                    archive: function() {
                        var manifest = grunt.file.readJSON('app/manifest.json');
                        return 'package/chromeos-filesystem-cifs-' + manifest.version + '.zip';
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: '<%= config.dist %>/bower_components',
                    verbose: true,
                    install: true
//                    cleanup: true
                }
            }
        },
        vulcanize: {
            main: {
                options: {
                    csp: true,
                    inline: true
                },
                files: {
                    '<%= config.dist %>/window.html': '<%= config.app %>/window.html'
                }
            }
        }
    });

    grunt.registerTask('debug', function (platform) {
        var watch = grunt.config('watch');
        platform = platform || 'chrome';
        if (platform === 'server') {
            watch.styles.tasks = ['newer:copy:styles'];
            watch.styles.options.livereload = false;
        }
        grunt.config('watch', watch);
        grunt.task.run([
            'clean:' + platform,
            'connect:' + platform,
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'connect:test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'bower:install',
        'concat',
        'chromeManifest:dist',
        'copy',
        'vulcanize',
        'compress'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);

};
