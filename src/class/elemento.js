/**
 * @file Elemento
 * @author Fernando Segura Gómez, Twitter: @fsgdev
 * @version 0.1
 */
 /**
  * Clase Elemento
  * @class Elemento
  * @constructor
  * @param {integer} width_canvas - El ancho del canvas que se agrego al documento HTML
  * @param {integer} height_canvas - El alto del canvas que se agrego al documento HTML.
  * @param {THREE.Geometry} geometry - Instancia de una geometria para el objeto generado.
 */
import PositionUtil from "../utils/position_util.js";
class Elemento{
  constructor(width_canvas,height_canvas,geometry){
    this.width=width_canvas;
    this.height=height_canvas;
    this.geometry=geometry,this.origen=new THREE.Vector2(),this.cont=0,this.estado=true,this.escalas=new THREE.Vector3(),this.posiciones=new THREE.Vector3();
    this.callbacks=[];
    this.position_util=new PositionUtil();
  }

  cambiarUmbral(escala){
      this.umbral_colision=this.width/4;
  }

  next(callback){
      this.callbacks.push(callback);
  }

  /**
   * @function init
   * @memberof Elemento
   * @summary Inicializa el objeto raiz (la instancia de THREE.Object3D), la geometria de la superficie trasera del objeto, y una utilidad para descargar una textura sobre el objeto
  */
  init(){
      this.elemento_raiz=new THREE.Object3D();
      this.geometria_atras=this.geometry.clone();
      this.textureLoader = new THREE.TextureLoader();
      this.cambiarUmbral(1);
      this.checkingcalls=setInterval(this.iterateCalls.bind(this),1500);
  }

  iterateCalls(){
      if(this.elemento_raiz!=undefined){
          if(this.elemento_raiz.children.length>0){
              while(this.callbacks.length>0){
                  this.callbacks[0]();
                  this.callbacks.pop();
              }
              clearInterval(this.checkingcalls);
          }
      }
  }

  /**
   * @function etiqueta
   * @memberof Elemento
   * @summary Permite definir una etiqueta al objeto (es un string que identifica este de otros objetos)
   * @param {String} etiqueta - String representando la etiqueta del objeto.
  */
  label(etiqueta){
      this.nombre=etiqueta
  }

  /**
   * @function calculoOrigen
   * @memberof Elemento
   * @summary Se calcula la posicion del centro en X,Y y Z del objeto
  */
  calculoOrigen(){
      this.x=(this.posiciones.x+(this.width/2));
      this.y=(this.posiciones.y+(this.height/2));
      this.z=this.posiciones.z;
  }

  /**
   * @function defineSurfaceByColor
   * @memberof Elemento
   * @summary Permite definir la superficie del objeto con un color.
   * @param {THREE.Color} color - Una instancia de THREE.Color
  */
  defineSurfaceByColor(color){
      let color_t=new THREE.Color(color);
      this.material_frente=new THREE.MeshBasicMaterial({color: color_t,side: THREE.DoubleSide});
      this.mesh=new THREE.Mesh(this.geometry,this.material_frente);
      this.elemento_raiz.add(this.mesh);
  }

  /**
   * @function changeMaterial
   * @memberof Elemento
   * @summary Permite cambiar el material del objeto
   * @param {Object} configuration - Objeto con 2 propiedades, 1) properties, 2) callback.
   * 1) properties.- Un objeto con 2 propiedades, puede ser: 1) Color.- Un color en hexadecimal. 2) Imagen.- La ruta absoluta de un recurso gráfico (imagen) a utilizar. Estas dos propiedades se usarán para crear una textura a usar en el material.
   * 2) callback.- En esta propiedad se define una función usada como callback, una vez que se genero la textura (si es que el objeto configuration se le definió una propiedad "properties"), se le pasará como parámetro a esta función.
   * Dentro del callback se podrá definir que tipo de material se desea crear, retornando la instancia de Material en la función.
   * Si no se definió un valor de retorno, se mantendrá el material definido en el objeto.
  */
  changeMaterial(configuration){
    var material;
    if(configuration.hasOwnProperty("properties")){
      if(configuration["properties"].hasOwnProperty("imagen")){
        this.textureLoader.load(configuration["properties"]["imagen"],function(textura){
          configuration["imagen"]=textura;
          if(configuration.hasOwnProperty("callback"))
            material=configuration["callback"](configuration["properties"]);
        })
      }else if(configuration["properties"].hasOwnProperty("color")){
        if(configuration.hasOwnProperty("callback"))
          material=configuration["callback"](configuration["properties"]);
      }
    }else{
      if(configuration.hasOwnProperty("callback"))
        material=configuration["callback"](configuration["properties"]);
    }
    if(material!=undefined && (material instanceof THREE.Material)){
      if(this.elemento_raiz.children>1)
        removeMultipleChildrens(1);
      this.mesh.material=material;
      this.mesh.material.needsUpdate=true;
    }
    return this;
  }


