import dayjs from 'dayjs'

export function formatMsgTime(t?:string | number){
if (!t) return ''
const d= dayjs(t)
if(d.isSame(dayjs(), 'day')){
return d.format('今天 HH:mm')
}
return d.format('YYYY年M月D日  HH:mm')
}
