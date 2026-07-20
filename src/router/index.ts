import {createRouter,createWebHistory} from "vue-router";
import HomeView from "../../src/views/home/index.vue";
import SearchPage from "../views/search/searchPage.vue";
import SpacePage from "../views/space/index.vue";
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
        path: '/space/:uid',
        component: SpacePage
    }
]

const router =createRouter({
   history:createWebHistory(),
    routes,
});

export default router;