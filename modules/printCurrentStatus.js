var fileUploadStatus = require('./state')

function printCurrentStatus() {
    const completed = fileUploadStatus.completed.length;
    const queued = fileUploadStatus.queued.length;
    const completedFromQueue = fileUploadStatus.completedFromQueue.length;
    const failed = fileUploadStatus.failed.length;
    const recentlyUploaded = fileUploadStatus.lastUploadedCount

    // Calculate completion percentage
    const completionPercentage = queued > 0 ? ((completedFromQueue / queued) * 100).toFixed(2) + "%" : "Nothing In Queue";

    // Define the width for the label part to ensure alignment
    const labelWidth = 20;

    // Function to format the line with proper padding
    function formatLine(label, value) {
        return `${label.padEnd(labelWidth)}: ${value}`;
    }
    
    const statusMessage = `Stats
            Current Upload Status

${formatLine('Status', completionPercentage===`100.00%`?`100.00%`:completionPercentage)}
${formatLine('Queued', queued)}
${formatLine('Complete Queued', completedFromQueue)}
${formatLine('Recently Uploaded', recentlyUploaded)}
${formatLine('Completed Files', completed)}
${formatLine('Failed', failed)}
`;
    
    // Return the formatted message
    return statusMessage.trim();
}

module.exports = printCurrentStatus