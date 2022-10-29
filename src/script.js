import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

// Post Processing
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';

let camera, scene, renderer,
light1, light2, light3, light4, light5, light6, light7,
object, stats, controls, composer, renderPass, bloomPass, glitchPass;

let clock = new THREE.Clock();

let SEPARATION = 50, AMOUNTX = 50, AMOUNTY = 100;

let particles, count = 0;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.x = 0;
    camera.position.y = 25;
    camera.position.z = 165;
    scene = new THREE.Scene();

//

    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array( numParticles * 3 );
    const scales = new Float32Array( numParticles );

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

            positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
            positions[ i + 1 ] = -20; // y
            positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

            scales[ j ] = 1;

            i += 3;
            j ++;

        }

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

    const material = new THREE.ShaderMaterial( {

        uniforms: {
            color: { value: new THREE.Color( 0xaaaaaa ) },
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent

    } );

    //

    particles = new THREE.Points( geometry, material );
    scene.add( particles );

    //model

    var loader = new OBJLoader();
    loader.load( 'https://simonbermudez.com/logo/models/sb.obj', function ( obj ) {

        object = obj;
        object.scale.multiplyScalar( 500 );
        object.position.y = 0;
        scene.add( object );

    } );

    var sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );

    // /* floor  */    
    // const helper = new THREE.GridHelper( 1000, 40, 0x303030, 0x303030 );
    // helper.position.y = - 25;
    // scene.add( helper );


    //lights

    light1 = new THREE.PointLight( 0xff0040, 2, 50 );
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    scene.add( light1 );

    light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
    light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    scene.add( light2 );

    light3 = new THREE.PointLight( 0x80ff80, 2, 50 );
    light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    scene.add( light3 );

    light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
    light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    scene.add( light4 );

    light5 = new THREE.PointLight( 0xd400ff, 2, 50 );
    light5.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xd400ff } ) ) );
    scene.add( light5 );

    light6 = new THREE.PointLight( 0x00ddff, 2, 50 );
    light6.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x00ddff } ) ) );
    scene.add( light6 );

    light7 = new THREE.PointLight( 0xffffff, 2, 50 );
    // light7.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
    scene.add( light7 );

    //renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    // Post Processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    
    const params = {
        shape: 1,
        radius: 4,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 1,
        blendingMode: 1,
        greyscale: false,
        disable: false
    };

    bloomPass = new UnrealBloomPass( 
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,
        0.1,
        0.5
    );

    glitchPass = new GlitchPass();
    
    const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );
    
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
	composer.addPass(glitchPass);

    
    setTimeout(() => composer.removePass(glitchPass), 2000)
    // composer.addPass( halftonePass );


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {


    
    requestAnimationFrame( animate );
    
    // stats.update();
    render();
}

function render() {

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta();

    if( object ) object.rotation.y -= 0.5 * delta;

    light1.position.x = Math.sin( time * 0.7 ) * 30;
    light1.position.y = Math.cos( time * 0.5 ) * 50;
    light1.position.z = Math.cos( time * 0.3 ) * 30;

    light2.position.x = Math.cos( time * 0.3 ) * 30;
    light2.position.y = Math.sin( time * 0.5 ) * 50;
    light2.position.z = Math.sin( time * 0.7 ) * 30;

    light3.position.x = Math.sin( time * 0.7 ) * 30;
    light3.position.y = Math.cos( time * 0.3 ) * 50;
    light3.position.z = Math.sin( time * 0.5 ) * 30;

    light4.position.x = Math.sin( time * 0.3 ) * 30;
    light4.position.y = Math.cos( time * 0.7 ) * 50;
    light4.position.z = Math.sin( time * 0.5 ) * 30;

    light5.position.x = Math.sin( time * 0.1 ) * 30;
    light5.position.y = Math.cos( time * 0.2 ) * 50;
    light5.position.z = Math.sin( time * 0.3 ) * 30;

    light6.position.x = Math.sin( time * 0.4 ) * 30;
    light6.position.y = Math.cos( time * 0.5 ) * 50;
    light6.position.z = Math.sin( time * 0.6 ) * 30;


    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

            positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 10 ) +
                            ( Math.sin( ( iy + count ) * 0.5 ) * 10 );

            scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 10 +
                            ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 10;

            i += 3;
            j ++;

        }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    particles.position.y = -20 

    renderer.render( scene, camera );

    composer.render()
    count += 0.1;

}

window.addEventListener('resize', function(event){
    onWindowResize()
});