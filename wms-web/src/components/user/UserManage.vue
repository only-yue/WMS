<template>
    <div class="user-manage">
        <div class="search-bar">
            <el-input
                v-model="searchQuery"
                placeholder="请输入用户名称"
                style="width: 200px"
                @keyup.enter.native="handleSearch">
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增用户</el-button>
        </div>

        <el-table :data="userList" border style="width: 100%">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="username" label="账号" width="180"></el-table-column>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="phone" label="手机号"></el-table-column>
            <el-table-column prop="isvalid" label="状态">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.isvalid === 'Y' ? 'success' : 'danger'">
                        {{ scope.row.isvalid === 'Y' ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 用户表单对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
            <el-form :model="userForm" :rules="rules" ref="userForm" label-width="100px">
                <el-form-item label="账号" prop="username">
                    <el-input v-model="userForm.username"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="userForm.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="userForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!userForm.id">
                    <el-input v-model="userForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-switch v-model="userForm.isvalid" active-value="Y" inactive-value="N"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "UserManage",
        data() {
            return {
                searchQuery: '',
                userList: [],
                dialogVisible: false,
                dialogTitle: '',
                userForm: {
                    username: '',
                    name: '',
                    phone: '',
                    password: '',
                    isvalid: 'Y'
                },
                rules: {
                    username: [
                        { required: true, message: '请输入账号', trigger: 'blur' },
                        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    phone: [
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            // 获取用户列表
            getUserList() {
                this.$axios.get(this.$httpUrl + '/user/list', {
                    params: {
                        query: this.searchQuery
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.userList = res.data.data;
                    }
                });
            },
            // 搜索
            handleSearch() {
                this.getUserList();
            },
            // 新增用户
            handleAdd() {
                this.dialogTitle = '新增用户';
                this.userForm = {
                    no: '',
                    name: '',
                    phone: '',
                    password: '',
                    isvalid: 'Y'
                };
                this.dialogVisible = true;
            },
            // 编辑用户
            handleEdit(row) {
                this.dialogTitle = '编辑用户';
                this.userForm = { ...row };
                this.userForm.password = ''; // 编辑时不显示密码
                this.dialogVisible = true;
            },
            // 删除用户
            handleDelete(row) {
                this.$confirm('确认删除该用户吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$axios.delete(this.$httpUrl + '/user/delete/' + row.id).then(res => {
                        if (res.data.code === 200) {
                            this.$message.success('删除成功');
                            this.getUserList();
                        }
                    });
                });
            },
            // 提交表单
            submitForm() {
                this.$refs.userForm.validate((valid) => {
                    if (valid) {
                        const url = this.userForm.id ? 
                            this.$httpUrl + '/user/update' : 
                            this.$httpUrl + '/user/save';
                        const method = this.userForm.id ? 'put' : 'post';
                        
                        this.$axios[method](url, this.userForm).then(res => {
                            if (res.data.code === 200) {
                                this.$message.success(this.userForm.id ? '更新成功' : '添加成功');
                                this.dialogVisible = false;
                                this.getUserList();
                            } else {
                                this.$message.error(res.data.msg || '操作失败');
                            }
                        }).catch(err => {
                            this.$message.error('请求失败：' + err.message);
                        });
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .user-manage {
        padding: 20px;
    }
    .search-bar {
        margin-bottom: 20px;
    }
    .search-bar .el-button {
        margin-left: 10px;
    }
</style>