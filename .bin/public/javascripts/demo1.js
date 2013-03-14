/**
 * @author Astroinist
 */
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var VIEW_ANGLE = 25,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 1,
	FAR = 10000;
	

var renderer = new THREE.WebGLRenderer();

var camera =
  new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);
    
var scene = new THREE.Scene();
var group = new THREE.Object3D(),
	solar = new THREE.Object3D();
	
	scene.add(solar);
	camera.position.z = 5000;
	camera.position.y = 4000;
	
	renderer.setSize(WIDTH,HEIGHT);

	var $container = $('body');
	$container.append(renderer.domElement);
	
    // 创建球体的材质
	var shadowTexture = THREE.ImageUtils.loadTexture('images/normal.jpg');
	var sphereMaterial =new THREE.MeshBasicMaterial( { map: shadowTexture, overdraw: true } );
	    
    	//设置球体变量
	var radius = 25,
	    segments = 100,
	    rings = 50;
	var geometry =  new THREE.SphereGeometry(
		    radius,
		    segments,
		    rings);
	var sphere = new THREE.Mesh(geometry,sphereMaterial);
//	sphere.rotation.y = 0;
//  	sphere.rotation.x = Math.PI / 90;
  	group.add(sphere);
  	
	var moonTexture = THREE.ImageUtils.loadTexture('images/moon_1024.jpg');
	var moonMaterial =new THREE.MeshBasicMaterial( { map: moonTexture, overdraw: true } );
	var moonGeometry = new THREE.SphereGeometry(10,100,50);
	var moon = new THREE.Mesh(moonGeometry,moonMaterial);
  	moon.position.x = 65;
  	moon.position.y = 0;
  	moon.position.z = 0;
  	group.add(moon);
  	group.position.z = 2000;
  	solar.add(group);
  	
	var sunTexture = THREE.ImageUtils.loadTexture('images/fire.jpg');
	var sunMaterial =new THREE.MeshBasicMaterial( { map: sunTexture, overdraw: true } );
	var sunGeometry = new THREE.SphereGeometry(250,100,50);
	var sun = new THREE.Mesh(sunGeometry,sunMaterial);
  	sun.position.x = 65;
  	sun.position.y = 50;
  	sun.position.z = 0;
  	solar.add(sun);
//  	scene.add(sun);
  	
	particleLight = new THREE.Mesh( new THREE.SphereGeometry( 10,20, 20 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	solar.add( particleLight );
	particleLight.position.x = 500;
	particleLight.position.z = 1000;
	
  // 创建点光源
	var pointLight =new THREE.PointLight(0xFFFFFF,2, 800);
	
	// 设置光源位置
	pointLight.position.x = -1;
	pointLight.position.y = 0;
	pointLight.position.z = 500;
	
	pointLight.position.normalize();
	
	// 添加至场景
	scene.add(pointLight); 
    
//	group.rotation.y = 0;
//	group.rotation.x = Math.PI / 90;
//	group.rotation.z = 0;
	group.position.x = -100;
	renderer.render(scene, camera);
	
	var hotline = io.connect('ws://localhost:3000');
	hotline.on('sSayhello',function(msg){
		render(msg.timeStr);
	});
	// animate();
	function animate() {

		requestAnimationFrame( animate );

		render();
	}
	function render(serverTime) {

		var timer = (serverTime||Date.now()) * 0.00025;
		
//		camera.position.x += (camera.position.x ) * 0.05;
//		camera.position.y += (camera.position.y ) * 0.05;
//		camera.position.z -= 2;
		camera.lookAt( solar.position );

		group.rotation.y -= Math.PI / 260;
		sphere.rotation.y -= Math.PI / 180;
		
		moon.rotation.y +=Math.PI / 60;
		
		sun.rotation.x = Math.sin( timer * 7 );
		sun.rotation.y = Math.sin( timer * 7 );
		sun.rotation.z = Math.cos( timer * 3 );
		
		solar.rotation.y += Math.PI / 1800;
		particleLight.position.x = Math.sin( timer * 7 ) * 100;
		particleLight.position.y = Math.cos( timer * 5 ) * 60;
		particleLight.position.z = Math.cos( timer * 3 ) * 100;
		
		renderer.render( scene, camera );

	}