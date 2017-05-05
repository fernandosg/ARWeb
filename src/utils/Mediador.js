/**
 * @file Mediador
 * @author Fernando Segura Gómez, Twitter: @fsgdev
 * @version 0.1
 */

 /**
  * Clase Mediador
  * @class
  * @constructor
 */
function Mediador(){
	this.lista_eventos={};
	this.lista_eventos_a_disparar={};
};


/**
 * @function suscribir
 * @summary Permite suscribir un evento a la escucha que el Mediador ocupara para comunicar a ciertos objetos que esten escuchando a dicho evento
 * @param {String} evento - El evento que el Mediador ocupara para comunicarse con el objeto añadido.
 * @param {Elemento} objeto - El objeto el cual puede tener comunicación con el Mediador con un evento especifico.
*/
Mediador.prototype.suscribir=function(evento,objeto,event){
	if(!this.lista_eventos[evento]) this.lista_eventos[evento]=[];
	if(this.lista_eventos[evento].indexOf(objeto)==-1){
		this.lista_eventos[evento].push(objeto);
		this.lista_eventos_a_disparar[objeto.get().id]=event;
	}
}


/**
 * @function comunicar
 * @summary Evento comunicar
 * @param {String} evento
 * @param {Elemento} objeto
 * @param {Function} callback
 * @param {extras} Object
*/
Mediador.prototype.comunicar=function(evento,params_for_event_to_dispatch,callback,stage){//Mediador.prototype.comunicar=function(evento,objeto,callback,stage){
	if(!this.lista_eventos[evento]) return;
	for(var i=0;i<this.lista_eventos[evento].length;i++){
		objeto_action=this.lista_eventos[evento][i];
		var new_params=params_for_event_to_dispatch.slice();
		new_params.push(objeto_action.get().getWorldPosition());
		callback.call(stage,this.lista_eventos_a_disparar[objeto_action.get().id].call(stage,new_params));
		//callback.call(stage,objeto_action.dispatch(objeto),objeto_action);

	}
}


/**
 * @function comunicarParticular
 * @summary Evento comunicar
 * @param {String} evento
 * @param {Elemento} objeto
 * @param {Function} callback
 * @param {extras} Object
*/
Mediador.prototype.comunicarParticular=function(evento,objeto,params_for_event_to_dispatch,callback){
	if(!this.lista_eventos[evento]) return;
	var pos=this.lista_eventos[evento].indexOf(objeto);
	if(pos==-1) return;
	var new_params=params_for_event_to_dispatch.slice();
	new_params.push(objeto.get().getWorldPosition());
	callback(this.lista_eventos_a_disparar[this.lista_eventos[evento][pos].get().id].call(this,new_params));
	//callback(this.lista_eventos[evento][pos].dispatch(compara),extras);
}


/**
 * @function baja
 * @summary Evento comunicar
 * @param {String} evento
 * @param {Elemento} objeto
*/
Mediador.prototype.baja=function(evento,objeto){
	if(this.lista_eventos[evento].indexOf(objeto)==-1) return;
	this.lista_eventos[evento].splice(this.lista_eventos[evento].indexOf(objeto),1);
}
module.exports=Mediador;
