<template>
    <div class="system-menus">
        <div class="left">
            <Tree
                title="菜单导航"
                :data="menuData"
                :default-expanded-keys="defaultExpandedKeys"
                :draggable="true"
                @node-click="clickNode"
                @addNode="addNode"
                @editNode="editNode"
                @deleteNode="deleteNode"
                @dragNode="dragNode"
            ></Tree>
        </div>
        <el-card class="right">
            <div slot="header" style="position:relative" class="flex col-center row-between">
                <div class="fw-b">菜单设置</div>
                <el-button style="position:absolute;right:0;width:80px" type="primary" size="medium" :disabled="disabled" @click="submit('menuForm')"
                    >确定</el-button
                >
            </div>
            <div></div>
            <el-form ref="menuForm" :model="menuFormData" :rules="rules" :disabled="disabled">
                <el-form-item label="菜单标题" prop="name">
                    <el-input show-word-limit :maxlength="30" v-model="menuFormData.name" placeholder="请输入菜单标题"></el-input>
                </el-form-item>
                <el-form-item label="菜单路径" prop="path">
                    <el-input show-word-limit :maxlength="100" v-model="menuFormData.path" placeholder="请输入菜单路径"></el-input>
                </el-form-item>
                <el-form-item label="组件地址" prop="componentPath">
                    <el-input show-word-limit :maxlength="100" v-model="menuFormData.componentPath" placeholder="组件地址"></el-input>
                </el-form-item>
                <div class="flex col-end">
                    <el-form-item class="flex-1" label="关联权限" prop="auth_id">
                        <el-cascader
                            style="width:100%"
                            :props="cascaderProps"
                            clearable
                            v-model="menuFormData.auth_id"
                            :options="authData"
                        ></el-cascader>
                    </el-form-item>
                    <el-form-item style="margin-left:20px">
                        <el-button style="" type="primary" size="default" @click="showAuthManage = true">功能权限</el-button>
                    </el-form-item>
                </div>
                <el-form-item label="排序号" prop="sort">
                    <el-input-number
                        :min="1"
                        :step="1"
                        size="medium"
                        step-strictly
                        controls-position="right"
                        placeholder="请输入排序号"
                        v-model="menuFormData.sort"
                    ></el-input-number>
                </el-form-item>
                <el-form-item label="导航菜单是否显示">
                    <el-switch :active-value="1" :inactive-value="0" v-model="menuFormData.isShow"> </el-switch>
                </el-form-item>
            </el-form>
        </el-card>
        <AuthManage v-model="showAuthManage" @authUpdated="authUpdated"></AuthManage>
    </div>
</template>

