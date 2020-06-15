function abs(x){return Math.abs(x)}

const [DAMA, TORRE, CAVALLO,ALFIERE,REGINA,RE, PEDINA] = ['DAMA', 'TORRE', 'CAVALLO', 'ALFIERE', 'REGINA', 'RE','PEDINA'];

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
	simboli: {TORRE:'♜', CAVALLO:'♞', ALFIERE:'♝', RE:'♚', REGINA:'♛', PEDINA:'♙', DAMA:'◉'},
	init:function (gioco, options = {}){
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
			this.mossa_valida = this.mossa_valida_scacchi;
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
		if (t == 'win') {m1.innerHTML = "<b style='color:#FFFF00'>"+a+"<b>"};
		m1.style.display='block';
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
	disegna_casella: function (x,y){
		var c1 = document.getElementById('c_'+x+'_'+y);
		var i1 = chess.mem[y][x];
		if (i1 == null){
			c1.innerHTML = '';
		} else if (i1[0] == 'del'){
			c1.parentNode.removeChild(c1);
		} else {
			c1.innerHTML = chess.simboli[i1[0]];
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
		chess.cella_focus = document.getElementById('c_'+x+'_'+y);
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
					if (this.gioco == 'bastiglia') {
						if (this.quanti[this.turn_of] == 1) {
							this.msg('HAI VINTO!','win');
						}
					} else if (!(this.gioco == 'puzzle')) {
						this.turn_of = (this.turn_of == 'playerA') ? 'playerB' : 'playerA';
					}
					this.set_title();
				}
			}
		}
	},
	// - - - -  - - - -  - - - - fx specifiche per singolo gioco  - - - -  - - - -  - - - -
	dama_mossa_valida: function (x1, y1){
	var x0 = this.from[1] * 1;
	var y0 = this.from[0] * 1;
	var dx = this.from[1] - x1;
	var dy = this.from[0] - y1;
	if (this.turn_of == 'playerA') {dy *= -1}
	if (this.mem[y1][x1] != null) {return false;} // non posso mettere dove è occupato
	if (abs(dx) == 1 && dy == 1) {return true;}
	if (abs(dx) == 2 && dy == 2){
		var x_mangio = (x0/2 + x1/2);
		var y_mangio = (y0/2 + y1/2);
		console.log('x '+ x0 + ' this.from[1] '+ x1 + ' y '+ y0 + ' this.from[0] '+ y1);
		console.log('y_mangio '+y_mangio + ' x_mangio '+ x_mangio);
		var mangio = this.mem[y_mangio][x_mangio];
		if (mangio != null && mangio[1] != this.turn_of) {
			this.mem[y_mangio][x_mangio] = null;
			this.disegna_casella(x_mangio,y_mangio);
			return mangio};
		}
	return false;
	},
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
			if (this.puzzle_is_win()) {this.msg("Hai Vinto!",'win')}
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