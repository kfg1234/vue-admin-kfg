import axios from "axios";
import { Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";
import router from "@/router";

const service = axios.create({
    baseURL: window.globalVar.baseUrl,
    timeout: 5000, // 请求超过时长中断
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么
        if (store.getters.token) {
            //将token存储到请求头中
            config.headers["Authorization"] = getToken();
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        // console.log(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    function(response) {
        let res = response.data;
        // 对响应数据做点什么
        if (res.code !== 0) {
            if (res.code === 40001) {
                //用户不存在
                //后台定义的状态码
                Message.error({
                    message: res.msg,
                });
            } else if (res.code === 40002) {
                //密码错误
                Message.error({
                    message: res.msg,
                });
            } else if (res.code === 50001) {
                //token失效
                Message.error({
                    message: res.msg,
                });
                store.dispatch("user/removeToken").then(() => {
                    //清空token，守卫路由判断token不存在，就跳到登录页
                    router.replace("/");
                });
            } else if (res.code === 50002) {
                Message.error({
                    message: res.msg,
                });
            }

            return Promise.reject(new Error(res.msg || "Error"));
        } else {
            return res;
        }
    },
    function(error) {
        // 对响应错误做点什么
        // console.log(error);
        return Promise.reject(error);
    }
);

export default service;
