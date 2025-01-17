require("dotenv").config();

export const handler = async (event) => {

    const recipientNumber = 60102222965
    console.log(JSON.stringify({
        messaging_product: 'whatsapp',
        to: `${recipientNumber}`,
        type: 'text',
        text:{
            body:'Hello world!'
        }
    }))
    try{
        const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: `${recipientNumber}`,
                type: 'text',
                text:{
                    body:'Hello world!'
                }
            })
        })
        console.log(response)
    }
    catch(e){
        console.log(e)
    }

    return {
        statusCode: 123
    }
    
}