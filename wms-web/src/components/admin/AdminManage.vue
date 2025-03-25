<template>
    <div class="admin-manage">
        <div class="search-bar">
            <el-input
                v-model="searchQuery"
                placeholder="请输入管理员名称"
                style="width: 200px"
                @keyup.enter.native="handleSearch">
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增管理员</el-button>
        </div>

        <el-table :data="adminList" border style="width: 100%">
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

        <!-- 管理员表单对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
            <el-form :model="adminForm" :rules="rules" ref="adminForm" label-width="100px">
                <el-form-item label="账号" prop="username">
                    <el-input v-model="adminForm.username"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="adminForm.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="adminForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!adminForm.id">
                    <el-input v-model="adminForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="isvalid">
                    <el-switch v-model="adminForm.isvalid" active-value="Y" inactive-value="N"></el-switch>
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
        name: "AdminManage",
        data() {
            return {
                searchQuery: '',
                adminList: [],
                dialogVisible: false,
                dialogTitle: '',
                adminForm: {
                    username: '',         // 账号
                    name: '',       // 姓名
                    phone: '',      // 手机号
                    password: '',   // 密码
                    isvalid: 'Y',   // 状态
                    roleId: 1       // 管理员角色ID
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
            this.getAdminList();
        },
        methods: {
            // 获取管理员列表
            getAdminList() {
                this.$axios.get(this.$httpUrl + '/user/list').then(res => {
                    if(res.data) {
                        // 只显示管理员角色的用户
                        this.adminList = res.data.filter(user => user.roleId === 1);
                    }
                }).catch(error => {
                    console.error('获取管理员列表失败:', error);
                    this.$message.error('获取列表失败，请检查网络连接');
                });
            },
            // 搜索
            handleSearch() {
                this.getAdminList();
            },
            // 新增管理员
            handleAdd() {
                this.dialogTitle = '新增管理员';
                this.adminForm = {
                    username: '',
                    name: '',
                    phone: '',
                    password: '',
                    isvalid: 'Y',
                    roleId: 1
                };
                this.dialogVisible = true;
            },
            // 编辑管理员
            handleEdit(row) {
                this.dialogTitle = '编辑管理员';
                this.adminForm = { ...row };
                this.adminForm.password = ''; // 编辑时不显示密码
                this.dialogVisible = true;
            },
            // 删除管理员
            handleDelete(row) {
                this.$confirm('确认删除该管理员吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$axios.get(this.$httpUrl + '/user/del', {
                        params: { id: row.id }
                    }).then(res => {
                        if (res.data.code === 200) {
                            this.$message.success('删除成功');
                            this.getAdminList();
                        } else {
                            this.$message.error(res.data.msg || '删除失败');
                        }
                    }).catch(error => {
                        console.error('删除请求错误:', error);
                        this.$message.error('删除失败，请检查网络连接');
                    });
                }).catch(() => {
                    this.$message.info('已取消删除');
                });
            },
            // 提交表单
            submitForm() {
                this.$refs.adminForm.validate((valid) => {
                    if (valid) {
                        const url = this.adminForm.id ? 
                            this.$httpUrl + '/user/update' : 
                            this.$httpUrl + '/user/save';
                        const method = 'post';
                        
                        // 添加加载状态
                        const loading = this.$loading({
                            lock: true,
                            text: '提交中...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                        
                        console.log('提交的数据:', this.adminForm);
                        
                        this.$axios[method](url, this.adminForm)
                            .then(res => {
                                loading.close();
                                
                                if (res.data.code === 200) {
                                    this.$message.success(this.adminForm.id ? '更新成功' : '添加成功');
                                    this.dialogVisible = false;
                                    this.getAdminList();
                                } else {
                                    this.$message.error(res.data.msg || '操作失败，请重试');
                                }
                            })
                            .catch(error => {
                                console.error('请求错误:', error);
                                loading.close();
                                this.$message.error('请求失败，请检查网络连接');
                            });
                    } else {
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .admin-manage {
        padding: 20px;
    }
    .search-bar {
        margin-bottom: 20px;
    }
    .search-bar .el-button {
        margin-left: 10px;
    }
</style>