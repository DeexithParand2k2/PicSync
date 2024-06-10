var fileUploadStatus = require('./state')

function printCurrentStatus() {
    const completed = fileUploadStatus.completed.length;
    const queued = fileUploadStatus.queued.length;
    const completedFromQueue = fileUploadStatus.completedFromQueue.length;
    const failed = fileUploadStatus.failed.length;

    // Calculate completion percentage
    const completionPercentage = queued > 0 ? ((completed / queued) * 100).toFixed(2) : 0;

    // Format the status message
    const statusMessage = `
*Current Upload Status*

- **Status**: \`${completionPercentage}\`% complete
- **Completed From Queue**: \`${completedFromQueue}\` completed from queue
- **Queued**: \`${queued}\`
- **Completed**: \`${completed}\`
- **Failed**: \`${failed}\`
    `;

    // Log the message to console
    console.log(statusMessage.trim());

    // Return the formatted message
    return statusMessage.trim();
}

module.exports = printCurrentStatus