<script>
import Tree from "@/components/tree";
import AuthManage from "../components/auth-manage";
import { getAllMenu, createMenu, editMenu, deleteMenu } from "@/api/system/menu.js";
import { dragMenu } from "@/api/system";
export default {
    components: {
        Tree,
        AuthManage,
    },
    data() {
        return {
            showAuthManage: false,
            menuData: [],
            cascaderProps: {
                children: "children",
                label: "name",
                value: "id",
                emitPath: false,
                checkStrictly: true,
            },
            menuFormData: {
                isShow: 1,
            },
            rules: {
                name: [{ required: true, message: "请输入菜单标题", trigger: "blur" }],
                path: [{ required: true, message: "请输入菜单路径", trigger: "blur" }],
                componentPath: [{ required: true, message: "请输入组件地址", trigger: "blur" }],
                auth_id: [{ required: true, message: "请选择关联权限", trigger: "change" }],
                sort: [{ type: "number", required: true, message: "排序号不能为空", trigger: "change" }],
            },
            authData: [],
            disabled: true,
            optateStatus: null, //1为添加，2为编辑
            defaultExpandedKeys: [],
        };
    },
    methods: {
        // 权限数据更新
        authUpdated(data) {
            this.authData = data;
        },
        // 获取所有菜单数据
        async getMuenData() {
            let { data } = await getAllMenu();
            this.menuData = data;
        },

        // 点击节点
        clickNode(data, node) {
            this.$refs["menuForm"].clearValidate();
            this.disabled = true;
            this.menuFormData = {
                path: data.path,
                isShow: data.isShow,
                componentPath: data.componentPath,
                name: data.name,
                auth_id: data.auth_id,
                sort: data.sort,
                parentId: data.parentId,
            };
        },
        // 添加节点
        addNode(status, node, data) {
            this.optateStatus = 1;
            this.disabled = false;
            this.menuFormData = {
                isShow: 1,
                sort: data.children ? data.children.length + 1 : 1,
            };
            setTimeout(() => {
                this.$refs["menuForm"].clearValidate();
            }, 0);
            if (status === 1) {
                this.$set(this.menuFormData, "parentId", "top");
            } else {
                this.$set(this.menuFormData, "parentId", data.id);
            }
        },
        // 编辑节点
        editNode(node, data) {
            this.optateStatus = 2;
            this.disabled = false;
            this.$refs["menuForm"].clearValidate();
            this.menuFormData = {
                path: data.path,
                isShow: data.isShow,
                componentPath: data.componentPath,
                name: data.name,
                auth_id: data.auth_id,
                sort: data.sort,
                parentId: data.parentId,
                id: data.id,
            };
        },
        // 删除节点
        deleteNode(node, data) {
            if (data.children && data.children.length !== 0) {
                this.$message.warning("该节点包含子节点，请先删除子节点。");
                return;
            }
            this.$confirm("确认删除此菜单吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    let { msg } = await deleteMenu({
                        id: data.id,
                    });
                    this.disabled = true;
                    this.getMuenData();
                    this.$message.success(msg);
                    this.menuFormData = {};
                    setTimeout(() => {
                        this.$refs["menuForm"].clearValidate();
                    }, 0);
                })
                .catch(() => {});
        },
        // 拖拽节点成功
        async dragNode(currentNode, targetNode, position) {
            let params = {
                currentId: currentNode.id,
                targetId: targetNode.id,
                currentParentId: currentNode.parentId,
                targetParentId: targetNode.parentId,
                currentSort: currentNode.sort,
                targetSort: targetNode.sort,
                position: position,
                form: "system_menu_form",
            };
            let { msg } = await dragMenu(params);
            this.$message.success(msg);
            this.menuFormData = {};
            setTimeout(() => {
                this.$refs["menuForm"].clearValidate();
            }, 0);
            this.disabled = true;
            await this.getMuenData();
            this.defaultExpandedKeys = [currentNode.parentId];
            this.$store.dispatch("permission/changeMenus");
        },
        // 确定保存
        submit(name) {
            this.$refs[name].validate(async (valid) => {
                if (valid) {
                    if (this.optateStatus === 1) {
                        let { msg } = await createMenu(this.menuFormData);
                        this.$message.success(msg);
                    } else if (this.optateStatus === 2) {
                        let { msg } = await editMenu(this.menuFormData);
                        this.$message.success(msg);
                    }
                    this.disabled = true;
                    await this.getMuenData();
                    this.menuFormData.parentId ? (this.defaultExpandedKeys = [this.menuFormData.parentId]) : (this.defaultExpandedKeys = []);
                    this.menuFormData = {};
                    setTimeout(() => {
                        this.$refs["menuForm"].clearValidate();
                    }, 0);
                    this.$store.dispatch("permission/changeMenus");
                }
            });
        },
    },
    mounted() {
        this.getMuenData();
    },
};
</script>

<style lang="scss" scoped>
.system-menus {
    @include wh(100%, 100%);
    display: flex;
    .left {
        width: 400px;
        height: 100%;
        margin-right: 20px;
    }
    .right {
        flex: 1;
    }
}
</style>
