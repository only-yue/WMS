import vue from 'vue'
import Vuex from 'vuex'
import router,{resetRouter} from "../router";
vue.use(Vuex)

function addNewRoute(menuList) {
    console.log(menuList)
    let routes = router.options.routes
    console.log(routes)
    routes.forEach(routeItem=>{
        if(routeItem.path=="/Index"){
            menuList.forEach(menu=>{
                let childRoute =  {
                    path:'/'+menu.menuclick,
                    name:menu.menuname,
                    meta:{
                        title:menu.menuname
                    },
                    component:()=>import('../components/'+menu.menucomponent)
                }

                routeItem.children.push(childRoute)
            })
        }
    })

    resetRouter()
    router.addRoutes(routes)
}

export default new Vuex.Store({
    state: {
        menu: localStorage.getItem('menu') ? JSON.parse(localStorage.getItem('menu')) : []
    },
    mutations: {
        setMenu(state,menuList) {
            // 确保menuList是数组
            if (!Array.isArray(menuList)) {
                menuList = [];
            }
            
            // 检查是否包含角色管理菜单
            const hasRoleMenu = menuList.some(item => 
                item.menuclick === 'Role' || 
                item.menuname === '角色管理');
            
            // 如果没有角色管理菜单，添加一个
            if (!hasRoleMenu) {
                menuList.push({
                    menuclick: 'Role',
                    menuname: '角色管理',
                    menuicon: 'el-icon-s-check',
                    menucomponent: 'role/RoleManage'
                });
            }
            
            // 检查是否包含保修管理菜单
            const hasRepairMenus = menuList.some(item => 
                item.menuclick === 'RepairRequest' || 
                item.menuname === '保修申请');
            
            // 如果没有保修管理菜单，添加相关菜单项
            if (!hasRepairMenus) {
                // 添加保修申请菜单
                menuList.push({
                    menuclick: 'RepairRequest',
                    menuname: '保修申请',
                    menuicon: 'el-icon-s-order',
                    menucomponent: 'repair/RepairRequest'
                });
                
                // 添加保修审核菜单
                menuList.push({
                    menuclick: 'RepairAudit',
                    menuname: '保修审核',
                    menuicon: 'el-icon-s-check',
                    menucomponent: 'repair/RepairAudit'
                });
                
                // 添加保修处理菜单
                menuList.push({
                    menuclick: 'RepairAssign',
                    menuname: '保修处理',
                    menuicon: 'el-icon-s-tools',
                    menucomponent: 'repair/RepairAssign'
                });
                
                // 添加维修跟踪菜单
                menuList.push({
                    menuclick: 'RepairTrack',
                    menuname: '维修跟踪',
                    menuicon: 'el-icon-s-data',
                    menucomponent: 'repair/RepairTrack'
                });
            }
            
            state.menu = menuList;
            localStorage.setItem('menu', JSON.stringify(menuList));
            addNewRoute(menuList);
        },
        clearMenu(state) {
            state.menu = []
            localStorage.removeItem('menu')
        }
    },
    getters: {
        getMenu(state) {
            return state.menu
        }
    }
})