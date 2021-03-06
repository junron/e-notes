import {updateUser} from '../utils';

class User {
    uid: string;

    nickname?: string;
    desc?: string;
    roles: string[];
    admin = false;
    permissions: Map<string, boolean>;

    constructor(user: string | any) {
        if (typeof user === 'string') {
            this.uid = user;
            this.roles = [];
            this.permissions = new Map<string, boolean>();
        } else {
            this.uid = user.uid;
            this.nickname = user.nickname;
            this.desc = user.desc;
            this.roles = user.roles;
            this.admin = user.admin;
            this.permissions = new Map(Object.entries(user.permissions));
        }
    }

    async setPermissions(permissions: any) {
        for (const permission of Object.keys(permissions)) this.permissions.set(permission, permissions[permissions]);
        await updateUser(this.uid, this);
    }

    async setPermission(cid: string, accepts: boolean | string) {
        if (typeof accepts === 'undefined') this.permissions.delete(cid);
        if (typeof accepts === 'string') {
            if (accepts === "undefined" || accepts === "delete") {
                this.permissions.delete(cid);
            } else accepts = accepts === "true";
        }
        this.permissions.set(cid, accepts as boolean);
        await updateUser(this.uid, this);
    }

    async addRole(rid: string) {
        if (!this.roles.includes(rid)) {
            this.roles.push(rid);
            await updateUser(this.uid, this);
        }
    }

    async removeRole(rid: string) {
        if (this.roles.includes(rid)) {
            this.roles.splice(this.roles.indexOf(rid), 1);
            await updateUser(this.uid, this);
        }
    }

    accepts(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid);
    }

    rejects(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid) === false;
    }

    toData() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            desc: this.desc,
            roles: this.roles,
            admin: this.admin,
            permissions: autoConvertMapToObject(this.permissions)
        }
    }
}

const autoConvertMapToObject = (map: Map<string, any>) => {
    const obj = {};
    for (const [key, value] of map)
        // @ts-ignore
        obj[key] = value;
    return obj;
}
export default User;