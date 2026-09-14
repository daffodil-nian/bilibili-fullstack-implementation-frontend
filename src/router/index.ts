import {createRouter,createWebHistory} from "vue-router";
import HomeView from "../../src/views/home/index.vue";
import SearchPage from "../views/search/searchPage.vue";
import SpacePage from "../views/space/index.vue";
import settingPage from "../views/settingPage/index.vue";
import searchResult from "../views/search/searchResult/searchResult.vue";
const routes =[
    {
        path: '/',
        component: HomeView,
    },
    {
        path:'/search',
        component: SearchPage
    },
    {
        path:'/searchResult',
        component: searchResult
    },
    {
        path: '/space/:uid',
        component: SpacePage
    }
    ,{
        path:'/settingPage',
        component: settingPage
    }
    ,{
        // 这是关注页面的模块哦
        path:'/follow',
        component:()=>import("../views/follow/index.vue"),
    },
    {
        path: '/message',
  component: () => import('../views/message/index.vue'),
    }

]

const router =createRouter({
   history:createWebHistory(),
    routes,
});

export default router;