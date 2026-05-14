const hsRuntimeRegistry = {
  meta: {
    system: 'SHEIKHA Global Trade Classification System',
    runtime: 'hs-runtime-layer',
    status: 'active'
  },
  chapters: [
    { code: '72', name: 'Iron and Steel', nameAr: 'الحديد والصلب' },
    { code: '74', name: 'Copper', nameAr: 'النحاس' },
    { code: '76', name: 'Aluminum', nameAr: 'الألمنيوم' },
    { code: '84', name: 'Machinery', nameAr: 'الآلات' },
    { code: '85', name: 'Electrical and Electronics', nameAr: 'الكهرباء والإلكترونيات' },
    { code: '87', name: 'Vehicles', nameAr: 'المركبات' },
    { code: '39', name: 'Plastics', nameAr: 'البلاستيك' },
    { code: '71', name: 'Precious Metals', nameAr: 'الذهب والمعادن الثمينة' }
  ],
  layers: [
    'hs-runtime-layer',
    'market-runtime-layer',
    'supply-chain-runtime-layer',
    'recycling-runtime-layer',
    'traceability-runtime-layer'
  ],
  strategicSources: [
    'mining',
    'extraction',
    'scrap',
    'dismantling',
    'recycling',
    'industrial-stock',
    'industrial-surplus'
  ]
};

module.exports = hsRuntimeRegistry;