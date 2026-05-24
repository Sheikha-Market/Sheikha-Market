// محرك عقود الفقه الإسلامي لمنظومة شيخة
class SheikhaFiqhContractsEngine {
    constructor() {
        this.contracts = {
            sale: this.saleContract,
            agency: this.agencyContract,
            murabaha: this.murabahaContract
        };
    }

    evaluate(contractType, data) {
        const handler = this.contracts[contractType];
        if (!handler) {
            return {
                allowed: false,
                error: 'UNKNOWN_CONTRACT'
            };
        }
        return handler(data);
    }

    saleContract(data) {
        if (!data.ownership) {
            return { allowed: false, reason: 'لا يملك السلعة' };
        }
        if (!data.consent) {
            return { allowed: false, reason: 'لا يوجد تراضي' };
        }
        return { allowed: true, type: 'sale' };
    }

    agencyContract(data) {
        if (!data.authorization) {
            return { allowed: false, reason: 'لا يوجد تفويض' };
        }
        return { allowed: true, type: 'agency' };
    }

    murabahaContract(data) {
        if (!data.cost || !data.profit) {
            return { allowed: false, reason: 'عدم وضوح الربح' };
        }
        return { allowed: true, type: 'murabaha' };
    }
}

const engine = new SheikhaFiqhContractsEngine();
module.exports = engine;
