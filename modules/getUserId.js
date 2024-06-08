function getUserId(msg) {
    const genId = {
        first_name: msg.from.first_name,
        last_name: msg.from.last_name
    }

    return genId.first_name + (genId.last_name ? " " + genId.last_name : "")
}

module.exports = getUserId