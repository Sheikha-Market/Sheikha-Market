'use strict';

function gardensScene() {
  return {
    system:'SHEIKHA_GARDENS_SPATIAL_SCENE_V1',
    sceneType:'WORLDLY_ENGINEERING_DIGITAL_TWIN',
    visuallyDynamic:true,
    aliveOrConsciousClaim:false,
    entities:[
      {type:'terrain',role:'topography'},
      {type:'water',role:'irrigation-and-flow'},
      {type:'plant-geometry',role:'rows-and-canopies'},
      {type:'weather-layer',role:'observed-or-user-supplied-parameters'},
      {type:'sensor-overlay',role:'soil-water-temperature-if-supplied'}
    ],
    forbidden:['people','animals','faces','identity-simulation','afterlife-simulation','unseen-as-fact'],
    integrations:['SHEIKHA_GARDENS_SPATIAL_TWIN','SHEIKHA_FARMS_SPATIAL_TWIN','SHEIKHA_PASTURES_SPATIAL_TWIN']
  };
}

function earthSkyScene() {
  return {
    system:'SHEIKHA_EARTH_SKY_SCIENCE_SCENE_V1',
    scope:['observed-earth','observed-sky','geometry','coordinates','mathematical-models'],
    output:['maps','charts','orbits-as-parameterized-math','terrain','sky-domes','scientific-diagrams'],
    unseenClaim:false,
    futurePredictionClaim:false,
    afterlifeSimulation:false,
    note:'deterministic calculations from supplied/measured parameters are calculations, not claims of unseen knowledge'
  };
}

module.exports={gardensScene, earthSkyScene};
