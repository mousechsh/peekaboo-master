
const binRole = require('binRole');
const DodgeRoleControl = require('DodgeRoleControl');
const FinderRoleControl = require('FinderRoleControl');
var Player = require('Player');
var GameData = require('GameData');

/**
 * 地图控制器
 */
cc.Class({
    extends: cc.Component,

    properties: {
        dodgeRolePrefab: cc.Prefab,// 躲
        finderRolePrefab: cc.Prefab,// 找

        hideItemCount: 10, // 隐藏个数
        generateItemCount: 10,// 生成个数
    },

    onLoad: function () {
        this.mapInfo = this.node.getComponent('MapInfo');
        this.myRoleControl = null;// 
        this.camps = [
        {
            Prefab: this.dodgeRolePrefab,
            ClassName: 'DodgeRole',
            RoleControl: DodgeRoleControl
        },
        {
            Prefab: this.finderRolePrefab,
            ClassName: 'FinderRole',
            RoleControl: FinderRoleControl
        }];

        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
    },

    stopAllEvent () {
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(cc.Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.myRoleControl.stopAllEvent();
        for (var i = this.roles.length - 1; i >= 0; i--) {
            this.roles[i].stopEvent();
        }
    },

    // 开启所有玩家定时器
    startAllEvent () {
        this.myRoleControl.init();
        for (var i = this.roles.length - 1; i >= 0; i--) {
            this.roles[i].startEvent();
        }
    },

    // 打开和关闭门
    openDoor: function (isOpen) {
        this.mapInfo.doorNode.active = isOpen;
    },

    // 所有找玩家 无限
    roleInfiniteBullet: function (isOpen) {
        for (var i = this.roles.length - 1; i >= 0; i--) {
            var role = this.roles[i];
            if(role.camp === 1){
                role.entity.infiniteBullet(isOpen);
            }
        }
    },

    // 显示所有藏的玩家
    showAllDodge: function () {
        for (var i = this.roles.length - 1; i >= 0; i--) {
            var role = this.roles[i];
            if(role.camp === 0){
                role.entity.death();
            }
        }
    },

    // 初始化地图
    init: function(){
        // 先随机隐藏 地面物品
        this.mapInfo.randomHideItem(GameData.hideItemIndexs);
        // 随机生成物品
        this.mapInfo.randomGenerateItem(GameData.generateItemIndexs);
        // 初始化玩家
        this.initAllRole();
    },

    // 初始化玩家
    initAllRole: function(){
        this.roles = [];
        for (var i = 0; i < GameData.players.length; i++) {
            var user = GameData.players[i];
            if(GameData.CanSatrtGamePlayers.indexOf(user.uid) === -1)
                continue;
            var role = this.createrRole(user);
            if(user.uid === Player.uid){
                var control = this.camps[user.camp].RoleControl;
                this.myRoleControl = role.node.addComponent(control);
                role.nicknameColor();
            }
            this.roles.push(role);
        }
    },

    createrRole: function (data) {
        var prof = this.camps[data.camp];
        // 创建角色空节点
        var roleNode = new cc.Node('roleNode'+data.uid);
        // 加入地图
        this.mapInfo.addRole(data.no, roleNode, data.camp);
        roleNode.zIndex = data.camp;
        // 添加角色统一控制器
        var bin = roleNode.addComponent(binRole);
        // 根据角色职业生成对应实体
        var prefab = cc.instantiate(prof.Prefab);
        var entity = prefab.getComponent(prof.ClassName);
        prefab.parent = roleNode;
        // 完事
        bin.init(data, entity);
        if(data.camp === 0){
            entity.setItemSpr(data.itemId);
        }
        if(Player.camp === 1 && data.camp === 0){// 如果自己是找 并且 对方是藏 那么就要把它名字隐藏了
            entity.hiddenNickname();
        }
        return bin;
    },

    getRole: function(uid){
        var arr = this.roles.filter((m)=> m.uid === uid);
        return arr.length === 0 ? null : arr[0];
    },

    removeRole: function (uid) {
        for (var i = this.roles.length - 1; i >= 0; i--) {
            var role = this.roles[i];
            if(role.uid === uid){
                role.node.removeFromParent();
                role.destroy();
                this.roles.splice(i, 1);
                return;
            }
        }
    },

    onMouseDown: function (event) {
        if(this.myRoleControl){
            this.myRoleControl.onMouseDown(event);
        }
    },
    
    onMouseMove: function (event) {
        if(this.myRoleControl){
            this.myRoleControl.onMouseMove(event);
        }
    },

    // 同步开火
    syncFire: function (data) {
        var role = this.getRole(data.uid);
        if(role){
            role.fire(data.startPos, data.targetPos);
        }
    },

    // 回合更新
    turnReveal: function (instructions) {
        for (var i = instructions.length - 1; i >= 0; i--) {
            var ins = instructions[i];
            var role = this.getRole(ins.uid);
            if(role){
                role.updateMove(ins.direction, ins.position);
            }
        }
    },

    // 找到了某人
    wasfound: function (uid) {
        var role = this.getRole(uid);
        if(role){
            role.entity.death();
        }
    }

});