  /**
   * @function changeGeometry
   * @memberof Elemento
   * @summary Permite cambiar la geometria del objeto
   * @param {Object} callback.- Dentro del callback se podrá definir que tipo de geometria se desea crear, retornando la instancia de THREE.Geometry en la función.
   * Si no se definió un valor de retorno, se mantendrá la geometria definido en el objeto.
  */
  changeGeometry(callback=null){
    if(callback==null)
      return this;
    var new_geometry=callback();
    if(new_geometry instanceof THREE.Geometry){
      this.removeMultipleChildrens(0);
      this.mesh=new THREE.Mesh(new_geometry,this.mesh.material);
      this.elemento_raiz.add(this.mesh);
    }
    return this;
  }

  /**
  * @function removeMultipleChildrens
  * @memberof Elemento
  * @summary Permite eliminar todos los hijos del elemento raiz (instancia de THREE.Object3D que se usa como agrupador).
  * @param {Integer} startPosition - Valor entero para indicar a partir de que hijo se desea eliminar. Por default es 0, pero su uso es para prevenir a partir de que hijo se desea eliminar
  */
  removeMultipleChildrens(startPosition=0){
    for(var i=startPosition,length=this.elemento_raiz.children.length;i<length;i++){
      this.elemento_raiz.remove(this.elemento_raiz.children[i]);
    }
  }

