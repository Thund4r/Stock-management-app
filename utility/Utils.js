export const factoryHttpRes = (statCode, success, message, error) => {
    return{
        statusCode: statCode,
        body: JSON.stringify({
            success: success,
            message: message,
            error: error
        })
    }
}
