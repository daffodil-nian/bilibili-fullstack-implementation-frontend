import {ref,computed} from "vue"
import {defineStore} from "pinia"
import type{ContactItemVO,ChatMessageVO} from "../services/types"
import {listChatContacts,listChatMessages,markChatRead,sendChatText} from "../services/api"
import {getUserInfo} from "../services/userStorage"

export const useChatStore = defineStore('chat',()=>{
    //这个是联系人的写法
    //聊天框框肯定有联系人对吧

    const contacts= ref<ContactItemVO[]>([])
    const currentRoomId=ref<number | null>(null);
    const currentPeerUid = ref<number|null>(null);
    const messages=ref<ChatMessageVO[]>([]);
    const loading = ref(false);

    //获取当前登录的用户uid
    const myUid= computed(()=>getUserInfo()?.uid??null)

    const currentContact = computed(
        ()=>contacts.value.find((c)=>c.roomId ===currentRoomId.value)??null
    )

    /**
     * 初始化ing
     */
    async function init(){
        currentRoomId.value=null
        currentPeerUid.value=null
        messages.value=[]
        await fetchContacts();
    }

    /**
     * 获取联系人列表的一个写法
     */
    async function fetchContacts(){
        //首先获取聊天联系人这一个接口
        const res= await listChatContacts()
        contacts.value = res.data??[]
    }

    /**消息中心：点击某一行消息 */
    async function openByRoomId(roomId:number){
        //首先判断联系人是否是符合这个条件的
        // 联系人的roomId是否等于，等于就找到对应的roomId
        const hit = contacts.value.find((c)=>c.roomId === roomId)
        currentRoomId.value = roomId
        //根据roomId获取到对应的对象
        currentPeerUid.value = hit?.peerUid??null
        //接下来要获取这个room的详细信息
        await fetchMessages(roomId);
        //标记已读
        await markChatRead(roomId);
    }

    /** 空间页「发消息」：只带 peerUid 
     * 这个方法是根据peerUid获取值，可以点击用户的头像然后和她发起聊天
    */
    async function openByPeerUid(peerUid: number) {
        await fetchContacts()
        const hit = contacts.value.find((c) => c.peerUid === peerUid)

        currentPeerUid.value = peerUid
        
        //如果不是NULL就打开和他的聊天窗口
        if (hit?.roomId != null) {
            await openByRoomId(hit.roomId)
            return
        }
        // 还没会话：空窗，等用户发第一条再建（后端 sendText 会处理）
        currentRoomId.value = null
        messages.value = []
  }



    async function fetchMessages(roomId: number) {
        loading.value = true
        try {
            const res = await listChatMessages(roomId, 50)
            messages.value = res.data ?? []
        } finally {
            loading.value = false
        }
    }

    async function sendText(content:string){
        const text = content.trim();
        if(!text || currentPeerUid.value == null){
            return
        }
        await sendChatText({ targetUid: currentPeerUid.value,
             content: text })

        //然后就是发送完毕消息，之后会话要刷新
        await fetchContacts();
        if (currentRoomId.value == null) {
      const hit = contacts.value.find((c) => c.peerUid === currentPeerUid.value)
      if (hit?.roomId != null) currentRoomId.value = hit.roomId
    }
    if (currentRoomId.value != null) {
      await fetchMessages(currentRoomId.value)
    }
  }

return {
    contacts,
    currentRoomId,
    currentPeerUid,
    messages,
    loading,
    myUid,
    currentContact,
    init,
    fetchContacts,
    openByRoomId,
    openByPeerUid,
    fetchMessages,
    sendText,
  }
    }
)