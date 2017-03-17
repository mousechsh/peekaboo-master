
/**
 * 游戏数据
 */
var exp = module.exports;

exp.players = [];// 当前所有玩家列表
exp.isStart = false;// 是否开始游戏了
exp.captainUid = '';// 队长UID

exp.hideItemIndexs = [];// 需要隐藏的列表
exp.generateItemIndexs = [];// 需要生成的列表

exp.removePlayer = function (uid) {
	for (var i = exp.players.length - 1; i >= 0; i--) {
		if(exp.players[i].uid === uid){
			exp.players.splice(i, 1);
			return;
		}
	}
};

exp.getPlayer = function (uid) {
	var arr = exp.players.filter((m)=> m.uid === uid);
	return arr.length === 0 ? null : arr[0]; 
};