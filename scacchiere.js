function abs(x){return Math.abs(x)}

const [DAMA, DAMONE, TORRE, CAVALLO,ALFIERE,REGINA,RE, PEDINA] = ['DAMA', 'DAMONE','TORRE', 'CAVALLO', 'ALFIERE', 'REGINA', 'RE','PEDINA'];

const DIR_STR = {'-1.-1':'↖︎', '1.1':'↘', '-1.1':'↙', '1.-1': '↗︎' }

const MV_EAT = 'mv_eat';
const MV_OK = 'mv_ok';

var pos_ini = {
	 scacchi: [
		[TORRE,CAVALLO,ALFIERE,REGINA,RE,ALFIERE,CAVALLO,TORRE],
		[PEDINA,PEDINA,PEDINA,PEDINA,PEDINA,PEDINA,PEDINA,PEDINA]
		],
	dama: [
		[DAMA,null,DAMA,null,DAMA,null,DAMA,null],
		[null,DAMA,null,DAMA,null,DAMA,null,DAMA],
		[DAMA,null,DAMA,null,DAMA,null,DAMA,null]
		],
	bastiglia:[
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		[DAMA,DAMA,DAMA,DAMA,DAMA,DAMA,DAMA],
		[DAMA,DAMA,DAMA,null,DAMA,DAMA,DAMA],
		[DAMA,DAMA,DAMA,DAMA,DAMA,DAMA,DAMA],
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		[null,null,null,null,null,null,null],
		],
	bastiglia_ue:[
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		['del',DAMA,DAMA,DAMA,DAMA,DAMA,'del'],
		[DAMA,DAMA,DAMA,DAMA,DAMA,DAMA,DAMA],
		[DAMA,DAMA,DAMA,null,DAMA,DAMA,DAMA],
		[DAMA,DAMA,DAMA,DAMA,DAMA,DAMA,DAMA],
		['del',DAMA,DAMA,DAMA,DAMA,DAMA,'del'],
		['del','del',DAMA,DAMA,DAMA,'del','del'],
		[null,null,null,null,null,null,null],
		],
	puzzle3: [
		[1,2,3],
		[4,5,6],
		[7,8,null]
		],
	puzzle4: [
		[1,2,3,4],
		[5,6,7,8],
		[9,10,11,12],
		[13,14,15,null]
		],
	puzzle5: [
		[1,2,3,4,5],
		[6,7,8,9,10],
		[11,12,13,14,15],
		[16,17,18,19,20],
		[21,22,23,24,null]
		]
		}

