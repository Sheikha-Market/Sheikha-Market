/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔮 خادم MCP لمنظومة الرؤية الشاملة - Sheikha Vision MCP Server
 *
 * تحليل متقدم متعدد الوكلاء مع تكامل الذكاء الاصطناعي
 * رقمنة مبنية على الكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError
} = require('@modelcontextprotocol/sdk/types.js');
const SheikhaVisionSystem = require('/workspaces/sheikha/sheikha-main-portal/lib/sheikha-vision-system.js');

class SheikhaVisionMCPServer {
    constructor() {
        this.visionSystem = new SheikhaVisionSystem();
        this.server = new Server(
            {
                name: 'sheikha-vision-mcp',
                version: '1.1.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.setupHandlers();
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'analyze_page',
                        description: 'Analyze a webpage HTML and extract structural, SEO, and risk insights.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                url: { type: 'string' },
                                htmlContent: { type: 'string' }
                            },
                            required: ['url', 'htmlContent']
                        }
                    },
                    {
                        name: 'analyze_image',
                        description: 'Analyze an image URL/data for OCR, objects, and quality signals.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                imageUrl: { type: 'string' },
                                imageData: { type: 'string' }
                            },
                            required: ['imageUrl']
                        }
                    },
                    {
                        name: 'analyze_video',
                        description: 'Analyze video metadata and extracted semantics.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                videoUrl: { type: 'string' },
                                metadata: { type: 'object' }
                            },
                            required: ['videoUrl']
                        }
                    },
                    {
                        name: 'generate_logic',
                        description: 'Generate logic, workflows, and APIs from a previously analyzed page.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                urlToAnalyze: { type: 'string' }
                            },
                            required: ['urlToAnalyze']
                        }
                    },
                    {
                        name: 'build_semantic_graph',
                        description: 'Build semantic graph from analyzed entities and relationships.',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    },
                    {
                        name: 'validate_islamic_compliance',
                        description: 'Run Islamic compliance checks for analyzed content.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                urlToValidate: { type: 'string' }
                            },
                            required: ['urlToValidate']
                        }
                    },
                    {
                        name: 'generate_comprehensive_report',
                        description: 'Generate a comprehensive report for all analyzed artifacts.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' }
                            },
                            required: []
                        }
                    },
                    {
                        name: 'get_vision_status',
                        description: 'Return current status and analysis counters for Sheikha Vision MCP.',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    }
                ]
            };
        });

        // 📊 تحليل الصفحات
        this.server.setRequestHandler(CallToolRequestSchema, async request => {
            if (request.params.name === 'analyze_page') {
                return await this.analyzePage(request.params.arguments);
            }
            if (request.params.name === 'analyze_image') {
                return await this.analyzeImage(request.params.arguments);
            }
            if (request.params.name === 'analyze_video') {
                return await this.analyzeVideo(request.params.arguments);
            }
            if (request.params.name === 'generate_logic') {
                return await this.generateLogic(request.params.arguments);
            }
            if (request.params.name === 'build_semantic_graph') {
                return await this.buildSemanticGraph(request.params.arguments);
            }
            if (request.params.name === 'validate_islamic_compliance') {
                return await this.validateIslamicCompliance(request.params.arguments);
            }
            if (request.params.name === 'generate_comprehensive_report') {
                return await this.generateComprehensiveReport(request.params.arguments);
            }
            if (request.params.name === 'get_vision_status') {
                return this.getVisionStatus();
            }

            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📋 معالجات الأدوات
    // ═══════════════════════════════════════════════════════════════════════════

    async analyzePage(args) {
        try {
            const { url, htmlContent } = args;

            if (!url || !htmlContent) {
                throw new Error('URL and htmlContent are required');
            }

            const analysis = await this.visionSystem.analyzePage(url, htmlContent);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                url,
                                analysis: {
                                    structure: analysis.structure,
                                    accessibility: analysis.accessibility,
                                    seo: analysis.seo,
                                    risks: analysis.risks,
                                    islamicScore: analysis.islamicCompliance?.score || 0
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async analyzeImage(args) {
        try {
            const { imageUrl, imageData } = args;

            if (!imageUrl) {
                throw new Error('imageUrl is required');
            }

            const analysis = await this.visionSystem.analyzeImage(imageUrl, imageData);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                url: imageUrl,
                                analysis: {
                                    extractedText: analysis.extractedText?.substring(0, 500),
                                    objectsCount: analysis.objects?.length || 0,
                                    qualityScore: analysis.qualityScore?.score || 0,
                                    colors: analysis.colors?.dominantColors || []
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async analyzeVideo(args) {
        try {
            const { videoUrl, metadata } = args;

            if (!videoUrl) {
                throw new Error('videoUrl is required');
            }

            const analysis = await this.visionSystem.analyzeVideo(videoUrl, metadata);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                url: videoUrl,
                                analysis: {
                                    duration: analysis.duration,
                                    keyFramesCount: analysis.keyFrames?.length || 0,
                                    transcriptLength: analysis.transcript?.length || 0,
                                    sentiment: analysis.sentiment?.overall
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async generateLogic(args) {
        try {
            const { urlToAnalyze } = args;

            const analysis = this.visionSystem.analysisModels.pages.get(urlToAnalyze);
            if (!analysis) {
                throw new Error(`No analysis found for ${urlToAnalyze}. Analyze the page first.`);
            }

            const logic = await this.visionSystem.generateLogic(analysis);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                source: urlToAnalyze,
                                logic: {
                                    entitiesCount: logic.entities?.length || 0,
                                    relationshipsCount: logic.relationships?.length || 0,
                                    workflowsCount: logic.workflows?.length || 0,
                                    apiEndpointsCount: logic.apiEndpoints?.length || 0,
                                    businessRulesCount: logic.businessRules?.length || 0,
                                    validationsCount: logic.validations?.length || 0
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async buildSemanticGraph(args) {
        try {
            const graph = await this.visionSystem.buildSemanticGraph();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                graph: {
                                    nodesCount: graph.nodes?.length || 0,
                                    edgesCount: graph.edges?.length || 0,
                                    clustersCount: graph.clusters?.length || 0,
                                    topicsExtracted: true
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async validateIslamicCompliance(args) {
        try {
            const { urlToValidate } = args;

            const analysis = this.visionSystem.analysisModels.pages.get(urlToValidate);
            if (!analysis) {
                throw new Error(`No analysis found for ${urlToValidate}`);
            }

            const validation = await this.visionSystem.validateIslamicCompliance(analysis);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                source: urlToValidate,
                                validation: {
                                    noHarm: validation.noHarm?.checks?.filter(c => c.passed).length,
                                    truthfulness: validation.truthfulness?.checks?.filter(
                                        c => c.passed
                                    ).length,
                                    justice: validation.justice?.checks?.filter(c => c.passed)
                                        .length,
                                    transparency: validation.transparency?.checks?.filter(
                                        c => c.passed
                                    ).length,
                                    complianceScore: validation.score,
                                    riskCount: validation.risks?.length || 0
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    async generateComprehensiveReport(args) {
        try {
            const report = await this.visionSystem.generateComprehensiveReport();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                report: {
                                    totalPages: report.summary.totalPages,
                                    totalImages: report.summary.totalImages,
                                    generatedAt: report.summary.generatedAt,
                                    topicsIdentified: Object.keys(report.topicsHierarchy).length,
                                    recommendationsCount: report.recommendations?.length || 0,
                                    semanticNodeCount: report.semanticGraph?.nodes?.length || 0
                                }
                            },
                            null,
                            2
                        )
                    }
                ]
            };
        } catch (error) {
            return this.errorResponse(error);
        }
    }

    getVisionStatus() {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: true,
                            status: {
                                system: 'operational',
                                version: this.visionSystem.version,
                                pagesAnalyzed: this.visionSystem.analysisModels.pages.size,
                                imagesAnalyzed: this.visionSystem.analysisModels.images.size,
                                agentsActive: Object.keys(this.visionSystem.agents).length,
                                islamicPrinciples: Object.values(
                                    this.visionSystem.islamicPrinciples
                                )
                            }
                        },
                        null,
                        2
                    )
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 أدوات مساعدة
    // ═══════════════════════════════════════════════════════════════════════════

    errorResponse(error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: false,
                            error: error.message || 'Unknown error occurred'
                        },
                        null,
                        2
                    )
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 تشغيل الخادم
    // ═══════════════════════════════════════════════════════════════════════════

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('[Sheikha Vision MCP] Started successfully');
    }
}

// تشغيل الخادم
const mcpServer = new SheikhaVisionMCPServer();
mcpServer.start().catch(console.error);
