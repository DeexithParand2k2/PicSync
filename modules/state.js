var fileUploadStatus = {
    queued : [], // contains all msg's image file names, and check if queue is empty
    completedFromQueue : [],  // when success push to queue
    completed : [], // if queue is empty -> empty completed from queue and update in completed, check if failed = completed and remove fails
    failed : [], // pushed failed ones here
    lastUploadedCount : 0, // in development
    botPausedQueue : [] // in development
}

// q -> completedFromQ -> when q is empty -> push to complete
// retry those in failed

module.exports = fileUploadStatus