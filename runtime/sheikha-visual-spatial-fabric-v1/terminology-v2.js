'use strict';

const PREFERRED_TERMS = Object.freeze({
  stillArtifact: 'رسم/أثر مرئي رقمي',
  creation: 'إنشاء مرئي',
  processing: 'معالجة مرئية',
  render: 'إخراج رسومي',
  frame: 'إطار مرئي',
  scene: 'مشهد رسومي',
  model3d: 'مجسم ثلاثي الأبعاد',
  animation: 'حركة رسومية',
  video: 'فيديو/تتابع إطارات مرئية',
  spatialTwin: 'توأم هندسي رقمي',
  dreamStyle: 'حلم رسومي خيالي — بلا دلالة غيبية أو تنبؤ'
});

const DIMENSIONS = Object.freeze({
  '2D': { axes:['x','y'], meaning:'رسم مستوٍ', physicalSpatialDimensionsClaim:2 },
  '3D': { axes:['x','y','z'], meaning:'تجسيد هندسي ثلاثي الأبعاد', physicalSpatialDimensionsClaim:3 },
  '4D': {
    axes:['x','y','z','t'],
    meaning:'مجسم ثلاثي الأبعاد مع الزمن/الحركة',
    physicalSpatialDimensionsClaim:3,
    fourthAxis:'time'
  },
  '5D': {
    axes:['x','y','z','t','p'],
    meaning:'3D + زمن + قناة معلمة/حالة/بيانات محكومة',
    physicalSpatialDimensionsClaim:3,
    fifthAxis:'parameter_or_state',
    note:'اصطلاح حاسوبي بارامتري داخل شيخة، وليس ادعاء خمس أبعاد مكانية فيزيائية.'
  }
});

const SEMANTIC_BOUNDARY = Object.freeze({
  system:'SHEIKHA_DRAWING_NOT_LIFE_SEMANTIC_BOUNDARY_V1',
  digitalArtifactsOnly:true,
  livingClaimForbidden:true,
  consciousnessClaimForbidden:true,
  revivalClaimForbidden:true,
  createdArtifactCanBeAlive:false,
  createdArtifactCanBeConscious:false,
  createdArtifactCanReviveLife:false,
  preferredSurfaceTerms:[
    'رسم','جرافكس','تجسيد','مجسم','مشهد','فيديو',
    'حركة رسومية','خيال رسومي','حلم رسومي'
  ]
});

module.exports={PREFERRED_TERMS,DIMENSIONS,SEMANTIC_BOUNDARY};
