const ResponseMessageServer = ( status, message, res) => {
    res.status(status).json({
        "message": message
    })
}

module.exports = ResponseMessageServer