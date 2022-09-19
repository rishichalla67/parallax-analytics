export const Notification = (username, msg, id, first) => {
    return {
        checked: false,
        message: msg,
        requesterID: id,
        username: username,
        firstName: first
    }
}