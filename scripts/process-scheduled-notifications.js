const fetch = require('node-fetch');

async function processScheduledNotifications() {
    console.log('🔄 Checking for scheduled notifications...\n');

    try {
        const response = await fetch('http://localhost:3000/api/cron/process-scheduled-notifications');
        const data = await response.json();

        if (data.success) {
            console.log('✅ Success!');
            console.log(`📊 Processed ${data.processed} campaign(s)\n`);

            if (data.details && data.details.length > 0) {
                console.log('📋 Details:');
                data.details.forEach((campaign, index) => {
                    console.log(`\n${index + 1}. ${campaign.title || campaign.id}`);
                    console.log(`   Status: ${campaign.status}`);
                    if (campaign.results) {
                        console.log(`   Sent: ${campaign.results.pushSentCount} push, ${campaign.results.notificationCount} in-app`);
                    }
                    if (campaign.error) {
                        console.log(`   Error: ${campaign.error}`);
                    }
                });
            } else {
                console.log('ℹ️  No scheduled campaigns were due at this time.');
            }
        } else {
            console.log('❌ Error:', data.error || data.message);
            if (data.details) {
                console.log('📝 Details:', data.details);
            }
            if (data.stack) {
                console.log('🔍 Stack trace:');
                console.log(data.stack);
            }
        }
    } catch (error) {
        console.error('❌ Failed to process notifications:', error.message);
    }
}

processScheduledNotifications();
