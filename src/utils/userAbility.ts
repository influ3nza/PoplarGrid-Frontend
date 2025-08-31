export const generateRoleByMask = (role: number) => {
    const roles = ["监制/负责人", "图源", "美工", "翻译", "校对", "嵌字", "嵌字审核", "发布"];
    const role_list: string[] = [];
    
    for (let i = 0; i < roles.length; i++) {
        if ((role >> i) & 1) {
            role_list.push(roles[i]);
        }
    }
    return role_list.join("，");
}