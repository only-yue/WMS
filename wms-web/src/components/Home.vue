<template>
    <div class="home-container">
        <div class="welcome-section">
            <h1>欢迎来到物业保修管理系统</h1>
            <h2>{{ '欢迎你！' + user.name }}</h2>
            <div class="date-time">
                <DateUtils></DateUtils>
            </div>
        </div>

        <el-row :gutter="20" class="info-section">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-card class="user-info">
                    <div slot="header" class="card-header">
                        <span><i class="el-icon-user"></i> 个人信息</span>
                    </div>
                    <div class="user-avatar">
                        <el-avatar :size="100" icon="el-icon-user-solid"></el-avatar>
                    </div>
                    <div class="user-details">
                        <p><i class="el-icon-s-custom"></i> 账号：{{ user.no || user.username }}</p>
                        <p><i class="el-icon-mobile-phone"></i> 电话：{{ user.phone }}</p>
                        <p>
                            <i class="el-icon-location-outline"></i> 性别：
                            <el-tag :type="user.sex === '1' || user.sex === 1 ? 'primary' : 'danger'" size="small">
                                <i :class="user.sex == 1 || user.sex === '1' ? 'el-icon-male' : 'el-icon-female'"></i>
                                {{ user.sex == 1 || user.sex === '1' ? "男" : "女" }}
                            </el-tag>
                        </p>
                        <p>
                            <i class="el-icon-tickets"></i> 角色：
                            <el-tag type="success" size="small">
                                {{ user.roleId == 0 ? "超级管理员" : (user.roleId == 1 ? "管理员" : "用户") }}
                            </el-tag>
                        </p>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
                <el-row :gutter="20" class="stat-row">
                    <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                        <el-card class="stat-card" shadow="hover">
                            <div class="stat-icon"><i class="el-icon-s-custom"></i></div>
                            <div class="stat-info">
                                <div class="stat-title">用户总数</div>
                                <div class="stat-value">{{ stats.userCount || 0 }}</div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                        <el-card class="stat-card" shadow="hover">
                            <div class="stat-icon"><i class="el-icon-s-order"></i></div>
                            <div class="stat-info">
                                <div class="stat-title">工单总数</div>
                                <div class="stat-value">{{ stats.orderCount || 0 }}</div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-row :gutter="20" class="stat-row">
                    <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                        <el-card class="stat-card" shadow="hover">
                            <div class="stat-icon"><i class="el-icon-s-release"></i></div>
                            <div class="stat-info">
                                <div class="stat-title">今日新增</div>
                                <div class="stat-value">{{ stats.todayCount || 0 }}</div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                        <el-card class="stat-card" shadow="hover">
                            <div class="stat-icon"><i class="el-icon-s-cooperation"></i></div>
                            <div class="stat-info">
                                <div class="stat-title">待处理</div>
                                <div class="stat-value">{{ stats.pendingCount || 0 }}</div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="feature-section">
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8" v-for="(item, index) in quickLinks" :key="index" class="feature-col">
                <el-card class="quick-link-card" shadow="hover" @click.native="navigateTo(item.path)">
                    <div class="quick-link-icon"><i :class="item.icon"></i></div>
                    <div class="quick-link-title">{{ item.title }}</div>
                    <div class="quick-link-desc">{{ item.description }}</div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import DateUtils from "./DateUtils";
    export default {
        name: "Home",
        components: { DateUtils },
        data() {
            return {
                user: {},
                stats: {
                    userCount: 128,
                    orderCount: 356,
                    todayCount: 25,
                    pendingCount: 12
                },
                quickLinks: [
                    {
                        title: "用户管理",
                        icon: "el-icon-user-solid",
                        description: "管理系统用户信息",
                        path: "/User"
                    },
                    {
                        title: "角色管理",
                        icon: "el-icon-s-check",
                        description: "管理系统角色和权限",
                        path: "/Role"
                    },
                    {
                        title: "管理员管理",
                        icon: "el-icon-s-tools",
                        description: "管理系统管理员信息",
                        path: "/Admin"
                    }
                ]
            }
        },
        methods: {
            init() {
                this.user = JSON.parse(sessionStorage.getItem('CurUser')) || {};
                // 根据用户角色过滤快捷入口
                if (this.user.roleId !== 0) {
                    this.quickLinks = this.quickLinks.filter(item => item.title !== "管理员管理");
                }
                // 获取统计数据
                this.getStats();
            },
            getStats() {
                // 调用后端API获取真实数据
                this.$axios.get(this.$httpUrl + '/stats/dashboard')
                    .then(res => {
                        if (res.data && res.data.code === 200) {
                            this.stats = res.data.data;
                        }
                    })
                    .catch(() => {
                        console.log('使用默认统计数据');
                    });
            },
            navigateTo(path) {
                this.$router.push(path);
            }
        },
        created() {
            this.init();
        }
    }
</script>

<style scoped>
    .home-container {
        padding: 20px;
        background-color: #f0f2f5;
        min-height: calc(100vh - 60px);
    }
    
    .welcome-section {
        text-align: center;
        padding: 20px 0;
        margin-bottom: 20px;
    }
    
    .welcome-section h1 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 8px;
    }
    
    .welcome-section h2 {
        font-size: 18px;
        color: #606266;
        margin-bottom: 8px;
    }
    
    .date-time {
        padding: 8px;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.7);
        display: inline-block;
    }
    
    .info-section {
        margin-bottom: 20px;
    }
    
    .user-info {
        height: 100%;
        margin-bottom: 20px;
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .user-avatar {
        text-align: center;
        margin: 10px 0 15px;
    }
    
    .user-details p {
        margin: 8px 0;
        font-size: 14px;
    }
    
    .stat-row {
        margin-bottom: 20px;
    }
    
    .stat-card {
        display: flex;
        padding: 16px;
        height: 90px;
        overflow: visible;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .stat-icon {
        font-size: 28px;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #409EFF;
        margin-right: 10px;
    }
    
    .stat-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
        padding-right: 5px;
    }
    
    .stat-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .stat-value {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
    }
    
    .feature-section {
        margin-top: 10px;
    }
    
    .feature-col {
        margin-bottom: 20px;
    }
    
    .quick-link-card {
        height: 140px;
        text-align: center;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .quick-link-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    .quick-link-icon {
        font-size: 32px;
        color: #409EFF;
        margin-bottom: 8px;
    }
    
    .quick-link-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .quick-link-desc {
        font-size: 13px;
        color: #909399;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;
    }
</style>