var chess = {
	//simboli: {TORRE:'♜', CAVALLO:'♞', ALFIERE:'♝', RE:'♚', REGINA:'♛', PEDINA:'♙', DAMA:'◉','DAMONE':'⊛'},
	simboli: {TORRE:'♜', CAVALLO:'♞', ALFIERE:'♝', RE:'♚', REGINA:'♛', PEDINA:'<img class="tremola" src="pawn.svg">', DAMA:'◉',DAMONE:'⊛'},
	init:function (gioco, options = {}){
		this.start_time = Date.now();
		this.gioco = gioco;
		if ('size' in options){
			this.size = options.size;
			this.pos_ini = pos_ini[this.gioco + this.size];
		} else {
			this.pos_ini = pos_ini[this.gioco];
			this.size = this.pos_ini[0].length;
			}
		for (var x=0;x<25;x++){this.simboli[x] = x};
		if (gioco =='dama'){
			this.mossa_valida = this.dama_mossa_valida;
		} else if (gioco == 'puzzle') {
			this.mossa_valida = this.puzzle_mossa_valida;
			if ('image' in options){
				for (var x = 1;x<= options['size']**2;x++){
					this.simboli[x] = '<img src="'+ options.image.replace('$',x)+'" style="width:100%;height:100%;opacity:0.8">'
				}
			}
		} else if (gioco == 'bastiglia'){
			if ('pos_ini' in options){
				this.pos_ini = pos_ini[options.pos_ini];
			}
			this.mossa_valida = this.bastiglia_mossa_valida;
		} else {
			this.mossa_valida = this.scacchi_mossa_valida;
		}
		this.from = null;							// da dove
		this.to = null; 							// a dove
		this.quanti = {'playerA':0,'playerB':0}		// quante pedine
		this.turn_of = 'playerA';					// a chi tocca
		this.cella_focus = null;					//el HTML con il focus
		this.mem = new Array(8);					// memoria delle caselle
		for (var y=0;y<8;y++){
			this.mem[y] = new Array(8);
			for (var x=0;x<8;x++){
				if (y < this.pos_ini.length) {
					var nuovo = this.pos_ini[y][x];
					if (nuovo != null){
						this.mem[y][x] = [nuovo, "playerA"];
						if (nuovo != "del"){this.quanti["playerA"]+= 1;}
						} else {this.mem[y][x] = null}
					}
				else if (y > 7-this.pos_ini.length) {
					if (this.gioco == 'dama'){
						var nuovo = this.pos_ini[ 7 - y][7-x];
					} else {
						var nuovo = this.pos_ini[7 - y][x];
						}
					if (nuovo != null){
						this.mem[y][x] = [nuovo, "playerB"];
						if (nuovo != "del"){this.quanti["playerA"]+= 1;}
						} else {this.mem[y][x] = null}
					}
				else {
					this.mem[y][x] = null;
					}
			}
		}
		if (this.gioco == 'puzzle'){this.puzzle_mischia(this.size**2*5);}
		chess.set_title();
	},
	set_title: function(){
		var capt = document.getElementById('caption')
		var h1= this.gioco.toUpperCase() + " -  è il turno di:<span class='";
		h1+= this.turn_of+"'>" + this.turn_of + "</span>";
		capt.innerHTML = h1

	},
	msg:function (a,t='log'){
		console.log(a);
		if (t!='log') {
		var m1 = document.getElementById('box_msg');
		if (t == 'win') {
			m1.innerHTML = "<b style='color:#FFFF00'>"+a+"<b>";
			m1.style.display='block';
			}
		else if (t == 'info') {
			m1.innerHTML = "<b style='color:#FF00FF'>"+a+"<b>";
			m1.style.display='block';
			} else if (t =='err') {
			m1.innerHTML = "<b style='color:#FF0000'>"+a+"<b>";
			m1.style.display='block';
			}
		}
	},
	is_free_road: function (m) {
		n_max = Math.max(abs(m.dx),abs(m.dy));
		for (let x = 1; x<n_max;x++){
			if (not(this.is_free)){return false}
			}
		return true;
		},
	is_free: function (x,y) {
		return true
	},
	get_casella: function (x,y){
		return document.getElementById('c_'+x+'_'+y);
	},
	disegna_casella: function (x,y){
		var c1 = this.get_casella(x,y);
		var i1 = chess.mem[y][x];
		if (i1 == null){
			c1.innerHTML = '';
		} else if (i1[0] == 'del'){
			c1.parentNode.removeChild(c1);
		} else {
			c1.innerHTML = chess.simboli[i1[0]]
			if (this.gioco == 'scacchi') {
				c1.innerHTML+= "<span style='font-size:14px;display:block;'>x="+x+" y="+y+"</span>";
				}
		}
		c1.classList.remove('playerA');
		c1.classList.remove('playerB');
		if(i1 != null) {c1.classList.add(i1[1])};
	},
	sfocalizza: function () {
		this.cella_focus.classList.remove('cella_focus');
		this.cella_focus = null;
		this.from = null;
		},
	cliccato: function (x,y){
		var i1 = this.mem[y][x];
		if (this.from == null){
			if (i1 == null){
				this.msg('Scegliere la pedina da muovere','err');
				return true;
				}
			if (i1[1] != this.turn_of) {
				this.msg('Tocca a ' + this.turn_of + ' non a ' + i1[1],'err');
				return true;
			}
			chess.msg('Scelta x='+x + 'y=' +y,'log');
			chess.from = [y, x];
			chess.msg(i1,'log');
		chess.cella_focus = this.get_casella(x,y);
		chess.cella_focus.classList.add('cella_focus');

		} else {
			var y_from = this.from[0];
			var x_from = this.from[1];
			if (x == x_from && y == y_from){ //annulla selezione
				this.sfocalizza();
				return true;
			} else if (i1 != null && i1[1] == chess.mem[y_from][x_from][1]) { // annullo selezione perchè hai scelto 2
				this.msg('Non puoi muovere sopra ad una tua pedina','err');
				this.sfocalizza();
				return true;
			} else {
				// posso muovere
				var esito_mossa = this.mossa_valida(x, y);
				if (esito_mossa == false){
					this.msg('mossa non valida','err');
				} else {
					// mosso
					this.msg('Mossa x='+ x_from + ' y=' + y_from + 'in x=' + x + ' y=' + y ,'log');
					this.mem[y][x] = chess.mem[y_from][x_from];
					this.mem[y_from][x_from] = null;
					this.disegna_casella(x,y);
					this.disegna_casella(x_from,y_from);
					this.sfocalizza();
					// verifica vincita e cambio turno
					next_player = (this.turn_of == 'playerA') ? 'playerB' : 'playerA';
					if (this.gioco == 'bastiglia') {
						next_player = this.turn_of;
						if (this.quanti[this.turn_of] == 1) {
							this.vittoria();
						}
					} else if (this.gioco == 'scacchi'){
						next_player = (this.turn_of == 'playerA') ? 'playerB' : 'playerA';
						if (this.scacchi_scaccano(next_player).length>0) {
							this.msg('Scacco a '+ next_player + "!",'info');
							}
					} else if (this.gioco == 'puzzle'){
						next_player = this.turn_of;
					} else if  (this.gioco == 'dama'){
						next_player = (this.turn_of == 'playerA') ? 'playerB' : 'playerA';
						if (this.just_eat == true) {
							var possibili = this.dama_mosse_possibili(this.turn_of);
							for (var n=0;n < possibili[MV_EAT].length; n++){
								var possibile = possibili[MV_EAT][n];
								if (possibile[0].x == x && possibile[0].y == y){ //devo mangiare ancora
									console.log('si può mangiare ancora');
									chess.cella_focus = this.get_casella(x,y);
									next_player = this.turn_of;
									this.cella_focus.classList.add('cella_focus');
									this.cella_focus = this.get_casella(x,y);
									this.from = [y,x];
									}
							}
						}
					this.dama_mosse_possibili(next_player);
					}
					// cambio turno
					this.turn_of = next_player;
					this.set_title();
				}
			}
		}
	},
	vittoria: function() {
		var time_now = Date.now();
		var delta_time = (time_now - this.start_time) /1000;
		this.msg('HAI VINTO!<br>in '+ delta_time +'sec.', 'win');
		},
/* ==================================================================== SEZIONE:DAMA

	regole della variante italiana, si veda http://www.federdama.it/cms/attivita



*/
	dama_mossa_valida: function (x1, y1) {
		var mangiato = false;
		var x0 = this.from[1] * 1;
		var y0 = this.from[0] * 1;
		var dx = this.from[1] - x1;
		var dy = this.from[0] - y1;
		var risulta = false;
		if (this.turn_of == 'playerA') {dy *= -1}
		if (this.mem[y1][x1] != null) {return false;} // non posso mettere dove è occupato
		if (abs(dx) == 1 && dy == 1) {risulta = true;}
		else if (abs(dx) == 1 && abs(dy) == 1) {
			if (dy == 1 || this.mem[y0][x0][0] == DAMONE) {risulta = true;}
			}
		if (abs(dx) == 2 && abs(dy) == 2){
			if (dy == 2 || this.mem[y0][x0][0] == DAMONE) {
				var x_mangio = (x0/2 + x1/2);
				var y_mangio = (y0/2 + y1/2);
				console.log('x '+ x0 + ' this.from[1] '+ x1 + ' y '+ y0 + ' this.from[0] '+ y1);
				console.log('y_mangio '+y_mangio + ' x_mangio '+ x_mangio);
				mangiato = true;
				var mangio = this.mem[y_mangio][x_mangio];
				if (mangio != null && mangio[1] != this.turn_of) {
					if (this.mem[y_mangio][x_mangio][0] == DAMA || this.mem[y0][x0][0] == DAMONE){
						this.mem[y_mangio][x_mangio] = null;
						this.disegna_casella(x_mangio,y_mangio);
						risulta = true;
						}
					}
				}
			}
		if (risulta == true) {
			this.just_eat = mangiato;
			if (this.turn_of == 'playerB' && y1 == 0){
				this.mem[y0][x0][0] = DAMONE;
				}
			if (this.turn_of == 'playerA' && y1 == (this.size -1)){
				this.mem[y0][x0][0] = DAMONE;
				}
			}
		return risulta;
	},
	dama_mosse_possibili: function (player1) {
		var l_possibili = {};
		l_possibili[MV_OK] = [];
		l_possibili[MV_EAT] = [];
		for (var y=0;y < this.size ;y++){
			for (var x=0; x < this.size;x++){
				if (x % 2 == y % 2){ //solo pos di gioco
					var pos0 = {x:x,y:y, v:this.mem[y][x]};
					this.get_casella(pos0.x, pos0.y).classList.remove(MV_OK);
					this.get_casella(pos0.x, pos0.y).classList.remove(MV_EAT);
					this.get_casella(pos0.x, pos0.y).title = '';
					if (pos0.v != null && pos0.v[1] == player1){
						for (var n = 0; n < 4; n++){
							var pos1 = {x: 1 - 2 * (n % 2), y: 1 - 2 * ( n > 1)}; // 1 1, -1 1, 1 -1, -1 -1
							pos1 = {x: x + pos1.x, y: y + pos1.y};
							if (pos1.x >= 0 && pos1.y >= 0 && pos1.x < this.size && pos1.y < this.size){
								pos1.v = this.mem[pos1.y][pos1.x];
								if (pos1.v == null){
									console.log(JSON.stringify(pos1));
									if (pos0.v[0] == DAMONE) {
										l_possibili[MV_OK].push([pos0, pos1]);
									} else if ((player1 == 'playerA') == (pos1.y > pos0.y)) {
										l_possibili[MV_OK].push([pos0, pos1]);
									}
								}
							}
							var pos1 = {x: 1 - 2 * (n % 2), y: 1 - 2 * ( n > 1)}; // 1 1, -1 1, 1 -1, -1 -1
							pos_mangio = {x: x + pos1.x, y: y + pos1.y}
							pos1 = {x: x + pos1.x * 2, y: y + pos1.y * 2};
							if (pos1.x >= 0 && pos1.y >= 0 && pos1.x < this.size && pos1.y < this.size){
								pos1.v = this.mem[pos1.y][pos1.x];
								pos_mangio.v = this.mem[pos_mangio.y][pos_mangio.x];
								if (pos1.v == null && pos_mangio.v != null && pos_mangio.v[1] != player1){
									if (pos0.v[0] == DAMONE) {
										l_possibili[MV_EAT].push([pos0, pos1, MV_EAT]);
									} else if ((player1 == 'playerA') == (pos1.y > pos0.y)) {
										l_possibili[MV_EAT].push([pos0, pos1, MV_EAT]);
									}
								}
							}
						}
					}
				}
			}
		}
		for (var n = 0;n < l_possibili[MV_OK].length; n++){
			var pos1 = l_possibili[MV_OK][n][1];
			this.get_casella(pos1.x,pos1.y).classList.add(MV_OK);
			//this.get_casella(pos1.x,pos1.y).title += " "+ l_possibili[MV_OK][n][0].x + ","+ l_possibili[n][0].y;
			}
		for (var n = 0;n < l_possibili[MV_EAT].length; n++){
			var pos1 = l_possibili[MV_EAT][n][1];
			this.get_casella(pos1.x,pos1.y).classList.add(MV_EAT);
			//this.get_casella(pos1.x,pos1.y).title += " "+ l_possibili[n][0].x + ","+ l_possibili[n][0].y;
			}
		return l_possibili;
	},
// ==================================================================== SEZIONE:PUZZLE
	puzzle_mossa_valida: function (x1,y1){
		var x0 = this.from[1] * 1;
		var y0 = this.from[0] * 1;
		var dx = this.from[1] - x1;
		var dy = this.from[0] - y1;
		var esito = false;
		//if (this.mem[y1][x1] != null) {return false}
		if (abs(dx)== 1 && dy == 0){esito = true}
		if (abs(dy)== 1 && dx == 0){esito = true}
		if (esito == true) {
			if (this.puzzle_is_win()) {
				this.vittoria();
				}
		}
		return esito;
	},
	puzzle_mischia: function(volte) {
		var enne_max = this.size -1;
		var x0 = enne_max;
		var y0 = enne_max;
		for (var n = 0 ; n < volte; n++){
			var possibili = [];
			if (x0 > 0) {possibili.push([x0 - 1, y0]);}
			if (y0 > 0) {possibili.push([x0, y0 - 1]);}
			if (x0 < enne_max){possibili.push([x0 + 1, y0]);}
			if (y0 < enne_max){possibili.push([x0, y0 + 1]);}
			var scelto = possibili[Math.floor(Math.random() * possibili.length)];
			this.mem[x0][y0] = this.mem[scelto[0]][scelto[1]];
			this.mem[scelto[0]][scelto[1]] = null;
			x0 = scelto[0];
			y0 = scelto[1];
		}
	},
	puzzle_is_win: function() {
		for (var n = 0; n < (this.size ** 2 -1);n++){
			var y = Math.floor(n/this.size);
			var x = n % this.size;
			if (this.mem[y][x] != null) {
				if (this.mem[y][x][0] != (n+1)){
				console.log(['ok fino a ', n])
				return false}
			}
		}
		return true
	},
// ==================================================================== SEZIONE:BASTIGLIA
	bastiglia_mossa_valida: function (x1,y1){
		var x0 = this.from[1] * 1;
		var y0 = this.from[0] * 1;
		var dx = this.from[1] - x1;
		var dy = this.from[0] - y1;
		if (this.mem[y1][x1] != null) {return false}
		if ((abs(dx)== 2 && dy == 0) || (dx == 0 && abs(dy) == 2)){
			var x_mangio = (x0/2 + x1/2);
			var y_mangio = (y0/2 + y1/2);
			var mangio = this.mem[y_mangio][x_mangio];
			if (mangio != null) {
				this.mem[y_mangio][x_mangio] = null;
				this.disegna_casella(x_mangio,y_mangio);
				this.quanti[this.turn_of]-= 1;
				return true;
				}
			}
		return false;
	},
// ==================================================================== SEZIONE:SCACCHI
	scacchi_mossa_valida: function (x1, y1){
		var x0 = this.from[1] * 1;
		var y0 = this.from[0] * 1;
		var dx = x1 - this.from[1];
		var dy = y1 - this.from[0];
		if ((this.mem[y1][x1] != null) && (this.mem[y1][x1][1] == this.turn_of)) {
			this.msg('non puoi mangiare i tuoi stessi pezzi','err')
			return false;
		} else {
			var possibile = this.scacchi_ipotesi(x0,y0,x1,y1);
			if (possibile == true){
				// a questo punto muovo
				var old1 = this.mem[y1][x1];
				this.mem[y1][x1] = this.mem[y0][x0];
				var scaccano = this.scacchi_scaccano(this.turn_of);
				console.log("scaccano>");
				console.log(scaccano);
				if (scaccano.length > 0){
					this.msg('Devi liberarti dallo scacco!','err'); // e torno indietro;
					this.mem[y0][x0] = this.mem[y1][x1];
					this.mem[y1][x1] = old1;
					return false;
					}

				// var scaccano = this.scacchi_scaccano(this.turn_of); // la mossa lascia sotto scacchi?
				// 		se è scacco matto ho vinto
				// altrimenti se mi lascio sotto scacco => la mossa non è valida
				return true;
				}
			else {return false;}
		}

	},
	scacchi_ipotesi: function (x0, y0, x1, y1){
		var possibile = false;
		var dx = x1 - x0;
		var dy = y1 - y0;
		var muovo = this.mem[y0][x0];
		if (muovo[0] == TORRE) {
			if ((abs(dx)*abs(dy)) == 0) {
				if (this.scacchi_libero(x0,y0,dx,dy)) {possibile = true}
			}
		} else if (muovo[0] == CAVALLO){
			if ( (abs(dx)+abs(dy)) == 3 && abs(abs(dx) - abs(dy)) == 1) {possibile = true;}
		} else if (muovo[0] == PEDINA) {
			if (this.turn_of == 'playerA'){
				var dy_verso = 1;
				if (dy*dy_verso == 2) {
					// muove di 2 solo da y0=1 e se le due celle davanti sono vuote
					if (dx == 0 && y0 == 1 && this.mem[2][x0] == null && this.mem[3][x0] == null) {possibile = true}
					}
			} else {
				var dy_verso = -1;
				if (dy*dy_verso == 2) {
					// muove di 2 solo da y0=6 e se le due celle davanti sono vuote
					if (dx == 0 && y0 == 6 && this.mem[5][x0] == null && this.mem[4][x0] == null) {possibile = true}
					}
			}

			if (dy*dy_verso == 1){
				if (dx == 0) {
					if (this.mem[y1][x1] == null){possibile = true;}
				} else if (abs(dx) == 1){
					if (this.mem[y1][x1] != null){possibile = true;}
				}
			}
		} else if (muovo[0] == RE) {
			if (abs(dx)<2 && abs(dy)<2) {possibile = true}
		} else if (muovo[0] == ALFIERE) {
			if (abs(dx) == abs(dy)){
				if (this.scacchi_libero(x0,y0,dx,dy)) {possibile = true}
			}
		} else if (muovo[0] == REGINA) {
			if (dx * dy * (abs(dx) - abs(dy))==0) {
				if (this.scacchi_libero(x0,y0,dx,dy)) {possibile = true}
			}
		}
		return possibile;
	},
	scacchi_scaccano: function (player){
		var scaccano = [];
		var il_re_x = 999;
		var il_re_y = 999;
		var verificare = [];
		var volta = 0;
		for (var idx_x = 0;idx_x < this.size; idx_x++){
			for (var idx_y = 0;idx_y < this.size; idx_y++){
				var pezzo = this.mem[idx_y][idx_x];
				var c1 = this.get_casella(idx_x,idx_y);
				c1.classList.remove('scaccano');
				if (pezzo != null){
					// var c1 = document.getElementById('c_'+idx_x+'_'+idx_y);
					c1.classList.remove('sotto_scacco');
					if (pezzo[1] == player){
						if (pezzo[0] == RE){
							il_re_x = idx_x;
							il_re_y = idx_y;
							console.log('il re '+player+ 'sta in x=',il_re_x,' y=',il_re_y);
							}
					} else {
					verificare.push([idx_x,idx_y]);
					console.log('verificare se il pezzo in x=',idx_x,' y=',idx_y,'lo può mangiare');
					}
				}
			}
		}
		console.log("verificare>")
		console.log(verificare)
		for (var guardo_n = 0; guardo_n < verificare.length; guardo_n++){
			var idx_x = verificare[guardo_n][0];
			var idx_y = verificare[guardo_n][1];

			if (this.scacchi_ipotesi(idx_x,idx_y, il_re_x, il_re_y) == true){
				console.log("this.scacchi_ipotesi(x0="+idx_x +",y0="+idx_y +", il_re_x="+ il_re_x +", il_re_y=" +il_re_y+ ") == true");
				var c1 = this.get_casella(idx_x, idx_y);
				c1.classList.add('scaccano');
				scaccano.push([idx_x, idx_y]);
			}
		}
	if (scaccano.length > 0){
		var c1 = this.get_casella(il_re_x, il_re_y);
		c1.classList.add('sotto_scacco');
	}
	return scaccano;
	},
	scacchi_libero: function (x0,y0,dx,dy){
		var volte = Math.max(abs(dx),abs(dy));
		for (var volta=1;volta<volte;volta++){
			var tester = [y0+dy*volta/volte,x0+dx*volta/volte]
			if (this.mem[tester[0]][tester[1]] != null) {
				console.log("occupato"+tester )
				return false;
			}
			}
		return true;
	}
}


