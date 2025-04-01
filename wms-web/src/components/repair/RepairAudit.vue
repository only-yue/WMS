<template>
    <div class="repair-audit">
        <h2 class="page-title">保修审核</h2>
        
        <!-- 搜索栏 -->
        <el-row class="search-bar" type="flex" justify="space-between">
            <el-col :span="18">
                <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px; margin-right: 10px;">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="待审核" value="0"></el-option>
                    <el-option label="已通过" value="1"></el-option>
                    <el-option label="已拒绝" value="2"></el-option>
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
                        type="success" 
                        @click="handleAudit(scope.row, 'pass')"
                        v-if="scope.row.status === 0">
                        通过
                    </el-button>
                    <el-button 
                        size="mini" 
                        type="danger" 
                        @click="handleAudit(scope.row, 'reject')"
                        v-if="scope.row.status === 0">
                        拒绝
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
        
        <!-- 审核对话框 -->
        <el-dialog :title="auditDialogTitle" :visible.sync="auditDialogVisible" width="500px">
            <el-form :model="auditForm" :rules="auditRules" ref="auditForm" label-width="100px">
                <el-form-item label="审核结果" prop="result">
                    <el-radio-group v-model="auditForm.result">
                        <el-radio label="pass">通过</el-radio>
                        <el-radio label="reject">拒绝</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核意见" prop="comment">
                    <el-input type="textarea" v-model="auditForm.comment" rows="4" placeholder="请输入审核意见"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="auditDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAudit">确 定</el-button>
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
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "RepairAudit",
    data() {
        return {
            searchQuery: '',
            statusFilter: '',
            repairList: [],
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            auditDialogVisible: false,
            detailVisible: false,
            currentRepair: null,
            auditForm: {
                result: 'pass',
                comment: ''
            },
            auditRules: {
                result: [
                    { required: true, message: '请选择审核结果', trigger: 'change' }
                ],
                comment: [
                    { required: true, message: '请输入审核意见', trigger: 'blur' }
                ]
            }
        };
    },
    computed: {
        auditDialogTitle() {
            return this.auditForm.result === 'pass' ? '通过审核' : '拒绝审核';
        }
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
                    status: 2,
                    createTime: '2023-03-30 14:15:22',
                    images: ['/uploads/projector.jpg'],
                    auditInfo: {
                        auditor: '王管理',
                        auditTime: '2023-03-30 15:20:00',
                        result: 'reject',
                        comment: '请先检查电源是否正常'
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
        
        // 处理审核
        handleAudit(row, result) {
            this.currentRepair = row;
            this.auditForm = {
                result: result,
                comment: ''
            };
            this.auditDialogVisible = true;
        },
        
        // 提交审核
        submitAudit() {
            this.$refs.auditForm.validate((valid) => {
                if (valid) {
                    // 模拟提交到服务器
                    this.$message.success('审核提交成功');
                    this.auditDialogVisible = false;
                    
                    // 更新列表中的状态
                    const index = this.repairList.findIndex(item => item.id === this.currentRepair.id);
                    if (index !== -1) {
                        this.repairList[index].status = this.auditForm.result === 'pass' ? 1 : 2;
                        this.repairList[index].auditInfo = {
                            auditor: '当前管理员',
                            auditTime: new Date().toLocaleString(),
                            result: this.auditForm.result,
                            comment: this.auditForm.comment
                        };
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
.repair-audit {
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

.audit-info {
    margin-left: 100px;
    background: #f8f8f8;
    padding: 10px;
    border-radius: 4px;
}
</style> 