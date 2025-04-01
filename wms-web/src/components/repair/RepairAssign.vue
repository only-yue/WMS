<template>
    <div class="repair-assign">
        <h2 class="page-title">保修处理</h2>
        
        <!-- 搜索栏 -->
        <el-row class="search-bar" type="flex" justify="space-between">
            <el-col :span="18">
                <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px; margin-right: 10px;">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="待处理" value="1"></el-option>
                    <el-option label="处理中" value="3"></el-option>
                    <el-option label="已完成" value="4"></el-option>
                </el-select>
                <el-input
                    v-model="searchQuery"
                    placeholder="搜索保修申请"
                    style="width: 200px;"
                    @keyup.enter.native="handleSearch">
                </el-input>
            </el-col>
            <el-col :span="6" style="text-align: right;">
                <el-button type="primary" @click="handleSearch">搜索</el-button>
            </el-col>
        </el-row>
        
        <!-- 保修申请列表 -->
        <el-table :data="repairList" border style="width: 100%; margin-top: 20px;">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="location" label="位置"></el-table-column>
            <el-table-column prop="description" label="故障描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="contactPerson" label="申请人"></el-table-column>
            <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
            <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="提交时间"></el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button size="mini" @click="viewDetail(scope.row)">查看详情</el-button>
                    <el-button 
                        size="mini" 
                        type="primary" 
                        @click="handleAssign(scope.row)"
                        v-if="scope.row.status === 1">
                        分配维修
                    </el-button>
                    <el-button 
                        size="mini" 
                        type="success" 
                        @click="handleComplete(scope.row)"
                        v-if="scope.row.status === 3">
                        完成维修
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
        
        <!-- 分配维修对话框 -->
        <el-dialog title="分配维修" :visible.sync="assignDialogVisible" width="500px">
            <el-form :model="assignForm" :rules="assignRules" ref="assignForm" label-width="100px">
                <el-form-item label="维修人员" prop="repairman">
                    <el-select v-model="assignForm.repairman" placeholder="请选择维修人员">
                        <el-option
                            v-for="item in repairmanList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="assignForm.phone" placeholder="请输入联系电话"></el-input>
                </el-form-item>
                <el-form-item label="预计时间" prop="estimatedTime">
                    <el-date-picker
                        v-model="assignForm.estimatedTime"
                        type="datetime"
                        placeholder="选择预计完成时间">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="assignDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAssign">确 定</el-button>
            </div>
        </el-dialog>
        
        <!-- 完成维修对话框 -->
        <el-dialog title="完成维修" :visible.sync="completeDialogVisible" width="500px">
            <el-form :model="completeForm" :rules="completeRules" ref="completeForm" label-width="100px">
                <el-form-item label="完成时间" prop="endTime">
                    <el-date-picker
                        v-model="completeForm.endTime"
                        type="datetime"
                        placeholder="选择完成时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="维修记录" prop="log">
                    <el-input type="textarea" v-model="completeForm.log" rows="4" placeholder="请输入维修记录"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="completeDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitComplete">确 定</el-button>
            </div>
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
                    <span class="detail-label">申请人：</span>
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
                            <img :src="img" width="100" height="100">
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
                        <p>预计完成：{{ currentRepair.repairInfo.estimatedTime }}</p>
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
    name: "RepairAssign",
    data() {
        return {
            searchQuery: '',
            statusFilter: '',
            repairList: [],
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            assignDialogVisible: false,
            completeDialogVisible: false,
            detailVisible: false,
            currentRepair: null,
            // 维修人员列表
            repairmanList: [
                { id: 1, name: '技术员小李', phone: '13600136000' },
                { id: 2, name: '技术员小张', phone: '13400134000' },
                { id: 3, name: '技术员小王', phone: '13300133000' }
            ],
            // 分配维修表单
            assignForm: {
                repairman: '',
                phone: '',
                estimatedTime: ''
            },
            assignRules: {
                repairman: [
                    { required: true, message: '请选择维修人员', trigger: 'change' }
                ],
                phone: [
                    { required: true, message: '请输入联系电话', trigger: 'blur' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
                ],
                estimatedTime: [
                    { required: true, message: '请选择预计完成时间', trigger: 'change' }
                ]
            },
            // 完成维修表单
            completeForm: {
                endTime: '',
                log: ''
            },
            completeRules: {
                endTime: [
                    { required: true, message: '请选择完成时间', trigger: 'change' }
                ],
                log: [
                    { required: true, message: '请输入维修记录', trigger: 'blur' }
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
                    status: 1, // 0-待审核，1-已通过，2-已拒绝，3-处理中，4-已完成
                    createTime: '2023-04-01 10:30:45',
                    images: ['/uploads/ac1.jpg', '/uploads/ac2.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-04-01 10:30:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    }
                },
                {
                    id: 2,
                    title: '宿舍楼水管漏水',
                    location: '5号宿舍楼3层走廊',
                    description: '水管破裂，水流较大',
                    contactPerson: '李四',
                    contactPhone: '13900139000',
                    status: 3,
                    createTime: '2023-04-01 09:20:33',
                    images: ['/uploads/water1.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-04-01 10:30:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    },
                    repairInfo: {
                        repairman: '技术员小李',
                        phone: '13600136000',
                        startTime: '2023-04-01 13:00:00',
                        estimatedTime: '2023-04-01 15:00:00'
                    }
                },
                {
                    id: 3,
                    title: '教室投影仪无法使用',
                    location: '教学楼A302',
                    description: '投影仪打不开，可能是灯泡坏了',
                    contactPerson: '王五',
                    contactPhone: '13700137000',
                    status: 4,
                    createTime: '2023-03-30 14:15:22',
                    images: ['/uploads/projector.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-03-30 15:20:00',
                        result: 'pass',
                        comment: '属实，请尽快处理'
                    },
                    repairInfo: {
                        repairman: '技术员小张',
                        phone: '13400134000',
                        startTime: '2023-03-31 09:00:00',
                        endTime: '2023-03-31 10:30:00',
                        log: '已更换灯泡，恢复正常使用'
                    }
                }
            ];
            
            // 根据状态筛选
            if (this.statusFilter !== '') {
                this.repairList = this.repairList.filter(item => item.status === parseInt(this.statusFilter));
            }
            
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
        
        // 查看详情
        viewDetail(row) {
            this.currentRepair = row;
            this.detailVisible = true;
        },
        
        // 处理分配维修
        handleAssign(row) {
            this.currentRepair = row;
            this.assignForm = {
                repairman: '',
                phone: '',
                estimatedTime: ''
            };
            this.assignDialogVisible = true;
        },
        
        // 提交分配维修
        submitAssign() {
            this.$refs.assignForm.validate((valid) => {
                if (valid) {
                    // 模拟提交到服务器
                    this.$message.success('维修任务分配成功');
                    this.assignDialogVisible = false;
                    
                    // 更新列表中的状态
                    const index = this.repairList.findIndex(item => item.id === this.currentRepair.id);
                    if (index !== -1) {
                        this.repairList[index].status = 3; // 更新为处理中状态
                        this.repairList[index].repairInfo = {
                            repairman: this.repairmanList.find(item => item.id === this.assignForm.repairman).name,
                            phone: this.assignForm.phone,
                            startTime: new Date().toLocaleString(),
                            estimatedTime: this.assignForm.estimatedTime.toLocaleString()
                        };
                    }
                }
            });
        },
        
        // 处理完成维修
        handleComplete(row) {
            this.currentRepair = row;
            this.completeForm = {
                endTime: '',
                log: ''
            };
            this.completeDialogVisible = true;
        },
        
        // 提交完成维修
        submitComplete() {
            this.$refs.completeForm.validate((valid) => {
                if (valid) {
                    // 模拟提交到服务器
                    this.$message.success('维修完成提交成功');
                    this.completeDialogVisible = false;
                    
                    // 更新列表中的状态
                    const index = this.repairList.findIndex(item => item.id === this.currentRepair.id);
                    if (index !== -1) {
                        this.repairList[index].status = 4; // 更新为已完成状态
                        this.repairList[index].repairInfo.endTime = this.completeForm.endTime.toLocaleString();
                        this.repairList[index].repairInfo.log = this.completeForm.log;
                    }
                }
            });
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
                1: '待处理',
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
.repair-assign {
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
    border: 1px solid #ddd;
}

.audit-info, .repair-info {
    margin-left: 100px;
    background: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
}
</style> 