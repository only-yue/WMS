<template>
    <div class="loginBody">
        <div class="loginDiv">
            <div class="login-content">
                <h1 class="login-title">用户登录</h1>
                <el-form :model="loginForm" label-width="100px"
                         :rules="rules" ref="loginForm">
                    <el-form-item label="账号" prop="username">
                        <el-input style="width: 200px" type="text" v-model="loginForm.username"
                                  autocomplete="off" size="small"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input style="width: 200px" type="password" v-model="loginForm.password"
                                  show-password autocomplete="off" size="small" @keyup.enter.native="confirm"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="confirm" :disabled="confirm_disabled">确 定</el-button>
                    </el-form-item>
                </el-form>
                <div class="register-section">
                    <div class="divider">
                        <span>还没有账号?</span>
                    </div>
                    <el-button type="primary" plain @click="goToRegister" class="register-btn">注册新账号</el-button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
    export default {
        name: "Login",
        data(){
            return{
                confirm_disabled:false,
                loginForm:{
                    username:'',
                    password:''
                },
                rules:{
                    username: [
                        { required: true, message: '请输入账号', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输密码', trigger: 'blur' }
                    ],
                }
            }
        },
        methods:{
            confirm(){
                console.log('登录信息：', this.loginForm);  // 打印登录信息
                this.confirm_disabled=true;
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        this.$axios.post(this.$httpUrl+'/user/login',this.loginForm).then(res=>res.data).then(res=>{
                            console.log('完整响应：', res);  // 打印完整响应
                            console.log('响应数据：', res);  // 打印响应数据
                            if(res.code==200){
                                sessionStorage.setItem("CurUser",JSON.stringify(res.data.user))
                                
                                // 确保菜单数据中包含角色管理
                                let menuData = res.data.menu || [];
                                const hasRoleMenu = menuData.some(item => 
                                    item.menuclick === 'Role' || 
                                    item.menuname === '角色管理');
                                
                                // 如果没有角色管理菜单项，添加一个
                                if (!hasRoleMenu) {
                                    menuData.push({
                                        menuclick: 'Role',
                                        menuname: '角色管理',
                                        menuicon: 'el-icon-s-check',
                                        menucomponent: 'role/RoleManage'
                                    });
                                }
                                
                                this.$store.commit("setMenu", menuData);
                                this.$router.replace('/Index');
                            }else{
                                this.confirm_disabled=false;
                                this.$message.error(res.msg || '用户名或密码错误！');
                                return false;
                            }
                        }).catch(error => {
                            this.confirm_disabled=false;
                            this.$message.error('服务器连接失败，请检查网络设置！');
                            console.error('Error:', error);
                        });
                    } else {
                        this.confirm_disabled=false;
                        console.log('校验失败');
                        return false;
                    }
                });
            },
            goToRegister() {
                this.$router.push('/register');
            }
        }
    }
</script>

<style scoped>
    .loginBody {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #B3C0D1;
    }
    .loginDiv {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -200px;
        margin-left: -250px;
        width: 450px;
        height: 380px;
        background: #fff;
        border-radius: 5%;
    }
    .login-title {
        margin: 20px 0;
        text-align: center;
    }
    .login-content {
        width: 400px;
        height: 320px;
        position: absolute;
        top: 25px;
        left: 25px;
    }
    .register-section {
        margin-top: 20px;
        text-align: center;
    }
    .divider {
        margin: 15px 0;
        position: relative;
        text-align: center;
    }
    .divider:before, .divider:after {
        content: '';
        position: absolute;
        top: 50%;
        width: 35%;
        height: 1px;
        background-color: #dcdfe6;
    }
    .divider:before {
        left: 0;
    }
    .divider:after {
        right: 0;
    }
    .divider span {
        padding: 0 10px;
        color: #909399;
        background-color: #fff;
        position: relative;
        z-index: 1;
    }
    .register-btn {
        width: 200px;
    }
</style>