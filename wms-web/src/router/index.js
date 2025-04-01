import VueRouter from 'vue-router';

const routes = [
    {
        path:'/',
        redirect:'/login'
    },
    {
        path:'/login',
        name:'login',
        component:()=>import('../components/Login')
    },
    {
        path:'/register',
        name:'register',
        component:()=>import('../components/Register')
    },
    {
        path:'/Index',
        name:'index',
        component:()=>import('../components/Index'),
        children:[
            {
                path:'/Home',
                name:'home',
                meta:{
                    title:'首页'
                },
                component:()=>import('../components/Home')
            },
            {
                path:'/Admin',
                name:'admin',
                meta:{
                    title:'管理员管理'
                },
                component:()=>import('../components/admin/AdminManage')
            },
            {
                path:'/User',
                name:'user',
                meta:{
                    title:'用户管理'
                },
                component:()=>import('../components/user/UserManage')
            },
            {
                path:'/Role',
                name:'role',
                meta:{
                    title:'角色管理'
                },
                component:()=>import('../components/role/RoleManage')
            },
            {
                path:'/RepairRequest',
                name:'repairRequest',
                meta:{
                    title:'保修申请'
                },
                component:()=>import('../components/repair/RepairRequest')
            },
            {
                path:'/RepairAudit',
                name:'repairAudit',
                meta:{
                    title:'保修审核'
                },
                component:()=>import('../components/repair/RepairAudit')
            },
            {
                path:'/RepairAssign',
                name:'repairAssign',
                meta:{
                    title:'保修处理'
                },
                component:()=>import('../components/repair/RepairAssign')
            },
            {
                path:'/RepairTrack',
                name:'repairTrack',
                meta:{
                    title:'维修跟踪'
                },
                component:()=>import('../components/repair/RepairTrack')
            }
        ]
    }
]

const router = new VueRouter({
    mode:'history',
    routes
})

export function resetRouter() {
    router.matcher = new VueRouter({
        mode:'history',
        routes: []
    }).matcher
}
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
    return VueRouterPush.call(this, to).catch(err => err)
}
export  default router;