export const handler = async (event) => {
    const payload = JSON.parse(event.body);
    const recipientNumber = payload.Phone;

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
                type: 'template',
                template:{
                    name: 'order_confirmation',
                    language: {
                        code: 'en'
                    },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'text',
                                    parameter_name: 'company_name',
                                    text: '10 GRAM Sdn Bhd'
                                }
                            ]
                        },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type:'text',
                                    parameter_name: 'order_id',
                                    text: `${payload.order_id}`
                                },
                                {
                                    type:'text',
                                    parameter_name: 'order_items',
                                    text: `${payload.order_items}`
                                },
                                {
                                    type:'text',
                                    parameter_name: 'order_delivery',
                                    text: `${payload.order_delivery}`
                                },
                                {
                                    type:'text',
                                    parameter_name: 'order_total',
                                    text: `${payload.order_total}`
                                },
                                {
                                    type:'text',
                                    parameter_name: 'order_customer',
                                    text: `${payload.order_customer}`
                                },
                                {
                                    type:'text',
                                    parameter_name: 'order_link',
                                    text: `${payload.order_link}`
                                }
                            ]
                        }
                    ]
                }
            })
        })
        console.log(response)
        console.log(process.env.WHATSAPP_API_KEY)
    }
    catch(e){
        console.log(e)
    }

    return {
        statusCode: 200
    }
    
}