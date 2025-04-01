<template>
    <div class="repair-request">
        <h2 class="page-title">保修申请</h2>
        
        <!-- 搜索栏 -->
        <el-row class="search-bar" type="flex" justify="space-between">
            <el-col :span="18">
                <el-button type="primary" @click="showRepairForm">提交新保修申请</el-button>
            </el-col>
            <el-col :span="6" style="text-align: right;">
                <el-input
                    v-model="searchQuery"
                    placeholder="搜索保修申请"
                    style="width: 200px; margin-right: 10px;"
                    @keyup.enter.native="handleSearch">
                </el-input>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-col>
        </el-row>
        
        <!-- 保修申请列表 -->
        <el-table :data="repairList" border style="width: 100%; margin-top: 20px;">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="location" label="位置"></el-table-column>
            <el-table-column prop="description" label="故障描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="contactPerson" label="联系人"></el-table-column>
            <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
            <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="提交时间"></el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
                    <el-button 
                        size="mini" 
                        type="danger" 
                        @click="cancelRepair(scope.row)"
                        v-if="scope.row.status === 0 || scope.row.status === 1">
                        取消申请
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItems"
            style="margin-top: 20px; text-align: right;">
        </el-pagination>
        
        <!-- 保修申请表单对话框 -->
        <el-dialog title="提交保修申请" :visible.sync="dialogVisible" width="600px">
            <el-form :model="repairForm" :rules="rules" ref="repairForm" label-width="100px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="repairForm.title" placeholder="请简要描述故障"></el-input>
                </el-form-item>
                <el-form-item label="位置" prop="location">
                    <el-input v-model="repairForm.location" placeholder="请输入故障发生位置"></el-input>
                </el-form-item>
                <el-form-item label="故障描述" prop="description">
                    <el-input type="textarea" v-model="repairForm.description" rows="4" placeholder="请详细描述故障情况"></el-input>
                </el-form-item>
                <el-form-item label="联系人" prop="contactPerson">
                    <el-input v-model="repairForm.contactPerson" placeholder="请输入联系人姓名"></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="repairForm.contactPhone" placeholder="请输入联系电话"></el-input>
                </el-form-item>
                <el-form-item label="故障图片">
                    <el-upload
                        action="/api/upload"
                        list-type="picture-card"
                        :on-preview="handlePictureCardPreview"
                        :on-remove="handleRemove"
                        :before-upload="beforeUpload"
                        :on-success="handleUploadSuccess"
                        multiple>
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitRepairForm">提 交</el-button>
            </div>
        </el-dialog>
        
        <!-- 图片预览 -->
        <el-dialog :visible.sync="imageVisible" append-to-body>
            <img width="100%" :src="imageUrl" alt="预览图片">
        </el-dialog>
        
        <!-- 详情对话框 -->
        <el-dialog title="保修详情" :visible.sync="detailVisible" width="700px">
            <div v-if="currentRepair" class="repair-detail">
                <div class="detail-item">
                    <span class="detail-label">标题：</span>
                    <span>{{ currentRepair.title }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">位置：</span>
                    <span>{{ currentRepair.location }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">故障描述：</span>
                    <span>{{ currentRepair.description }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">联系人：</span>
                    <span>{{ currentRepair.contactPerson }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">联系电话：</span>
                    <span>{{ currentRepair.contactPhone }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">状态：</span>
                    <el-tag :type="getStatusType(currentRepair.status)">
                        {{ getStatusText(currentRepair.status) }}
                    </el-tag>
                </div>
                <div class="detail-item">
                    <span class="detail-label">提交时间：</span>
                    <span>{{ currentRepair.createTime }}</span>
                </div>
                
                <!-- 故障图片 -->
                <div class="detail-item" v-if="currentRepair.images && currentRepair.images.length > 0">
                    <div class="detail-label">故障图片：</div>
                    <div class="image-list">
                        <div class="image-item" v-for="(img, index) in currentRepair.images" :key="index">
                            <img :src="img" @click="previewImage(img)" width="100" height="100">
                        </div>
                    </div>
                </div>
                
                <!-- 审核信息 -->
                <div class="detail-item" v-if="currentRepair.auditInfo">
                    <div class="detail-label">审核信息：</div>
                    <div class="audit-info">
                        <p>审核人：{{ currentRepair.auditInfo.auditor }}</p>
                        <p>审核时间：{{ currentRepair.auditInfo.auditTime }}</p>
                        <p>审核结果：
                            <el-tag :type="currentRepair.auditInfo.result === 'pass' ? 'success' : 'danger'">
                                {{ currentRepair.auditInfo.result === 'pass' ? '通过' : '拒绝' }}
                            </el-tag>
                        </p>
                        <p>审核意见：{{ currentRepair.auditInfo.comment }}</p>
                    </div>
                </div>
                
                <!-- 维修信息 -->
                <div class="detail-item" v-if="currentRepair.repairInfo">
                    <div class="detail-label">维修信息：</div>
                    <div class="repair-info">
                        <p>维修人员：{{ currentRepair.repairInfo.repairman }}</p>
                        <p>联系电话：{{ currentRepair.repairInfo.phone }}</p>
                        <p>开始时间：{{ currentRepair.repairInfo.startTime }}</p>
                        <p>完成时间：{{ currentRepair.repairInfo.endTime }}</p>
                        <p>维修记录：{{ currentRepair.repairInfo.log }}</p>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "RepairRequest",
    data() {
        return {
            searchQuery: '',
            repairList: [],
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            dialogVisible: false,
            detailVisible: false,
            imageVisible: false,
            imageUrl: '',
            currentRepair: null,
            repairForm: {
                title: '',
                location: '',
                description: '',
                contactPerson: '',
                contactPhone: '',
                images: []
            },
            rules: {
                title: [
                    { required: true, message: '请输入标题', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                location: [
                    { required: true, message: '请输入故障位置', trigger: 'blur' }
                ],
                description: [
                    { required: true, message: '请输入故障描述', trigger: 'blur' }
                ],
                contactPerson: [
                    { required: true, message: '请输入联系人', trigger: 'blur' }
                ],
                contactPhone: [
                    { required: true, message: '请输入联系电话', trigger: 'blur' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
                ]
            }
        };
    },
    created() {
        this.getRepairList();
    },
    methods: {
        // 获取保修申请列表
        getRepairList() {
            // 模拟数据，实际项目中应从API获取
            this.repairList = [
                {
                    id: 1,
                    title: '办公室空调故障',
                    location: '行政楼203室',
                    description: '空调不制冷，可能是缺氟利昂',
                    contactPerson: '张三',
                    contactPhone: '13800138000',
                    status: 0, // 0-待审核，1-已通过，2-已拒绝，3-处理中，4-已完成
                    createTime: '2023-04-01 10:30:45',
                    images: ['/uploads/ac1.jpg', '/uploads/ac2.jpg']
                },
                {
                    id: 2,
                    title: '宿舍楼水管漏水',
                    location: '5号宿舍楼3层走廊',
                    description: '水管破裂，水流较大',
                    contactPerson: '李四',
                    contactPhone: '13900139000',
                    status: 1,
                    createTime: '2023-04-01 09:20:33',
                    images: ['/uploads/water1.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-04-01 10:30:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    }
                },
                {
                    id: 3,
                    title: '教室投影仪无法使用',
                    location: '教学楼A302',
                    description: '投影仪打不开，可能是灯泡坏了',
                    contactPerson: '王五',
                    contactPhone: '13700137000',
                    status: 3,
                    createTime: '2023-03-30 14:15:22',
                    images: ['/uploads/projector.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-03-30 15:20:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    },
                    repairInfo: {
                        repairman: '技术员小李',
                        phone: '13600136000',
                        startTime: '2023-03-31 09:00:00'
                    }
                },
                {
                    id: 4,
                    title: '实验室电脑蓝屏',
                    location: '科技楼502实验室',
                    description: '电脑开机后一直蓝屏，无法正常使用',
                    contactPerson: '赵六',
                    contactPhone: '13500135000',
                    status: 4,
                    createTime: '2023-03-28 09:45:12',
                    images: ['/uploads/bluescreen.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-03-28 10:20:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    },
                    repairInfo: {
                        repairman: '技术员小张',
                        phone: '13400134000',
                        startTime: '2023-03-28 13:00:00',
                        endTime: '2023-03-28 15:30:00',
                        log: '已重装系统，恢复正常使用'
                    }
                }
            ];
            
            this.totalItems = this.repairList.length;
        },
        
        // 搜索
        handleSearch() {
            this.currentPage = 1;
            this.getRepairList();
        },
        
        // 分页大小改变
        handleSizeChange(val) {
            this.pageSize = val;
            this.getRepairList();
        },
        
        // 页码改变
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getRepairList();
        },
        
        // 显示申请表单
        showRepairForm() {
            this.repairForm = {
                title: '',
                location: '',
                description: '',
                contactPerson: '',
                contactPhone: '',
                images: []
            };
            this.dialogVisible = true;
        },
        
        // 提交保修申请
        submitRepairForm() {
            this.$refs.repairForm.validate((valid) => {
                if (valid) {
                    // 模拟提交到服务器
                    this.$message.success('保修申请提交成功，等待审核');
                    this.dialogVisible = false;
                    
                    // 模拟添加到列表
                    const newRepair = {
                        id: this.repairList.length + 1,
                        ...this.repairForm,
                        status: 0,
                        createTime: new Date().toLocaleString(),
                    };
                    this.repairList.unshift(newRepair);
                    this.totalItems += 1;
                }
            });
        },
        
        // 查看详情
        viewDetail(row) {
            this.currentRepair = row;
            this.detailVisible = true;
        },
        
        // 取消申请
        cancelRepair(row) {
            this.$confirm('确定要取消此保修申请吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 模拟取消操作
                const index = this.repairList.findIndex(item => item.id === row.id);
                if (index !== -1) {
                    this.repairList.splice(index, 1);
                    this.totalItems -= 1;
                }
                this.$message.success('已取消保修申请');
            }).catch(() => {});
        },
        
        // 上传相关方法
        handleRemove(file) {
            const index = this.repairForm.images.indexOf(file.url);
            if (index !== -1) {
                this.repairForm.images.splice(index, 1);
            }
        },
        
        handlePictureCardPreview(file) {
            this.imageUrl = file.url;
            this.imageVisible = true;
        },
        
        beforeUpload(file) {
            const isImage = file.type.startsWith('image/');
            const isLt2M = file.size / 1024 / 1024 < 2;
            
            if (!isImage) {
                this.$message.error('只能上传图片文件!');
                return false;
            }
            if (!isLt2M) {
                this.$message.error('图片大小不能超过 2MB!');
                return false;
            }
            return true;
        },
        
        handleUploadSuccess(response) {
            // 假设上传接口返回图片URL
            if (response && response.url) {
                this.repairForm.images.push(response.url);
            }
        },
        
        // 预览图片
        previewImage(url) {
            this.imageUrl = url;
            this.imageVisible = true;
        },
        
        // 获取状态对应的Tag类型
        getStatusType(status) {
            const statusMap = {
                0: 'info',      // 待审核
                1: 'success',   // 已通过
                2: 'danger',    // 已拒绝
                3: 'warning',   // 处理中
                4: 'success'    // 已完成
            };
            return statusMap[status] || 'info';
        },
        
        // 获取状态对应的文本
        getStatusText(status) {
            const statusMap = {
                0: '待审核',
                1: '已通过',
                2: '已拒绝',
                3: '处理中',
                4: '已完成'
            };
            return statusMap[status] || '未知状态';
        }
    }
};
</script>

<style scoped>
.repair-request {
    padding: 20px;
}

.page-title {
    margin-bottom: 20px;
    font-size: 20px;
}

.search-bar {
    margin-bottom: 20px;
}

.repair-detail .detail-item {
    margin-bottom: 15px;
    line-height: 24px;
}

.repair-detail .detail-label {
    font-weight: bold;
    display: inline-block;
    width: 100px;
    vertical-align: top;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.image-item img {
    object-fit: cover;
    cursor: pointer;
    border: 1px solid #ddd;
}

.audit-info, .repair-info {
    margin-left: 100px;
    background: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
}
</style> 