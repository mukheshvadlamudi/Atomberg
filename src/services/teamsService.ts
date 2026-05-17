// The webhook URL is securely injected during build via environment variables
const TEAMS_WEBHOOK_URL = import.meta.env.VITE_TEAMS_WEBHOOK_URL || '';

interface TeamsParams {
  title: string;
  message: string;
  user?: string;
  statusColor?: 'Good' | 'Attention' | 'Warning' | 'Default';
}

export const sendTeamsNotification = async (params: TeamsParams) => {
  // We use Microsoft Adaptive Cards format
  const payload = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.2',
          body: [
            {
              type: 'TextBlock',
              size: 'Medium',
              weight: 'Bolder',
              text: 'AtomQuest Portal Alert',
              color: 'Accent'
            },
            {
              type: 'TextBlock',
              text: params.title,
              weight: 'Bolder',
              size: 'Large',
              color: params.statusColor || 'Default'
            },
            {
              type: 'TextBlock',
              text: params.message,
              wrap: true
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'User:', value: params.user || 'System' },
                { title: 'Time:', value: new Date().toLocaleString() }
              ]
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Open Portal',
              url: window.location.origin + window.location.pathname
            }
          ]
        }
      }
    ]
  };

  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('✅ Teams notification sent!', response.status);
    return true;
  } catch (err) {
    console.error('❌ Failed to send Teams notification:', err);
    return false;
  }
};
