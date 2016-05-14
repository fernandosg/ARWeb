function Manejador(){
	this.lista_eventos={};
};

Manejador.prototype.suscribir=function(evento,objeto){
	if(!this.lista_eventos[evento]) this.lista_eventos[evento]=[];
	if(this.lista_eventos[evento].indexOf(objeto)==-1){
		this.lista_eventos[evento].push(objeto);
	}		
}

Manejador.prototype.disparar=function(evento,objeto,callback,extras){
	if(!this.lista_eventos[evento]) return;			
	extras["manejador"]=this;
	for(var i=0;i<this.lista_eventos[evento].length;i++){
		//this.lista_eventos[evento][i].dispatch(objeto);
		objeto_action=this.lista_eventos[evento][i];		
		callback(objeto_action.dispatch(objeto),objeto_action,extras);
	}
}

Manejador.prototype.baja=function(evento,objeto){
	if(this.lista_eventos[evento].indexOf(objeto)==-1) return;
	this.lista_eventos[evento].splice(this.lista_eventos[evento].indexOf(objeto),1);	
}
module.exports=Manejador;