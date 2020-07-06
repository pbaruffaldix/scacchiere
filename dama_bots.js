var CPU_DAMA1 = {
	una_mossa: function () {
		var cpu_possibili = this.chess.dama_mosse_possibili(this.chess.turn_of);
		if (cpu_possibili[MV_EAT].length > 0){
			var scelto = cpu_possibili[MV_EAT][Math.floor(Math.random() * cpu_possibili[MV_EAT].length)];
		} else if (cpu_possibili[MV_OK].length > 0){
			var scelto = cpu_possibili[MV_OK][Math.floor(Math.random() * cpu_possibili[MV_OK].length)];
		} else {
			return false;
			}
		this.chess.cliccato(scelto[0].x, scelto[0].y);
		this.chess.cliccato(scelto[1].x, scelto[1].y);
	},
	link_chessboard: function(x) {this.chess = x}

}