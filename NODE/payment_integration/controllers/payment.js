import Stripe from "stripe";
import paymentMethod from "../models/paymentModel.js"
import axios from "axios";
import qs from 'querystring';
import aesjs from "aes-js";
import mongoose from 'mongoose';
import paypal from 'paypal-rest-sdk'; 
import checkoutServerSdk from "@paypal/checkout-server-sdk";
import { Environment, Client } from "square";
import { URL } from "url";
const User = mongoose.model('User');

import braintree from "braintree";

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Use Environment.Production for live
    merchantId: 'f5mwzyx3cv7mvdpr',
    publicKey: 'zvwznhrn47y43rr7',
    privateKey: '6fdc367ef5555ac95a7a0ad2ed1b8bf4'
});

const checkOutEnviroment = new checkoutServerSdk.core.SandboxEnvironment('AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY', 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh');
const paypalClient = new checkoutServerSdk.core.PayPalHttpClient(checkOutEnviroment);

const environment = (key) => {
    const clientId = key?.publicKey;
    const clientSecret = key?.secretKey;
    return paypal.configure({
        mode: 'sandbox', // or 'live'
        client_id: clientId,
        client_secret: clientSecret
    });
    // return new PayPalHttpClient(new SandboxEnvironment(clientId,clientSecret));
    // return new paypal.core.SandboxEnvironment(clientId, clientSecret); // Use LiveEnvironment for production
};

const squareupClient = new Client({
    accessToken:'EAAAl72ICtL3Mtu2Wx6XkUoSbwEKmTH9Awr8uB6kCI5VAlJGYgViHtH5vBcKpOpN',
    environment:Environment.Sandbox,
})

const squareupPayments = squareupClient.paymentsApi;

const addMethodList = async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

const addMethod = async (req, res) => {
    try {
        const request = req?.body;
        let flag = false;
        if (request?.method == 'strip') {
            let result = await stripVerify(request?.keys?.secretKey);
            let chiave_segreta = generateKey();
            let publicKey = await encryptKeys(request?.keys?.publicKey, chiave_segreta)
            let secretKey = await encryptKeys(request?.keys?.secretKey, chiave_segreta)
            request.keys.publicKey = publicKey;
            request.keys.secretKey = secretKey;
            request.chiave_segreta = chiave_segreta;
            flag = result;
        }
        if (request?.method == 'paypal') {
            let result = await paypalVerification(request?.keys);
            let chiave_segreta = generateKey();
            let publicKey = await encryptKeys(request?.keys?.publicKey, chiave_segreta)
            let secretKey = await encryptKeys(request?.keys?.secretKey, chiave_segreta)
            request.keys.publicKey = publicKey;
            request.keys.secretKey = secretKey;
            request.chiave_segreta = chiave_segreta;
            flag = result;
        }
        if (request?.method == 'squareup') {
            let result = await squareupVerification(request?.keys);
            let chiave_segreta = generateKey();
            let publicKey = await encryptKeys(request?.keys?.publicKey, chiave_segreta)
            let secretKey = await encryptKeys(request?.keys?.secretKey, chiave_segreta)
            request.keys.publicKey = publicKey;
            request.keys.secretKey = secretKey;
            request.chiave_segreta = chiave_segreta;
            flag = result;
        }
        if (flag) {
            if (!request?.user_id) {
                request.user_id = req?.user?._id;
            }
            let data = await paymentMethod.create(request);
            if (request?.user_id) {
                await User.updateOne({ _id: request?.user_id }, { $set: { method_id: [new mongoose.Types.ObjectId(data?._id)] } })
            }
            return res.status(200).json({ status: true, message: "Added Successfully", data: data });
        } else {
            return res.status(500).json({ status: true, message: "Invalid credititals" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    }
}

const stripVerify = async (secretKey) => {
    try {
        const stripe = new Stripe(secretKey);
        const response = await stripe.balance.retrieve();
        if (response) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const paypalVerification = async (keys) => {
    const PAYPAL_API = 'https://api-m.sandbox.paypal.com/v1/oauth2/token'; // Use sandbox URL for testing
    const auth = Buffer.from(`${keys?.publicKey}:${keys?.secretKey}`).toString('base64');

    try {
        const response = await axios.post(PAYPAL_API, qs.stringify({ grant_type: 'client_credentials' }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            }
        });
        if (response?.status == 200) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const squareupVerification = async (keys) => {
    const SQUARE_API = 'https://connect.squareupsandbox.com/oauth2/token/status';
    try {
        const response = await axios.post(SQUARE_API, {}, {
            headers: {
                'Authorization': `Bearer ${keys?.secretKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (response?.status == 200) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log(error?.response?.data?.errors, "err")
        return false
    }
}

const decryptKeys = async (encryptedHex, key) => {
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    const keyBytes = aesjs.utils.utf8.toBytes(key);
    const aesEcb = new aesjs.ModeOfOperation.ecb(keyBytes);
    const decryptedBytes = aesEcb.decrypt(encryptedBytes);
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes).trim();
    return decryptedText;
};

const encryptKeys = async (text, key) => {
    const textBytes = aesjs.utils.utf8.toBytes(text);
    const keyBytes = aesjs.utils.utf8.toBytes(key);
    const paddedTextBytes = padFunction(textBytes, 16);
    const aesEcb = new aesjs.ModeOfOperation.ecb(keyBytes);
    const encryptedBytes = aesEcb.encrypt(paddedTextBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}

const generateKey = (keySize = 16) => {
    const keyBytes = new Uint8Array(keySize);
    for (let i = 0; i < keySize; i++) {
        keyBytes[i] = Math.floor(Math.random() * 256);
    }
    const keyHex = aesjs.utils.hex.fromBytes(keyBytes);
    return keyHex;
};

const padFunction = (data, blockSize = 16) => {
    const padding = blockSize - (data.length % blockSize);
    const paddedData = new Uint8Array(data.length + padding);
    paddedData.set(data);
    paddedData.fill(padding, data.length);
    return paddedData;
};


const list = async (req, res) => {
    try {
        let list = await paymentMethod.find({ status: true }, { method: 1 });
        return res.status(200).json({ status: true, message: "Payment Method list", list: list })
    } catch (error) {

    }
}

const paymentViaPaypal = async (details) => {
    let keys = {
        publicKey: await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
        secretKey: await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
    }
    const client = () => new paypal.core.PayPalHttpClient(environment(keys));
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');

    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: details?.amount
            }
        }],
        payment_source: {
            token: {
                id: details?.customer_id,
                type: 'BILLING_AGREEMENT'
            }
        }
    });
    try {
        const response = await client().execute(request);
        console.log('Order ID:', response.result.id);
        console.log('Status:', response.result.status);
        return response.result;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const paymentViaStrip = async (details) => {
    try {
        let secretKey = await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta);
        const stripe = new Stripe(secretKey);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(details?.amount * 100), // Stripe amounts are in cents
            currency: 'usd',
            customer: details?.customer_id,
            // Automatic payment method selection (requires a default payment method set on the customer)
            payment_method_types: ['card'],
            off_session: true, // Charge without active user session
            confirm: true, // Automatically confirm the payment
        });
        console.log('Payment successful:', paymentIntent.id);
        return paymentIntent;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const paymentViaSqureUp = async (details) => {
    try {
        let secretKey = await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta);
        const client = new Client({
            accessToken: secretKey,
            environment: Environment.Sandbox, // Change to Environment.Production for live environment
        });

        const customersApi = client.customersApi;
        const customerResponse = await customersApi.retrieveCustomer(details?.customer_id);

        const customer = customerResponse.result.customer;
        if (!customer || !customer.cards || customer.cards.length === 0) {
            return false;
        }

        // Use the first card on file for the customer (you can choose a different card if needed)
        const cardId = customer.cards[0].id;

        // Create a payment
        const paymentsApi = client.paymentsApi;
        const paymentResponse = await paymentsApi.createPayment({
            sourceId: cardId,
            idempotencyKey: `${details?.customer_id}-${Date.now()}`, // Ensure unique idempotency key
            amountMoney: {
                amount: Math.round(details?.amount * 100), // Square expects amount in cents
                currency: 'USD',
            },
            customerId: details?.customer_id,
            autocomplete: true, // Automatically complete the payment
        });
        console.log('Payment successful:', paymentResponse.result.payment.id);
        return paymentResponse.result.payment;
    } catch (error) {
        console.log(error)
        return false;
    }
}

const addCardPaypal = async (req, res) => {
    try {
        let request = req?.body;
        let keys = {
            publicKey: 'AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY',//await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
            secretKey: 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh'//await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
        }
        // const client = () => new paypal.core.PayPalHttpClient(environment(keys));
        const client = environment(keys);

        let card = await saveCardFunction(request)
        return res.status(200).json({ status: false, messgae: "Card Added Successfull", card: card })

    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

const saveCardFunction = (cardDetails) => {
    return new Promise(async (resolve, reject) => {
        await paypal.creditCard.create(cardDetails, function (error, card) {
            if (error) {
                console.log("error:", error);
                reject(error)
            } else {
                console.log("card:", card);
                resolve(card);

            }
        });
    })
}

const paypalCharges = async (req, res) => {
    try {
        let request = req?.body;
        let keys = {
            publicKey: 'AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY',//await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
            secretKey: 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh'//await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
        }
        // const client = () => new paypal.core.PayPalHttpClient(environment(keys));
        const client = environment(keys);
        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: 'https://your-site.com/success',
                cancel_url: 'https://your-site.com/cancel'
            },
            transactions: [{
                item_list: {
                    items: [{
                        name: 'Sample Item',
                        sku: '001',
                        price: '100.00',
                        currency: 'USD',
                        quantity: 1
                    }]
                },
                amount: {
                    currency: 'USD',
                    total: '100.00'
                },
                description: 'Payment for sample item.'
            }]
        };
        let result = await paypalPayFunction(create_payment_json);
        return res.status(200).json({ status: false, messgae: "Payment Successfull", result })

    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

const paypalPayFunction = (paymentData) => {
    console.log(paymentData);
    return new Promise(async (resolve, reject) => {
        await paypal.payment.create(paymentData, async (error, payment) => {
            if (error) {
                console.log("error---1:", error.message);
                reject(error)
            } else {
                console.log("card:", payment);
                // const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                // const parsedUrl = new URL(approvalUrl);
                // const payer = parsedUrl.searchParams.get('PayerID');
                // const execute_payment_json = {
                //     payer_id: '2NLURVBN7GC5L',
                //     transactions: [{
                //         amount: {
                //             currency: 'USD',
                //             total: '25.00'
                //         }
                //     }]
                // };
                // console.log(payer, "PayerID", execute_payment_json)
                // paypal.payment.execute(payment?.id, execute_payment_json, (error, payment) => {
                //     if (error) {
                //         console.log("error:", error.message);
                //         reject(error)
                //     } else {
                //         console.log("payment:", payment);
                //         resolve(payment);
                //     }
                // });
                // await paymentCapture({ id: payment?.id, amount: "25.00",payer:payer })
                resolve(payment);

            }
        });
    })
}

const paymentCapture = (req, res) => {
    let PayerID = req?.query?.PayerID;
    let paymentId = req?.query?.paymentId;
    let keys = {
        publicKey: 'AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY',//await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
        secretKey: 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh'//await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
    }
    // const client = () => new paypal.core.PayPalHttpClient(environment(keys));
    const client = environment(keys);
    console.log(PayerID, 'check', paymentId)
    return new Promise(async (resolve, reject) => {
        const execute_payment_json = {
            payer_id: PayerID,
            transactions: [{
                amount: {
                    currency: 'USD',
                    total: '125.00'
                }
            }]
        };
        await paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
            if (error) {
                console.log("error:", error);
                res.status(500).json({ success: false });
            } else {
                res.status(200).json({ success: true, payment });
            }
        });
    })
}

// BrainTree
const clientToken = async (req, res) => {
    try {
        gateway.clientToken.generate({}, (err, response) => {
            if (err) {
                return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
            } else {
                return res.status(200).json({ status: false, messgae: "Payment Successfull", clientToken: response.clientToken })
            }
        });
    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

const capturePayment = async (req, res) => {
    try {
        const { amount, nonce } = req.body;

        const result = await gateway.transaction.sale({
            amount: amount,
            paymentMethodNonce: nonce, // Use a test nonce here
            options: {
                submitForSettlement: true // Automatically settle the transaction
            }
        });
        if (result.success) {
            return res.status(200).json({ status: true, messgae: "Payment Successfull", transactionId: result.transaction })
        } else {
            return res.status(500).json({ status: false, messgae: result.message })
        }
    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'USD', description } = req.body;
        let keys = {
            publicKey: 'AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY',//await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
            secretKey: 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh'//await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
        }
        // const client = environment(keys);
        const request = new checkoutServerSdk.orders.OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: '120.00'
                }
              }
            ],
            application_context: {
              return_url: 'https://your-return-url.com',
              cancel_url: 'https://your-cancel-url.com'
            }
          });
        
        // console.log(paypal,"client")
        const order = await paypalClient.execute(request);
        // checkoutServerSdk.order.create(create_payment_json, (error, order) => {
        //     if (error) {
        //         console.error('Error creating order:', error);
        //         return res.status(500).json({ error: 'Error creating order' });
        //     }
            return res.status(200).json({ status: false, messgae: "Payment Successfull", orderID: order })

        // });
    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

const chargeByOrderID = async (req, res) => {
    try {
        const { orderID } = req.body;
        let keys = {
            publicKey: 'AU7PAFXUf6RQz3srx0uxkqjTK9AhPA2M4j2P5WpmBmzqPzOOtrkwqXtgP8LO-g2gRVj5dihvxwRTnYyY',//await decryptKeys(details?.keys?.publicKey, details?.chiave_segreta),
            secretKey: 'EBanGtgFTH1us2qcvYAAELpagVnzm6hgAk9wPRncvMiQa5XmGIhVPlpRXC8aebOlU5NsH_FqxhcfPqoh'//await decryptKeys(details?.keys?.secretKey, details?.chiave_segreta)
        }
        // const client = environment(keys);
        const request = new checkoutServerSdk.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        // const captureResponse = await new Promise((resolve, reject) => {
        //     paypal.order.get(orderID, (error, order) => {
        //         if (error) {
        //             console.error('Error getting order:', error);
        //             return reject(error);
        //         }
        //         if (order.intent !== 'CAPTURE') {
        //             return reject(new Error('Order intent is not CAPTURE'));
        //         }
        //         client.order.capture(orderID, {}, (error, capture) => {
        //             if (error) {
        //                 console.error('Error capturing payment:', error);
        //                 return reject(error);
        //             }
        //             resolve(capture);
        //         });
        //     });
        // });
        const capture = await paypalClient.execute(request);
        return res.status(200).json({ status: false, messgae: "Payment Successfull", captureResponse: capture })

    } catch (error) {
        console.error("Error storing card:", error);
        return res.status(500).json({ status: false, messgae: "SomeThing Went Wrong" })
    }
}

// squareup payment token = 4YVO6BV5E6TNF53GACSXS5DS5LAI75ZPAXR36RCGA7E75UCATCZY7IEWDIKBK32JV7NLRZKYHC2FA4KXCS7NSQ6SK65ZVUM6AGRQ

const chargesViaSquarUp = async (req, res) => {
    try {
      const { sourceId, amount } = req.body;
  
      // Ensure that sourceId and amount are present
      if (!sourceId || !amount) {
        return res.status(400).json({ status: false, message: "sourceId and amount are required" });
      }
  
      const response = await squareupPayments.createPayment({
        sourceId: sourceId, // This is the token (nonce) from the frontend
        idempotencyKey: Date.now().toString(), // Convert to string (milliseconds since 1970)
        amountMoney: {
          amount: Math.round(amount * 100), // Amount in the smallest currency unit (e.g., cents)
          currency: 'USD',  // Use the correct currency
        },
      });
      console.log(response.result.payment.id,"responseresponseresponse")
      return res.status(200).json({ status: true, message: "Payment Successful", response:response.result.payment.id });
  
    } catch (error) {
      console.error("Error processing payment:", error);
      return res.status(500).json({ status: false, message: "Something went wrong", error });
    }
  };
  

export default {
    addMethodList,
    addMethod,
    list,
    paymentViaPaypal,
    paymentViaStrip,
    paymentViaSqureUp,
    addCardPaypal,
    paypalCharges,
    paymentCapture,
    clientToken,
    capturePayment,
    createOrder,
    chargeByOrderID,
    chargesViaSquarUp
}