'use strict';

const {DIMENSIONS}=require('./terminology-v2');

function normalizeDimension(d){
  const key=String(d||'3D').trim().toUpperCase();
  if(!DIMENSIONS[key]) throw new Error('UNSUPPORTED_DIMENSION_PROFILE');
  return DIMENSIONS[key];
}

function makeSceneDescriptor({dimension='3D',kind='geometry',motion=false,parameter=null}={}){
  const key=String(dimension||'3D').toUpperCase();
  const profile=normalizeDimension(key);
  return {
    system:'SHEIKHA_DRAWING_DIMENSION_SCENE_DESCRIPTOR_V1',
    dimension:key,
    profile,
    kind,
    motion:Boolean(motion || profile.fourthAxis==='time'),
    parameterChannel:profile.fifthAxis ? (parameter || 'state') : null,
    isDrawing:true,
    preferredConcept:'DRAWING_GRAPHICS_EMBODIMENT',
    isPhotographyConcept:false,
    livingOrConscious:false,
    canReviveLife:false
  };
}

function square(side=1){
  side=Number(side);
  if(!Number.isFinite(side)||side<=0) throw new Error('INVALID_SIDE');
  return {
    system:'SHEIKHA_GEOMETRIC_DRAWING_SQUARE_V1',
    kind:'square',
    side,
    vertices:[[0,0],[side,0],[side,side],[0,side]],
    perimeter:4*side,
    area:side*side,
    concept:'GEOMETRIC_DRAWING'
  };
}

function house(width=8,depth=10,height=3,roof=2){
  [width,depth,height,roof]=[width,depth,height,roof].map(Number);
  if([width,depth,height,roof].some(v=>!Number.isFinite(v)||v<=0)) throw new Error('INVALID_HOUSE_DIMENSION');
  return {
    system:'SHEIKHA_GEOMETRIC_DRAWING_HOUSE_V1',
    kind:'house-geometric-model',
    dimensions:{width,depth,height,roof},
    baseArea:width*depth,
    approximateEnvelopeVolume:width*depth*height + (width*depth*roof/2),
    concept:'ARCHITECTURAL_DRAWING_AND_EMBODIMENT'
  };
}

module.exports={normalizeDimension,makeSceneDescriptor,square,house};
