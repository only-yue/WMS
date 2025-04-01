<template>
    <div class="role-manage">
        <div class="search-bar">
            <el-input
                v-model="searchQuery"
                placeholder="请输入角色名称"
                style="width: 200px"
                @keyup.enter.native="handleSearch">
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button type="success" @click="handleAdd">新增角色</el-button>
        </div>

        <el-table :data="roleList" border style="width: 100%">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="角色名称"></el-table-column>
            <el-table-column prop="code" label="角色编码"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                        {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button size="mini" type="primary" @click="handlePermission(scope.row)">权限设置</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 角色表单对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
            <el-form :model="roleForm" :rules="rules" ref="roleForm" label-width="100px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="roleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="角色编码" prop="code">
                    <el-input v-model="roleForm.code"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" v-model="roleForm.description"></el-input>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-switch v-model="roleForm.status" :active-value="1" :inactive-value="0"></el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 权限设置对话框 -->
        <el-dialog title="权限设置" :visible.sync="permissionDialogVisible" width="600px">
            <el-tree
                ref="permissionTree"
                :data="permissionTree"
                show-checkbox
                node-key="id"
                :props="{
                    label: 'name',
                    children: 'children'
                }"
                :default-checked-keys="checkedPermissions">
            </el-tree>
            <div slot="footer" class="dialog-footer">
                <el-button @click="permissionDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitPermission">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "RoleManage",
        data() {
            return {
                searchQuery: '',
                roleList: [],
                dialogVisible: false,
                dialogTitle: '',
                roleForm: {
                    name: '',
                    code: '',
                    description: '',
                    status: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' },
                        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
                    ],
                    code: [
                        { required: true, message: '请输入角色编码', trigger: 'blur' },
                        { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线', trigger: 'blur' }
                    ]
                },
                // 权限树相关
                permissionDialogVisible: false,
                permissionTree: [],
                checkedPermissions: [],
                currentRoleId: null
            }
        },
        created() {
            this.getRoleList();
            this.getPermissionTree();
        },
        methods: {
            // 获取角色列表
            getRoleList() {
                this.$axios.get(this.$httpUrl + '/role/list', {
                    params: {
                        query: this.searchQuery
                    }
                }).then(res => {
                    if (res.data.code === 200) {
                        this.roleList = res.data.data;
                    }
                });
            },
            // 获取权限树
            getPermissionTree() {
                this.$axios.get(this.$httpUrl + '/permission/tree').then(res => {
                    if (res.data.code === 200) {
                        this.permissionTree = res.data.data;
                    }
                });
            },
            // 搜索
            handleSearch() {
                this.getRoleList();
            },
            // 新增角色
            handleAdd() {
                this.dialogTitle = '新增角色';
                this.roleForm = {
                    name: '',
                    code: '',
                    description: '',
                    status: 1
                };
                this.dialogVisible = true;
            },
            // 编辑角色
            handleEdit(row) {
                this.dialogTitle = '编辑角色';
                this.roleForm = { ...row };
                this.dialogVisible = true;
            },
            // 删除角色
            handleDelete(row) {
                this.$confirm('确认删除该角色吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$axios.delete(this.$httpUrl + '/role/delete/' + row.id).then(res => {
                        if (res.data.code === 200) {
                            this.$message.success('删除成功');
                            this.getRoleList();
                        }
                    });
                });
            },
            // 打开权限设置对话框
            handlePermission(row) {
                this.currentRoleId = row.id;
                this.$axios.get(this.$httpUrl + '/role/permissions/' + row.id).then(res => {
                    if (res.data.code === 200) {
                        this.checkedPermissions = res.data.data.map(item => item.id);
                        this.permissionDialogVisible = true;
                    }
                });
            },
            // 提交权限设置
            submitPermission() {
                const checkedKeys = this.$refs.permissionTree.getCheckedKeys();
                const halfCheckedKeys = this.$refs.permissionTree.getHalfCheckedKeys();
                const permissionIds = [...checkedKeys, ...halfCheckedKeys];
                
                this.$axios.put(this.$httpUrl + '/role/permissions/' + this.currentRoleId, {
                    permissionIds: permissionIds
                }).then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('权限设置成功');
                        this.permissionDialogVisible = false;
                    }
                });
            },
            // 提交角色表单
            submitForm() {
                this.$refs.roleForm.validate((valid) => {
                    if (valid) {
                        const url = this.roleForm.id ? 
                            this.$httpUrl + '/role/update' : 
                            this.$httpUrl + '/role/add';
                        const method = this.roleForm.id ? 'put' : 'post';
                        
                        this.$axios[method](url, this.roleForm).then(res => {
                            if (res.data.code === 200) {
                                this.$message.success(this.roleForm.id ? '更新成功' : '添加成功');
                                this.dialogVisible = false;
                                this.getRoleList();
                            }
                        });
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .role-manage {
        padding: 20px;
    }
    .search-bar {
        margin-bottom: 20px;
    }
    .search-bar .el-button {
        margin-left: 10px;
    }
</style> 