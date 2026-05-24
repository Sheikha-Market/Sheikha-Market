'use strict';

const vscode = require('vscode');

class NeuralNetworkProvider {
    getChildren() {
        return [
            { label: 'التوحيد', description: 'الله وحده الخالق والرب والإله الحق' },
            { label: 'الحالة', description: 'ACTIVE' },
            { label: 'النمط', description: 'deterministic-governed-analysis' },
            { label: 'الخلايا', description: 'Root + Programming + Markup + Git + Industry' },
            { label: 'البرمجة', description: 'Sheikha Lang + PHP + Python + Java + Go + .NET' },
            { label: 'الترميز', description: 'HTML + XML + Markdown + JSON + YAML' }
        ];
    }

    getTreeItem(element) {
        return {
            label: element.label,
            description: element.description,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }
}

module.exports = NeuralNetworkProvider;