// I18N

var i18n_diz = {
	'it':{},
	'en':{
		"Dama": "Draughts",
		"Giugno": "June",
		"Puzzle immagine": "Image Puzzle",
		"Puzzle numerico": "Numeric Puzzle",
		"Scacchi": "Chess",
		"Solitario della Bastiglia": "Peg Solitaire",
		"Solitario della Bastiglia Europeo":"European Peg Solitaire",
		"Scegliere il Gioco":"Select the Play",
		'Scegliere la pedina da muovere':'Select the piece you want to move'
		}
}

function i18n(txt,lang='en') {
	return i18n_diz[lang][txt];
	}

function span_i18n(lang='en'){
	console.log("traduco");
	var spans = document.evaluate('//span',document);
	var thisNode = spans.iterateNext();
	var cambiare = [];
  	while (thisNode) {
  		var txt = thisNode.firstChild.nodeValue;
  		i18n_diz['it'][txt] = txt; // find the text you need to translate
  		console.log(thisNode.firstChild);
  		cambiare.push(thisNode.firstChild);
  		thisNode = spans.iterateNext();
    }
    for (var x = 0; x < cambiare.length; x++){
    	cambiare[x].nodeValue = i18n_diz[lang][cambiare[x].nodeValue];
    	}
    console.log("you must translate");
    console.log(i18n_diz['it']);
}