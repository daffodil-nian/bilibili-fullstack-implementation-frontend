import {createRouter,createWebHistory} from "vue-router";
import HomeView from "../../src/views/home/index.vue";
import SearchPage from "../views/search/searchPage.vue";
const routes =[
    {
        path: '/',
        component: HomeView,
    },
    {
        path:'/search',
        component: SearchPage
    }
]

const router =createRouter({
   history:createWebHistory(),
    routes,
});

export default router;