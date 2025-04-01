<template>
    <div class="register-container">
        <el-card class="register-card">
            <div class="title">用户注册</div>
            
            <!-- 注册方式选择 -->
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="密码注册" name="password"></el-tab-pane>
                <el-tab-pane label="验证码注册" name="sms"></el-tab-pane>
            </el-tabs>
            
            <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="88px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                
                <!-- 密码注册方式显示 -->
                <template v-if="activeTab === 'password'">
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
                    </el-form-item>
                </template>
                
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="registerForm.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="registerForm.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                
                <!-- 手机验证码注册方式显示 -->
                <el-form-item label="手机验证码" prop="smsCode" v-if="activeTab === 'sms'">
                    <div class="captcha-container">
                        <el-input v-model="registerForm.smsCode" placeholder="请输入手机验证码"></el-input>
                        <el-button 
                            :disabled="smsCodeBtn.disabled" 
                            @click="getSmsCode" 
                            class="get-code-btn"
                            :loading="smsCodeBtn.loading"
                        >
                            {{smsCodeBtn.text}}
                        </el-button>
                    </div>
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="captcha">
                    <div class="captcha-container">
                        <el-input v-model="registerForm.captcha" placeholder="请输入验证码"></el-input>
                        <img :src="captchaUrl" @click="refreshCaptcha" class="captcha-img" alt="验证码">
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm" :loading="loading">注册</el-button>
                    <el-button @click="goToLogin">返回登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Register",
        data() {
            // 密码验证规则
            const validatePass = (rule, value, callback) => {
                if (this.activeTab === 'password' && value === '') {
                    callback(new Error('请输入密码'));
                } else {
                    if (this.registerForm.confirmPassword !== '') {
                        this.$refs.registerForm.validateField('confirmPassword');
                    }
                    callback();
                }
            };
            // 确认密码验证规则
            const validatePass2 = (rule, value, callback) => {
                if (this.activeTab === 'password' && value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (this.activeTab === 'password' && value !== this.registerForm.password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            // 用户名唯一性验证
            const validateUsername = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入用户名'));
                } else {
                    // 检查用户名是否已存在
                    this.$axios.get(this.$httpUrl + '/user/checkUsername', {
                        params: { username: value }
                    }).then(res => {
                        if (res.data.code === 200) {
                            if (res.data.data) {
                                callback(new Error('该用户名已被使用'));
                            } else {
                                callback();
                            }
                        }
                    });
                }
            };
            // 手机验证码验证规则
            const validateSmsCode = (rule, value, callback) => {
                if (this.activeTab === 'sms' && value === '') {
                    callback(new Error('请输入手机验证码'));
                } else {
                    callback();
                }
            };

            return {
                activeTab: 'password', // 默认为密码注册
                registerForm: {
                    username: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    phone: '',
                    email: '',
                    captcha: '',
                    smsCode: ''
                },
                smsCodeBtn: {
                    disabled: false,
                    loading: false,
                    text: '获取验证码',
                    time: 60
                },
                timer: null,
                rules: {
                    username: [
                        { required: true, validator: validateUsername, trigger: 'blur' },
                        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                    ],
                    password: [
                        { validator: validatePass, trigger: 'blur' },
                        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                    ],
                    confirmPassword: [
                        { validator: validatePass2, trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
                    ],
                    smsCode: [
                        { validator: validateSmsCode, trigger: 'blur' },
                        { min: 6, max: 6, message: '验证码长度必须为6位', trigger: 'blur' }
                    ],
                    email: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
                    ],
                    captcha: [
                        { required: true, message: '请输入验证码', trigger: 'blur' },
                        { min: 4, max: 4, message: '验证码长度必须为4位', trigger: 'blur' }
                    ]
                },
                captchaUrl: this.$httpUrl + '/captcha',
                loading: false
            }
        },
        methods: {
            // 切换注册方式
            handleTabClick() {
                // 切换时重置表单验证
                this.$nextTick(() => {
                    this.$refs.registerForm.clearValidate();
                });
            },
            // 获取短信验证码
            getSmsCode() {
                // 验证手机号
                if (!this.registerForm.phone) {
                    this.$message.warning('请先输入手机号');
                    return;
                }
                
                // 验证手机号格式
                const phoneRegex = /^1[3-9]\d{9}$/;
                if (!phoneRegex.test(this.registerForm.phone)) {
                    this.$message.warning('请输入正确的手机号格式');
                    return;
                }
                
                // 禁用按钮并开始倒计时
                this.smsCodeBtn.loading = true;
                this.smsCodeBtn.disabled = true;
                
                // 发送获取短信验证码的请求
                this.$axios.get(this.$httpUrl + '/user/sendSmsCode', {
                    params: { phone: this.registerForm.phone }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('验证码已发送，请注意查收');
                        // 启动倒计时
                        this.startCountDown();
                    } else {
                        this.$message.error(res.data.msg || '发送验证码失败，请稍后重试');
                        this.smsCodeBtn.disabled = false;
                        this.smsCodeBtn.loading = false;
                    }
                }).catch(error => {
                    console.error('发送验证码请求错误：', error);
                    this.$message.error('发送验证码失败，请检查网络连接');
                    this.smsCodeBtn.disabled = false;
                    this.smsCodeBtn.loading = false;
                });
            },
            
            // 开始倒计时
            startCountDown() {
                this.smsCodeBtn.loading = false;
                this.smsCodeBtn.time = 60;
                this.smsCodeBtn.text = `${this.smsCodeBtn.time}秒后重新获取`;
                
                this.timer = setInterval(() => {
                    if (this.smsCodeBtn.time > 0) {
                        this.smsCodeBtn.time--;
                        this.smsCodeBtn.text = `${this.smsCodeBtn.time}秒后重新获取`;
                    } else {
                        clearInterval(this.timer);
                        this.smsCodeBtn.text = '获取验证码';
                        this.smsCodeBtn.disabled = false;
                    }
                }, 1000);
            },
            
            // 刷新验证码
            refreshCaptcha() {
                this.captchaUrl = this.$httpUrl + '/captcha?' + new Date().getTime();
            },
            
            // 提交表单
            submitForm() {
                this.$refs.registerForm.validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        // 构造注册请求数据
                        const registerData = {
                            username: this.registerForm.username,
                            name: this.registerForm.name,
                            phone: this.registerForm.phone,
                            email: this.registerForm.email,
                            captcha: this.registerForm.captcha,
                            registerType: this.activeTab // 添加注册方式标识
                        };
                        
                        // 根据注册方式添加相应参数
                        if (this.activeTab === 'password') {
                            registerData.password = this.registerForm.password;
                        } else {
                            registerData.smsCode = this.registerForm.smsCode;
                        }

                        this.$axios.post(this.$httpUrl + '/user/register', registerData)
                            .then(res => {
                                if (res.data.code === 200) {
                                    this.$message({
                                        type: 'success',
                                        message: '注册成功！'
                                    });
                                    // 注册成功后延迟跳转到登录页
                                    setTimeout(() => {
                                        this.$router.push('/login');
                                    }, 1500);
                                } else {
                                    this.$message.error(res.data.msg || '注册失败，请重试');
                                    this.refreshCaptcha();
                                }
                            })
                            .catch(error => {
                                console.error('注册请求错误：', error);
                                this.$message.error('注册失败，请检查网络连接');
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            
            // 返回登录页
            goToLogin() {
                this.$router.push('/login');
            }
        },
        created() {
            this.refreshCaptcha();
        },
        beforeDestroy() {
            // 组件销毁前清除定时器
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    }
</script>

<style scoped>
    .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f3f3f3;
    }
    .register-card {
        width: 500px;
        padding: 20px;
    }
    .title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #409EFF;
    }
    .captcha-container {
        display: flex;
        align-items: center;
    }
    .captcha-img {
        margin-left: 10px;
        height: 40px;
        cursor: pointer;
    }
    .get-code-btn {
        margin-left: 10px;
        width: 120px;
        font-size: 12px;
    }
    .el-form-item {
        margin-bottom: 20px;
    }
    .el-button {
        width: 120px;
        margin-right: 20px;
    }
    /* Tab样式优化 */
    .el-tabs {
        margin-bottom: 20px;
    }
    .el-tabs__nav {
        width: 100%;
    }
    .el-tabs__item {
        width: 50%;
        text-align: center;
    }
</style> 