  /**
   * @function actualizarMaterialAtras
   * @memberof Elemento
   * @summary Permite definir la superficie trasera del objeto.
   * @param {THREE.Texture} texture2 - La textura a definir en la parte de atras del objeto
  */
  actualizarMaterialAtras(texture2){
      this.textura_atras = texture2.clone();
      this.textura_atras.minFilter = THREE.LinearFilter;
      this.textura_atras.magFilter = THREE.LinearFilter;
      this.material_atras=new THREE.MeshBasicMaterial({map:this.textura_atras});
      this.material_atras.transparent=true;

      this.geometria_atras.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) );
      this.mesh2=new THREE.Mesh(this.geometria_atras,this.material_atras);
      this.elemento_raiz.add(this.mesh2);
      this.textura_atras.needsUpdate = true;
  }

  /**
   * @function actualizarMaterialFrente
   * @memberof Elemento
   * @summary Permite definir la superficie de enfrente del objeto.
   * @param {THREE.Texture} texture1 - La textura a definir en la parte de enfrente del objeto
  */
  actualizarMaterialFrente(texture1){
      this.textura_frente = texture1.clone();
      this.textura_frente.minFilter = THREE.LinearFilter;
      this.textura_frente.magFilter = THREE.LinearFilter;
      this.material_frente=new THREE.MeshBasicMaterial({map:this.textura_frente,side: THREE.DoubleSide});
      this.material_frente.transparent=true;
      this.mesh=new THREE.Mesh(this.geometry,this.material_frente);
      this.elemento_raiz.add(this.mesh);
      this.textura_frente.needsUpdate = true;
  }

  defineSurfaceByResource(frontal,trasera){
      this.textureLoader.load( frontal, function(texture1) {
          this.actualizarMaterialFrente(texture1);
          if(trasera!=undefined){
            this.textureLoader.load(trasera, function(texture2) {
                this.actualizarMaterialAtras(texture2);
            }.bind(this));
          }
      }.bind(this));
  }

  /**
   * @function get
   * @summary Permite definir el objeto THREE.Object3D del elemento
   * @returns {THREE.Object3D}
  */
  get(){
      return this.elemento_raiz;
  }

  /**
   * @function actualizarMedidas
   * @memberof Elemento
   * @summary Permite definir las dimensiones del elemento
  */
  actualizarMedidas(){
      this.width=this.width*this.elemento_raiz.scale.x;
      this.height=this.height*this.elemento_raiz.scale.y;
      this.cambiarUmbral(1);
  }

  /**
   * @function scale
   * @memberof Elemento
   * @summary Permite escalar las medidas de un objeto
   * @param {Double} x - Un valor con punto decimal el cual sirve para definir a que valor se tiene que escalar el elemento_raiz en X
   * @param {Double} y - Un valor con punto decimal el cual sirve para definir a que valor se tiene que escalar el elemento_raiz en y
  */
  scale(x,y){
      this.elemento_raiz.scale.x=x;
      this.elemento_raiz.scale.y=y;
      //actualizarMedidas();
  }

  /**
   * @function position
   * @memberof Elemento
   * @summary Permite definir la posicion de un elemento
  */
  position(pos){
      for(let prop in pos){
          this.elemento_raiz.position[prop]=pos[prop]
      }
      this.x=pos.x;
      this.y=pos.y;
      this.posiciones=this.elemento_raiz.position;
  }

  rotation(pos){
      for(let prop in pos){
          this.elemento_raiz.rotation[prop]=pos[prop]
      }
  }

  quaternion(pos){
      for(let prop in pos){
          this.elemento_raiz.rotation[prop]=pos[prop]
      }
  }

  increase(pos){
      for(let prop in pos){
          this.elemento_raiz.position[prop]+=pos[prop]
      }
      this.x=pos.x;
      this.y=pos.y;
      this.posiciones=this.elemento_raiz.position;
  }

  visible(){
      this.elemento_raiz.visible=true;
  }

  actualizar(){
      for(let i=0;i<this.elemento_raiz.children.length;i++){
          if(this.elemento_raiz.children[i].material.map)
              this.elemento_raiz.children[i].material.map.needsUpdate=true;
      }
      if(this.x!=this.elemento_raiz.position.x ||this.y!=this.elemento_raiz.position.y){
          this.x=this.elemento_raiz.position.x;
          this.y=this.elemento_raiz.position.y;
          this.posiciones.x=this.elemento_raiz.position.x;
          this.posiciones.y=this.elemento_raiz.position.y;
          this.posiciones.z=this.elemento_raiz.position.z;
          calculoOrigen();
      }
  }

  dispatch(mano){
      return this.position_util.estaColisionando(this.get().getWorldPosition(),mano.getWorldPosition());
  }

  abajoDe(puntero){
      let aument=(arguments.length>1) ? arguments[1] : 0;
       return ((this.box.max.x+aument>=puntero.getWorldPosition().x && (this.box.min.x)<=puntero.getWorldPosition().x)
          && (this.box.min.y<puntero.getWorldPosition().y))
  }

  colisiona(mano){
      let distancia=this.position_util.getDistancia(mano.getWorldPosition(),this.get().getWorldPosition());
      return distancia>0 && distancia<=43;//return medidas1.distanceTo(medidas2);
  }

  getLabel(){
      console.log(this.nombre);
  }

  getGradosActual(){
      return this.cont;
  }

  rotarY(grados){
      this.elemento_raiz.rotation.y=grados;
  }

  incrementGrados(){
      this.cont++;
  }

  decrementGrados(){
      this.cont--;
  }


  turnState(){
      this.estado=(this.estado) ? false : true;
  }

  setState(state){
    this.estado=state;
  }

  getState(){
    return this.estado;
  }

  getNombre(){
      return this.nombre;
  }

  esParDe(objeto){
      return this.getNombre()==objeto.getNombre() && this.elemento_raiz.id!=objeto.get().id;
  }

  igualA(objeto){
      return this.elemento_raiz.id==objeto.get().id;
  }
}
export { Elemento as default}
