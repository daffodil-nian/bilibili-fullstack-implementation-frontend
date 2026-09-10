import { ref } from 'vue'
import { defineStore } from 'pinia'
import { listFans, listFollows,followUser} from '../services/api'
import { getUserInfo } from '../services/userStorage'
import type { UserSimpleVO,UserFollowReq } from '../services/types';


export const useFollowStore=defineStore('follow',()=>{
    const activeKey=ref<'follows' | 'fans'>('follows');//当前激活的选项卡是多少

    const list=ref<UserSimpleVO[]>([]);//关注列表

    const page=ref(1);//当前页数
    
    const size=ref(10);//每页显示多少条数据
    
    const loading=ref(false);//是否正在加载,准确说是上一个列表是否正在加载,因为可能还有下一页
    
    const finished=ref(false);//是否以及没有下一页了

    //把上面的参数准备好之后，咱就要开始封装了~

    //最好能够封装的让人能看懂！

    /**
     * 分页拉列表
     * isFresh是从第一页重拉的意思
     * Content / Side 都要自己记「现在第几页」
     * 切到粉丝时，谁负责把页码重置成 1？容易忘
     * 页码散落在组件里，和 MallChat 的「状态集中在 store」不太一致
     * @returns 
     */
    async function fetchList(){
        const uid = getUserInfo()?.uid
        // console.log('你好呀')
        //1.如果没登录或者上次的还在加载中就直接return
        if(!uid||loading.value) return

        loading.value=true;

        try{
            //1.首先判断获取的是粉丝列表还是关注类表
            const api = activeKey.value ==='fans'?listFans:listFollows
            //2.开始请求数据
            const res=await api(uid,page.value,size.value);

            const rows:UserSimpleVO[] = res.data?? [];
            //3.rows是获得结果，如果rows是空的说明没有关注任何人
            
            list.value = rows;

            //4.判断是否还有下一页，如果finished是true说明没有下一页了，反之有下一页
            finished.value = rows.length < size.value;
            console.log(list.value)

        }
        catch(e){
            console.log(e)
        }
        finally{
            //加载完毕就这么写
            loading.value=false
        }

    }


    //中文意思是切换关注，如果关注了再按按钮就是取消关注的意思。
    async function toggleFollow(targetUid:number){
        // const uid = getUserInfo()?.uid
        const req :UserFollowReq = {
            followId:targetUid,
        }
        //因为是Boolean类型，所以不需要写
        await followUser(req);
        await fetchList();

    }


    //下一页
    async function nextPage(){
        if(loading.value || finished.value) return
        page.value++;
        await fetchList();
    }
    //上一页
    async function prevPage(){
        if(loading.value||page.value<=1) return
        page.value--;
        await fetchList();

    }

    async function init(){
        activeKey.value='follows';//默认follows
        page.value=1;
        finished.value=false;
        await fetchList();
    }

    async function switchSide(key:'follows' | 'fans'){
        activeKey.value=key;
        page.value=1;
        finished.value=false;
        await fetchList();
    }


    return {
        activeKey,
        fetchList,
        prevPage,
        nextPage,
        init,
        switchSide,
        list,
        page,
        size,
        loading,
        finished,
        toggleFollow

    }

});