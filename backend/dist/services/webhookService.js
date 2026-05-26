"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
class WebhookService {
    static async triggerPowerAutomate(action, initiative, comments) {
        console.log(`[POWER AUTOMATE WEBHOOK] Action: "${action}" triggered for Initiative ${initiative.request_number}`);
        console.log(`[POWER AUTOMATE WEBHOOK] Data payload dispatched to Flow URL: http://mock-azure-logicapp.local/workflows/...`);
        console.log(`[POWER AUTOMATE WEBHOOK] Payload:`, {
            initiative_id: initiative.id,
            request_number: initiative.request_number,
            name: initiative.name,
            current_status: initiative.status,
            actor_email: initiative.owner_email,
            action_timestamp: new Date().toISOString(),
            comments: comments || 'No comments provided'
        });
        // Simulating the M365 Adaptive Card payload that Power Automate would send to Microsoft Teams
        this.simulateTeamsAdaptiveCard(action, initiative, comments);
    }
    static simulateTeamsAdaptiveCard(action, initiative, comments) {
        console.log(`[MICROSOFT TEAMS INTEGRATION] Sending Adaptive Card notification...`);
        const adaptiveCard = {
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": [
                {
                    "type": "TextBlock",
                    "text": `🔔 IDM Governance Workflow Update: ${action}`,
                    "weight": "Bolder",
                    "size": "Medium",
                    "color": "Accent"
                },
                {
                    "type": "FactSet",
                    "facts": [
                        { "title": "Initiative Number:", "value": initiative.request_number },
                        { "title": "Title:", "value": initiative.name },
                        { "title": "Strategic Pillar:", "value": initiative.alignment_strategy },
                        { "title": "Estimated Budget:", "value": `R ${initiative.budget_estimate.toLocaleString()}` },
                        { "title": "Assigned Owner:", "value": `${initiative.owner_name} (${initiative.owner_email})` },
                        { "title": "Target State:", "value": initiative.status }
                    ]
                },
                {
                    "type": "TextBlock",
                    "text": `**Action Remarks**: ${comments || 'N/A'}`,
                    "wrap": true
                }
            ],
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "Open IDM Portal",
                    "url": `http://localhost:3000/initiatives/${initiative.id}`
                }
            ]
        };
        console.log(`[MICROSOFT TEAMS ADAPTIVE CARD JSON]:\n`, JSON.stringify(adaptiveCard, null, 2));
    }
}
exports.WebhookService = WebhookService;
