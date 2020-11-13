import request from "@/utils/request";

// 登录接口
export function login(data) {
    return request({
        url: "/login",
        method: "post",
        data,
    });
}

// 获取用户信息
export function info() {
    return request({
        url: "/admin/user/info",
        method: "get",
    });
}

// 分页获取用户信息
export function getAllUser(data) {
    return request({
        url: "/admin/user/getAllUser",
        method: "post",
        data,
    });
}

// 新增用户
export function addUser(data) {
    return request({
        url: "/admin/user/addUser",
        method: "post",
        data,
    });
}

// 删除用户
export function deleteUser(data) {
    return request({
        url: "/admin/user/deleteUser",
        method: "delete",
        data,
    });
}
