

// 首先设置端口号
const BASE_URL = 'http://192.168.58.128'
const API_PORT = 3000


const API_PRIFIX = '/api/v1'

// 拼接完整基础地址（带端口）
const getBaseUrl = (prefix = API_PRIFIX) => {
	// 如果有端口号，拼接上
	const portWithSlash = API_PORT ? `:${API_PORT}` : ''
	// 如果有前缀路径，拼接在路径后
	const prefixWithSlash = prefix ? `/${prefix}` : ''

	return `${BASE_URL}${portWithSlash}${prefixWithSlash}`
}

const defaultOptions = {
	method: "GET",
	header: {
		'content-type': 'application/json'
	},

}

function request(url = '', data = {}, prefix = '', options = {}) {
	const finalUrl = `${getBaseUrl(prefix)}${url}`
}


export const get = async (url:string, prefix = '', options = {}) => {
	const res = await request(url, {}, prefix, {
		...options,
		method: 'GET'
	});
	return res;
}

export const post = async (url:string,data={}, prefix = '', options = {}) => {
	const res = await request(url,data, prefix, {
		...options,
		method: 'POST'
	});
	return res;
}

export const put = async (url:string,data={}, prefix = '', options = {}) => {
	const res = await request(url,data, prefix, {
		...options,
		method: 'PUT'
	});
	return res;
}

export default {
	get,
	post,
    put,
	request
}